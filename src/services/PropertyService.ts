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
    // Normalize the search location
    const normalizedLocation = normalizeLocationName(location);

    // First, try exact match on normalized location
    let result = await this.propertyRepo.searchByLocation({
      normalizedLocationName: normalizedLocation,
      limit,
      offset,
    });

    // If no results and location is long enough, try fuzzy matching
    if (result.total === 0 && normalizedLocation.length >= 3) {
      // Get all unique normalized locations from properties
      const allProperties = await this.propertyRepo.findAll({
        select: ['normalized_location_name'] as any,
      });

      // Find similar locations using fuzzy matching
      const { areLocationsSimilar } = await import('../helpers/location.utils');
      const similarLocations = new Set<string>();

      allProperties.forEach((prop) => {
        if (
          areLocationsSimilar(
            normalizedLocation,
            prop.normalized_location_name,
            2
          )
        ) {
          similarLocations.add(prop.normalized_location_name);
        }
      });

      // If we found similar locations, search for properties in those locations
      if (similarLocations.size > 0) {
        const queries = Array.from(similarLocations).map((loc) =>
          this.propertyRepo.searchByLocation({
            normalizedLocationName: loc,
            limit: 1000, // Get all from similar locations
            offset: 0,
          })
        );

        const results = await Promise.all(queries);
        const allProps = results.flatMap((r) => r.properties);
        const total = allProps.length;

        // Apply pagination to combined results
        const paginatedProps = allProps.slice(offset, offset + limit);

        result = {
          properties: paginatedProps,
          total,
        };
      }
    }

    return result;
  }
}
