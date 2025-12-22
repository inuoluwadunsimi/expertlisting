# Location Search API

## Endpoint

```
GET /api/properties/search?location=sangotedo
```

## Description

Search for properties by location name with case-insensitive and typo-tolerant matching. Uses geo-buckets for efficient lookup instead of scanning the full table.

## Query Parameters

| Parameter  | Type    | Required | Description                                |
| ---------- | ------- | -------- | ------------------------------------------ |
| `location` | string  | Yes      | Location name to search (min 2 characters) |
| `limit`    | integer | No       | Number of results per page (default: 10)   |
| `offset`   | integer | No       | Pagination offset (default: 0)             |

## Features

### 1. **Case-Insensitive Matching**

All location names are normalized to lowercase for consistent matching:

- "Sangotedo" → "sangotedo"
- "LEKKI" → "lekki"

### 2. **Typo-Tolerant Fuzzy Matching**

Uses Levenshtein distance algorithm to find similar locations:

- "sangotedo" matches "sangotedo" (exact)
- "sangotdo" matches "sangotedo" (1 character difference)
- "sangoted" matches "sangotedo" (1 character difference)

Threshold: 2 character differences maximum

### 3. **Geo-Bucket Optimization**

- Properties are indexed by `normalized_location_name`
- First attempts exact match on normalized location
- Falls back to fuzzy matching only if no exact matches found
- Uses geo-bucket assignment for efficient spatial queries

## Example Requests

### Basic Search

```bash
GET /api/properties/search?location=sangotedo
```

### With Pagination

```bash
GET /api/properties/search?location=lekki&limit=20&offset=0
```

### Typo-Tolerant Search

```bash
GET /api/properties/search?location=sangotdo
# Will find properties in "sangotedo"
```

## Response Format

### Success (200 OK)

```json
{
  "message": "Location search completed",
  "data": {
    "properties": [
      {
        "id": "uuid",
        "title": "Beautiful 3BR Apartment",
        "location_name": "Sangotedo, Ajah, Lagos",
        "normalized_location_name": "sangotedo",
        "latitude": 6.4281,
        "longitude": 3.4219,
        "geohash": "s00twy012",
        "price": 150000000,
        "bedrooms": 3,
        "bathrooms": 2,
        "bucket_id": "bucket-uuid",
        "created_at": "2025-12-22T22:00:00.000Z",
        "updated_at": "2025-12-22T22:00:00.000Z"
      }
    ],
    "total": 25,
    "limit": 10,
    "offset": 0,
    "location": "sangotedo"
  }
}
```

### Validation Error (400 Bad Request)

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "property": "location",
      "constraints": {
        "minLength": "Location must be at least 2 characters"
      }
    }
  ],
  "error": true
}
```

### No Results (200 OK)

```json
{
  "message": "Location search completed",
  "data": {
    "properties": [],
    "total": 0,
    "limit": 10,
    "offset": 0,
    "location": "nonexistent"
  }
}
```

## Implementation Details

### Search Algorithm

1. **Normalize Input**: Convert location to lowercase, remove punctuation, standardize abbreviations
2. **Exact Match**: Query properties by `normalized_location_name` index
3. **Fuzzy Match** (if no exact results):
   - Retrieve all unique normalized locations
   - Calculate Levenshtein distance for each
   - Find locations within threshold (≤2 differences)
   - Query properties for all similar locations
   - Combine and paginate results

### Performance Optimization

- **Indexed Queries**: Uses database index on `normalized_location_name`
- **Lazy Fuzzy Matching**: Only performs fuzzy matching if exact match fails
- **Geo-Bucket Integration**: Properties are pre-assigned to geo-buckets for spatial efficiency
- **Pagination**: Results are paginated to limit response size

### Location Normalization Rules

1. Convert to lowercase
2. Remove punctuation
3. Standardize abbreviations (st → street, rd → road, etc.)
4. Remove common stop words (lagos, state, ajah, etc.)
5. Extract primary location identifier

Example:

- Input: "Sangotedo, Ajah, Lagos State"
- Normalized: "sangotedo"

## Related Endpoints

- `POST /api/properties` - Create a property
- `GET /api/properties/:id` - Get property by ID
- `GET /api/properties` - List all properties with filters
