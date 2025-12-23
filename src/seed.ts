import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { Property } from './entities/Property.entity';
import { GeoBucket } from './entities/GeoBucket.entity';
import { encodeGeohash, getGeohashPrefix } from './helpers/geohash.utils';
import { normalizeLocationName } from './helpers/location.utils';

interface PropertySeedData {
  title: string;
  location_name: string;
  latitude: number;
  longitude: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
}

const seedData: PropertySeedData[] = [
  // Sangotedo properties (for testing location search)
  {
    title: 'Modern 2BR Apartment in Sangotedo',
    location_name: 'Sangotedo',
    latitude: 6.4698,
    longitude: 3.6285,
    price: 120000000,
    bedrooms: 2,
    bathrooms: 2,
  },
  {
    title: 'Luxury 3BR Duplex',
    location_name: 'Sangotedo, Ajah',
    latitude: 6.472,
    longitude: 3.6301,
    price: 180000000,
    bedrooms: 3,
    bathrooms: 3,
  },
  {
    title: 'Spacious 4BR House',
    location_name: 'sangotedo lagos',
    latitude: 6.4705,
    longitude: 3.629,
    price: 250000000,
    bedrooms: 4,
    bathrooms: 4,
  },
  {
    title: 'Cozy 1BR Studio',
    location_name: 'Sangotedo, Lekki',
    latitude: 6.4715,
    longitude: 3.6295,
    price: 80000000,
    bedrooms: 1,
    bathrooms: 1,
  },
  {
    title: 'Executive 5BR Mansion',
    location_name: 'SANGOTEDO',
    latitude: 6.4688,
    longitude: 3.6275,
    price: 450000000,
    bedrooms: 5,
    bathrooms: 5,
  },

  {
    title: 'Waterfront 3BR Apartment',
    location_name: 'Lekki Phase 1',
    latitude: 6.4474,
    longitude: 3.4739,
    price: 200000000,
    bedrooms: 3,
    bathrooms: 3,
  },
  {
    title: 'Penthouse Suite',
    location_name: 'Lekki Phase 2',
    latitude: 6.4423,
    longitude: 3.5064,
    price: 350000000,
    bedrooms: 4,
    bathrooms: 4,
  },

  {
    title: 'Luxury 4BR Apartment',
    location_name: 'Ikoyi',
    latitude: 6.4541,
    longitude: 3.4316,
    price: 500000000,
    bedrooms: 4,
    bathrooms: 5,
  },
  {
    title: 'Premium 3BR Flat',
    location_name: 'Old Ikoyi',
    latitude: 6.4598,
    longitude: 3.4289,
    price: 300000000,
    bedrooms: 3,
    bathrooms: 3,
  },

  {
    title: 'Corporate 2BR Apartment',
    location_name: 'Victoria Island',
    latitude: 6.4281,
    longitude: 3.4219,
    price: 250000000,
    bedrooms: 2,
    bathrooms: 2,
  },
  {
    title: 'Beachfront 5BR Villa',
    location_name: 'Victoria Island, Lagos',
    latitude: 6.4236,
    longitude: 3.4172,
    price: 800000000,
    bedrooms: 5,
    bathrooms: 6,
  },

  // Ajah properties
  {
    title: 'Affordable 2BR Flat',
    location_name: 'Ajah',
    latitude: 6.4667,
    longitude: 3.5833,
    price: 90000000,
    bedrooms: 2,
    bathrooms: 2,
  },
  {
    title: 'Family 3BR House',
    location_name: 'Ajah, Lagos',
    latitude: 6.4689,
    longitude: 3.5856,
    price: 150000000,
    bedrooms: 3,
    bathrooms: 3,
  },

  {
    title: 'Central 3BR Apartment',
    location_name: 'Ikeja GRA',
    latitude: 6.5964,
    longitude: 3.3515,
    price: 180000000,
    bedrooms: 3,
    bathrooms: 3,
  },
  {
    title: 'Business District 2BR',
    location_name: 'Ikeja',
    latitude: 6.6018,
    longitude: 3.3515,
    price: 140000000,
    bedrooms: 2,
    bathrooms: 2,
  },
];

async function seed() {
  try {
    console.log(' Starting database seed...');

    // Initialize database connection
    await AppDataSource.initialize();
    console.log(' Database connection established');

    const propertyRepo = AppDataSource.getRepository(Property);
    const geoBucketRepo = AppDataSource.getRepository(GeoBucket);

    // Clear existing data
    console.log(' Clearing existing data...');
    await propertyRepo.delete({});
    await geoBucketRepo.delete({});
    console.log(' Existing data cleared');

    // Seed properties
    console.log(`\n Seeding ${seedData.length} properties...`);

    for (const data of seedData) {
      // Generate geohash
      const geohash = encodeGeohash(data.latitude, data.longitude, 9);
      const geohashPrefix = getGeohashPrefix(data.latitude, data.longitude);

      // Normalize location name
      const normalizedLocationName = normalizeLocationName(data.location_name);

      // Find or create geo-bucket
      let bucket = await geoBucketRepo.findOne({
        where: { geohash_prefix: geohashPrefix },
      });

      if (!bucket) {
        bucket = geoBucketRepo.create({ geohash_prefix: geohashPrefix });
        await geoBucketRepo.save(bucket);
        console.log(`  ✨ Created geo-bucket: ${geohashPrefix}`);
      }

      // Create property
      const property = propertyRepo.create({
        title: data.title,
        location_name: data.location_name,
        normalized_location_name: normalizedLocationName,
        latitude: data.latitude,
        longitude: data.longitude,
        geohash: geohash,
        price: data.price,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        bucket_id: bucket.id,
      });

      await propertyRepo.save(property);
      console.log(
        `   Created: ${data.title} (${normalizedLocationName}) - Bucket: ${geohashPrefix}`
      );
    }

    // Print summary
    const totalProperties = await propertyRepo.count();
    const totalBuckets = await geoBucketRepo.count();

    console.log('\n Seed Summary:');
    console.log(`  Total Properties: ${totalProperties}`);
    console.log(`  Total Geo-Buckets: ${totalBuckets}`);

    // Show Sangotedo properties
    const sangotedoProperties = await propertyRepo.find({
      where: { normalized_location_name: 'sangotedo' },
    });

    console.log(`\n🎯 Sangotedo Properties: ${sangotedoProperties.length}`);
    sangotedoProperties.forEach((p) => {
      console.log(`  - ${p.title} (${p.location_name})`);
    });

    console.log('\n Database seeding completed successfully!');

    await AppDataSource.destroy();
  } catch (error) {
    console.error(' Error seeding database:', error);
    process.exit(1);
  }
}

seed();
