import * as geohash from 'ngeohash';

/**
 * Generate geohash from latitude and longitude

 */
export function encodeGeohash(
  latitude: number,
  longitude: number,
  precision: number = 7
): string {
  return geohash.encode(latitude, longitude, precision);
}

/**
 * Decode geohash to latitude and longitude
 * @param hash - Geohash string
 * @returns Object with latitude and longitude
 */
export function decodeGeohash(hash: string): {
  latitude: number;
  longitude: number;
} {
  const decoded = geohash.decode(hash);
  return decoded;
}

/**
 * Get geohash prefix for bucket assignment
 * Uses precision 7 for neighborhood-sized areas (~150-300m)
 */
export function getGeohashPrefix(latitude: number, longitude: number): string {
  return encodeGeohash(latitude, longitude, 7);
}

/**
 * Get adjacent geohashes for edge-case handling
 */
export function getAdjacentGeohashes(hash: string): string[] {
  const neighbors = geohash.neighbors(hash) as any;
  return [
    hash,
    neighbors.n, // north
    neighbors.ne, // northeast
    neighbors.e, // east
    neighbors.se, // southeast
    neighbors.s, // south
    neighbors.sw, // southwest
    neighbors.w, // west
    neighbors.nw, // northwest
  ];
}

/**
 * Get bounding box for a geohash
 */
export function getGeohashBounds(hash: string): {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
} {
  const bbox = geohash.decode_bbox(hash);
  return {
    minLat: bbox[0],
    minLon: bbox[1],
    maxLat: bbox[2],
    maxLon: bbox[3],
  };
}

/**
 * Validate latitude and longitude coordinates
 */
export function validateCoordinates(
  latitude: number,
  longitude: number
): boolean {
  return (
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
  );
}

/**
 * Create PostGIS POINT geography from latitude and longitude
 */
export function createPostGISPoint(
  latitude: number,
  longitude: number
): string {
  return `POINT(${longitude} ${latitude})`;
}
