
// Common stop words to remove 
const STOP_WORDS = new Set([
  'lagos',
  'state',
  'ajah',
  'lekki',
  'ikoyi',
  'victoria',
  'island',
  'mainland'
]);

// Common abbreviation mappings
const ABBREVIATIONS: Record<string, string> = {
  'st': 'street',
  'st.': 'street',
  'rd': 'road',
  'rd.': 'road',
  'ave': 'avenue',
  'ave.': 'avenue',
  'blvd': 'boulevard',
  'blvd.': 'boulevard',
  'dr': 'drive',
  'dr.': 'drive',
  'ln': 'lane',
  'ln.': 'lane',
  'ct': 'court',
  'ct.': 'court'
};

/**
 * Normalize a location name 
 */
export function normalizeLocationName(locationName: string): string {
  let normalized = locationName;

  //  Lowercase
  normalized = normalized.toLowerCase();

  // Remove punctuation and  whitespace
  normalized = normalized.replace(/[^\w\s]/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // stanardadize abbreviations
  const words = normalized.split(' ');
  normalized = words
    .map(word => ABBREVIATIONS[word] || word)
    .join(' ');

  // remove stop words
  const filteredWords = normalized
    .split(' ')
    .filter(word => !STOP_WORDS.has(word));

  // join and return the first significant word/phrase
  normalized = filteredWords.join(' ').trim();

  // If we removed everything, return the original (lowercased, cleaned)
  if (!normalized) {
    normalized = locationName.toLowerCase().replace(/[^\w\s]/g, '').trim();
  }

  return normalized;
}

/**
 * Extract the primary location identifier from a complex location string
 * Example: "Sangotedo, Ajah, Lagos" -> "sangotedo"
 */
export function extractPrimaryLocation(locationName: string): string {
  const normalized = normalizeLocationName(locationName);
  
  // Assume first word as the primary identifier
  const firstWord = normalized.split(' ')[0];
  
  return firstWord || normalized;
}

/**
 * Generate location search keywords from a location name
 * Useful for fuzzy matching
 */
export function generateLocationKeywords(locationName: string): string[] {
  const normalized = normalizeLocationName(locationName);
  const words = normalized.split(' ');
  
  // Include full normalized name and individual words
  return [normalized, ...words].filter(Boolean);
}

/**
 * Calculate simple Levenshtein distance for fuzzy matching
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Distance between strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Check if two location names are similar (fuzzy match)
 * @param location1 - First location name
 * @param location2 - Second location name
 * @param threshold - Maximum distance to consider similar (default: 2)
 * @returns True if locations are similar
 */
export function areLocationsSimilar(
  location1: string,
  location2: string,
  threshold: number = 2
): boolean {
  const norm1 = normalizeLocationName(location1);
  const norm2 = normalizeLocationName(location2);
  
  const distance = levenshteinDistance(norm1, norm2);
  
  return distance <= threshold;
}
