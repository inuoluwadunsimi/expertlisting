import { GeoBucketRepository } from '../repositories/GeoBucketRepository';

export class GeoBucketService {
  private geoBucketRepo: GeoBucketRepository;

  constructor() {
    this.geoBucketRepo = new GeoBucketRepository();
  }

  async getBucketStats() {
    const bucketsWithCounts =
      await this.geoBucketRepo.getBucketsWithPropertyCounts();

    const totalBuckets = bucketsWithCounts.length;
    const totalProperties = bucketsWithCounts.reduce(
      (sum, item) => sum + item.propertyCount,
      0
    );

    const propertiesPerBucket = bucketsWithCounts.map((item) => ({
      bucketId: item.bucket.id,
      geohashPrefix: item.bucket.geohash_prefix,
      propertyCount: item.propertyCount,
    }));

    const emptyBuckets = bucketsWithCounts.filter(
      (item) => item.propertyCount === 0
    ).length;

    const averagePropertiesPerBucket =
      totalBuckets > 0 ? totalProperties / totalBuckets : 0;

    const maxPropertiesInBucket = Math.max(
      ...bucketsWithCounts.map((item) => item.propertyCount),
      0
    );

    const minPropertiesInBucket = Math.min(
      ...bucketsWithCounts
        .filter((item) => item.propertyCount > 0)
        .map((item) => item.propertyCount),
      0
    );

    return {
      totalBuckets,
      totalProperties,
      emptyBuckets,
      activeBuckets: totalBuckets - emptyBuckets,
      averagePropertiesPerBucket:
        Math.round(averagePropertiesPerBucket * 100) / 100,
      maxPropertiesInBucket,
      minPropertiesInBucket:
        emptyBuckets === totalBuckets ? 0 : minPropertiesInBucket,
      coverage: {
        bucketsWithProperties: totalBuckets - emptyBuckets,
        coveragePercentage:
          totalBuckets > 0
            ? Math.round(
                ((totalBuckets - emptyBuckets) / totalBuckets) * 10000
              ) / 100
            : 0,
      },
      bucketDistribution: propertiesPerBucket.sort(
        (a, b) => b.propertyCount - a.propertyCount
      ),
    };
  }
}
