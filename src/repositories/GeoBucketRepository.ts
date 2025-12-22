import { FindOptionsWhere } from 'typeorm';
import { GenericRepository } from './GenericRepository';
import { GeoBucket } from '../entities/GeoBucket.entity';

/**
 * Repository for GeoBucket entity
 * Provides geohash-specific query methods
 */
export class GeoBucketRepository extends GenericRepository<GeoBucket> {
  constructor() {
    super(GeoBucket);
  }

  /**
   * Find a bucket by geohash prefix
   */
  async findByGeohashPrefix(geohashPrefix: string): Promise<GeoBucket | null> {
    return this.findOne({ geohash_prefix: geohashPrefix } as FindOptionsWhere<GeoBucket>);
  }

  /**
   * Find buckets by multiple geohash prefixes
   * Useful for searching adjacent geohashes
   */
  async findByGeohashPrefixes(geohashPrefixes: string[]): Promise<GeoBucket[]> {
    return this.repository
      .createQueryBuilder('geo_bucket')
      .where('geo_bucket.geohash_prefix IN (:...prefixes)', { prefixes: geohashPrefixes })
      .getMany();
  }

  /**
   * Find or create a bucket by geohash prefix
   */
  async findOrCreate(geohashPrefix: string): Promise<GeoBucket> {
    let bucket = await this.findByGeohashPrefix(geohashPrefix);
    
    if (!bucket) {
      bucket = await this.createAndSave({ geohash_prefix: geohashPrefix });
    }
    
    return bucket;
  }

  /**
   * Get all buckets with their property counts
   */
  async getBucketsWithPropertyCounts(): Promise<Array<{ bucket: GeoBucket; propertyCount: number }>> {
    const results = await this.repository
      .createQueryBuilder('geo_bucket')
      .leftJoinAndSelect('geo_bucket.properties', 'property')
      .loadRelationCountAndMap('geo_bucket.propertyCount', 'geo_bucket.properties')
      .getMany();

    return results.map(bucket => ({
      bucket,
      propertyCount: (bucket as any).propertyCount || 0
    }));
  }

  /**
   * Delete empty buckets (buckets with no properties)
   */
  async deleteEmptyBuckets(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('geo_bucket')
      .leftJoin('geo_bucket.properties', 'property')
      .where('property.id IS NULL')
      .delete()
      .execute();

    return result.affected ?? 0;
  }
}
