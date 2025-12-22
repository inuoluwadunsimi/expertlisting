import { GeoBucketRepository } from '../repositories/GeoBucketRepository';
import { PropertyRepository } from '../repositories/PropertyRepository';
import {
  getGeohashPrefix,
  encodeGeohash,
  validateCoordinates,
  createPostGISPoint,
} from '../helpers/geohash.utils';
import { normalizeLocationName } from '../helpers/location.utils';
import { Property } from '../entities/Property.entity';
import { NotFoundError } from '../interfaces';
import { areLocationsSimilar } from '../helpers/location.utils';

export interface CreatePropertyDTO {
  title: string;
  location_name: string;
  latitude: number;
  longitude: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
}

export class PropertyService {
  private propertyRepo: PropertyRepository;
  private geoBucketRepo: GeoBucketRepository;

  constructor() {
    this.propertyRepo = new PropertyRepository();
    this.geoBucketRepo = new GeoBucketRepository();
  }

  async createProperty(data: CreatePropertyDTO): Promise<Property> {
    if (!validateCoordinates(data.latitude, data.longitude)) {
      throw new NotFoundError('Invalid coordinates');
    }

    // Generate geohash from coordinates

    const geohash = encodeGeohash(data.latitude, data.longitude, 9);

    const geohashPrefix = getGeohashPrefix(data.latitude, data.longitude);

    const normalizedLocationName = normalizeLocationName(data.location_name);

    // Find or create geo-bucket
    const bucket = await this.geoBucketRepo.findOrCreate(geohashPrefix);

    // Create PostGIS point for coordinates
    const coordinates = createPostGISPoint(data.latitude, data.longitude);

    // Create property
    const property = await this.propertyRepo.createAndSave({
      title: data.title,
      location_name: data.location_name,
      normalized_location_name: normalizedLocationName,
      latitude: data.latitude,
      longitude: data.longitude,
      geohash: geohash,
      coordinates: coordinates,
      price: data.price,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      bucket_id: bucket.id,
    });

    return property;
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: string): Promise<Property | null> {
    return this.propertyRepo.findByIdWithBucket(id);
  }

  /**
   * Get all properties with pagination
   */
  async getAllProperties(
    limit: number = 10,
    offset: number = 0
  ): Promise<Property[]> {
    return this.propertyRepo.findAllWithBuckets({ limit, offset });
  }

  /**
   * Search properties by location
   */
  async searchProperties(params: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    limit?: number;
    offset?: number;
  }) {
    const normalizedLocation = params.location
      ? normalizeLocationName(params.location)
      : undefined;

    return this.propertyRepo.searchByLocation({
      normalizedLocationName: normalizedLocation,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      limit: params.limit || 10,
      offset: params.offset || 0,
    });
  }

  /**
   * Search properties by location using geo-buckets
   * Implements efficient geo-bucket lookup with fuzzy matching
   */
  async searchByLocation(
    location: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ properties: Property[]; total: number }> {
    const normalizedLocation = normalizeLocationName(location);

    let bucketIds: string[] = [];

    const sampleProperties = await this.propertyRepo.findByNormalizedLocation(
      normalizedLocation
    );

    if (sampleProperties.length > 0) {
      bucketIds = Array.from(new Set(sampleProperties.map((p) => p.bucket_id)));
    }

    if (bucketIds.length === 0 && normalizedLocation.length >= 3) {
      const allProperties = await this.propertyRepo.findAll({
        select: ['normalized_location_name', 'bucket_id'] as any,
      });

      const similarBucketIds = new Set<string>();

      allProperties.forEach((prop) => {
        if (
          areLocationsSimilar(
            normalizedLocation,
            prop.normalized_location_name,
            2
          )
        ) {
          similarBucketIds.add(prop.bucket_id);
        }
      });

      bucketIds = Array.from(similarBucketIds);
    }

    if (bucketIds.length > 0) {
      const queryBuilder = this.propertyRepo
        .getRepository()
        .createQueryBuilder('property')
        .leftJoinAndSelect('property.bucket', 'geo_bucket')
        .where('property.bucket_id IN (:...bucketIds)', { bucketIds })
        .orderBy('property.created_at', 'DESC');

      const total = await queryBuilder.getCount();

      const properties = await queryBuilder.skip(offset).take(limit).getMany();

      return {
        properties,
        total,
      };
    }

    return {
      properties: [],
      total: 0,
    };
  }
}
