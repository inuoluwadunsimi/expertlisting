import { FindOptionsWhere } from 'typeorm';
import { GenericRepository } from './GenericRepository';
import { Property } from '../entities/Property.entity';

/**
 * Repository for Property entity
 * Provides property-specific query methods including geospatial searches
 */
export class PropertyRepository extends GenericRepository<Property> {
  constructor() {
    super(Property);
  }

  async findByBucketId(bucketId: string): Promise<Property[]> {
    return this.findBy({ bucket_id: bucketId } as FindOptionsWhere<Property>);
  }

  async findByBucketIds(bucketIds: string[]): Promise<Property[]> {
    return this.repository
      .createQueryBuilder('property')
      .where('property.bucket_id IN (:...bucketIds)', { bucketIds })
      .getMany();
  }

  /**
   * Find properties by geohash prefix
   */
  async findByGeohash(geohash: string): Promise<Property[]> {
    return this.repository
      .createQueryBuilder('property')
      .where('property.geohash LIKE :geohash', { geohash: `${geohash}%` })
      .getMany();
  }

  async findByNormalizedLocation(
    normalizedLocationName: string
  ): Promise<Property[]> {
    return this.findBy({
      normalized_location_name: normalizedLocationName,
    } as FindOptionsWhere<Property>);
  }

  async searchByLocation(params: {
    normalizedLocationName?: string;
    geohashPrefixes?: string[];
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ properties: Property[]; total: number }> {
    const query = this.repository.createQueryBuilder('property');

    // Filter by normalized location name
    if (params.normalizedLocationName) {
      query.andWhere('property.normalized_location_name = :location', {
        location: params.normalizedLocationName,
      });
    }

    // Filter by geohash prefixes (for geo-bucket search)
    if (params.geohashPrefixes && params.geohashPrefixes.length > 0) {
      const geohashConditions = params.geohashPrefixes
        .map((_, index) => `property.geohash LIKE :geohash${index}`)
        .join(' OR ');

      query.andWhere(`(${geohashConditions})`);

      params.geohashPrefixes.forEach((prefix, index) => {
        query.setParameter(`geohash${index}`, `${prefix}%`);
      });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    if (params.limit) {
      query.limit(params.limit);
    }
    if (params.offset) {
      query.offset(params.offset);
    }

    // Order by created_at (newest first)
    query.orderBy('property.created_at', 'DESC');

    const properties = await query.getMany();

    return { properties, total };
  }

  /**
   * Get property with its bucket information
   */
  async findByIdWithBucket(id: string): Promise<Property | null> {
    return this.repository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.bucket', 'geo_bucket')
      .where('property.id = :id', { id })
      .getOne();
  }

  /**
   * Get properties with their bucket information
   */
  async findAllWithBuckets(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Property[]> {
    const query = this.repository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.bucket', 'geo_bucket')
      .orderBy('property.created_at', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }
    if (options?.offset) {
      query.offset(options.offset);
    }

    return query.getMany();
  }

  /**
   * Update property location and geohash
   */
  async updateLocation(
    id: string,
    latitude: number,
    longitude: number,
    geohash: string,
    bucketId: string
  ): Promise<Property | null> {
    await this.repository.update(id, {
      latitude,
      longitude,
      geohash,
      bucket_id: bucketId,
    } as any);

    return this.findById(id);
  }
}
