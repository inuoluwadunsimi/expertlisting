import request from 'supertest';
import app from '../src/app';
import { AppDataSource } from '../src/data-source';

describe('Location Search Integration Tests', () => {
  let createdPropertyIds: string[] = [];

  beforeAll(async () => {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    // Clean up created properties
    if (createdPropertyIds.length > 0) {
      const propertyRepo = AppDataSource.getRepository('Property');
      await propertyRepo.delete(createdPropertyIds);
    }

    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('Property Creation with Location Normalization', () => {
    test('Should create property with location "Sangotedo"', async () => {
      const response = await request(app)
        .post('/api/properties')
        .send({
          title: 'Modern 2BR Apartment',
          location_name: 'Sangotedo',
          latitude: 6.4698,
          longitude: 3.6285,
          price: 120000000,
          bedrooms: 2,
          bathrooms: 2,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.location_name).toBe('Sangotedo');
      expect(response.body.data.normalized_location_name).toBe('sangotedo');
      expect(response.body.data).toHaveProperty('bucket_id');

      createdPropertyIds.push(response.body.data.id);
    });

    test('Should create property with location "Sangotedo, Ajah"', async () => {
      const response = await request(app)
        .post('/api/properties')
        .send({
          title: 'Luxury 3BR Duplex',
          location_name: 'Sangotedo, Ajah',
          latitude: 6.472,
          longitude: 3.6301,
          price: 180000000,
          bedrooms: 3,
          bathrooms: 3,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.location_name).toBe('Sangotedo, Ajah');
      expect(response.body.data.normalized_location_name).toBe('sangotedo');
      expect(response.body.data).toHaveProperty('bucket_id');

      createdPropertyIds.push(response.body.data.id);
    });

    test('Should create property with location "sangotedo lagos"', async () => {
      const response = await request(app)
        .post('/api/properties')
        .send({
          title: 'Spacious 4BR House',
          location_name: 'sangotedo lagos',
          latitude: 6.4705,
          longitude: 3.629,
          price: 250000000,
          bedrooms: 4,
          bathrooms: 4,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.location_name).toBe('sangotedo lagos');
      expect(response.body.data.normalized_location_name).toBe('sangotedo');
      expect(response.body.data).toHaveProperty('bucket_id');

      createdPropertyIds.push(response.body.data.id);
    });
  });

  describe('Location Search - Exact Match', () => {
    test('Should return all 3 properties when searching for "sangotedo"', async () => {
      const response = await request(app)
        .get('/api/properties/search')
        .query({ location: 'sangotedo' })
        .expect(200);

      expect(response.body.data.total).toBeGreaterThanOrEqual(3);
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data.properties.length).toBeGreaterThanOrEqual(3);

      // Verify all properties have normalized_location_name as "sangotedo"
      const sangotedoProperties = response.body.data.properties.filter(
        (p: any) => p.normalized_location_name === 'sangotedo'
      );
      expect(sangotedoProperties.length).toBeGreaterThanOrEqual(3);

      // Verify our created properties are in the results
      const titles = response.body.data.properties.map((p: any) => p.title);
      expect(titles).toContain('Modern 2BR Apartment');
      expect(titles).toContain('Luxury 3BR Duplex');
      expect(titles).toContain('Spacious 4BR House');
    });
  });

  describe('Location Search - Case Insensitive', () => {
    test('Should return all 3 properties when searching for "SANGOTEDO"', async () => {
      const response = await request(app)
        .get('/api/properties/search')
        .query({ location: 'SANGOTEDO' })
        .expect(200);

      expect(response.body.data.total).toBeGreaterThanOrEqual(3);
      expect(response.body.data.properties.length).toBeGreaterThanOrEqual(3);

      // Verify case-insensitive matching works
      const titles = response.body.data.properties.map((p: any) => p.title);
      expect(titles).toContain('Modern 2BR Apartment');
      expect(titles).toContain('Luxury 3BR Duplex');
      expect(titles).toContain('Spacious 4BR House');
    });

    test('Should return all 3 properties when searching for "SaNgOtEdO"', async () => {
      const response = await request(app)
        .get('/api/properties/search')
        .query({ location: 'SaNgOtEdO' })
        .expect(200);

      expect(response.body.data.total).toBeGreaterThanOrEqual(3);
      expect(response.body.data.properties.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Location Search - Typo Tolerant', () => {
    test('Should return properties when searching for "sangotdo" (missing "e")', async () => {
      const response = await request(app)
        .get('/api/properties/search')
        .query({ location: 'sangotdo' })
        .expect(200);

      // Fuzzy matching should find "sangotedo"
      expect(response.body.data.total).toBeGreaterThanOrEqual(3);
      expect(response.body.data.properties.length).toBeGreaterThanOrEqual(3);

      const titles = response.body.data.properties.map((p: any) => p.title);
      expect(titles).toContain('Modern 2BR Apartment');
    });

    test('Should return properties when searching for "sangoted" (missing "o")', async () => {
      const response = await request(app)
        .get('/api/properties/search')
        .query({ location: 'sangoted' })
        .expect(200);

      // Fuzzy matching with Levenshtein distance <= 2
      expect(response.body.data.total).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Geo-Bucket Verification', () => {
    test('Should show properties are assigned to geo-buckets', async () => {
      const response = await request(app)
        .get('/api/geo-buckets/stats')
        .expect(200);

      expect(response.body.data).toHaveProperty('totalBuckets');
      expect(response.body.data).toHaveProperty('totalProperties');
      expect(response.body.data).toHaveProperty('activeBuckets');
      expect(response.body.data.totalProperties).toBeGreaterThanOrEqual(3);
      expect(response.body.data.activeBuckets).toBeGreaterThan(0);
    });

    test('All 3 properties should be in same or nearby geo-buckets', async () => {
      const response = await request(app)
        .get('/api/properties/search')
        .query({ location: 'sangotedo' })
        .expect(200);

      const properties = response.body.data.properties.filter(
        (p: any) => p.normalized_location_name === 'sangotedo'
      );

      // Extract unique bucket IDs
      const bucketIds = new Set(properties.map((p: any) => p.bucket_id));

      // Properties with close coordinates should be in same or nearby buckets
      // Since coordinates are very close, expect 1-3 buckets max
      expect(bucketIds.size).toBeLessThanOrEqual(3);
    });
  });

  describe('Pagination', () => {
    test('Should support pagination with limit and offset', async () => {
      const response = await request(app)
        .get('/api/properties/search')
        .query({ location: 'sangotedo', limit: 2, offset: 0 })
        .expect(200);

      expect(response.body.data.properties.length).toBeLessThanOrEqual(2);
      expect(response.body.data.limit).toBe(2);
      expect(response.body.data.offset).toBe(0);
    });
  });

  describe('Validation', () => {
    test('Should reject search with location less than 2 characters', async () => {
      const response = await request(app)
        .get('/api/properties/search')
        .query({ location: 's' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
    });

    test('Should reject property creation with invalid coordinates', async () => {
      const response = await request(app)
        .post('/api/properties')
        .send({
          title: 'Invalid Property',
          location_name: 'Test',
          latitude: 100, // Invalid: > 90
          longitude: 3.6285,
          price: 100000,
          bedrooms: 2,
          bathrooms: 2,
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
    });
  });
});
