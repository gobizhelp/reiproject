import type { Property } from './types';
import type { BuyerBuyBox } from './profile-types';

export interface MatchedProperty {
  property: Property & {
    property_photos: { id: string; url: string; display_order: number }[];
  };
  matchedBuyBoxes: MatchDetail[];
  bestScore: number;
}

export interface MatchDetail {
  buyBoxId: string;
  buyBoxName: string;
  score: number;
  reasons: string[];
}

/**
 * Parse locations from a buy box (stored as JSON array string or comma-separated).
 */
function parseBuyBoxLocations(locations: string | null): string[] {
  if (!locations) return [];
  try {
    const parsed = JSON.parse(locations);
    if (Array.isArray(parsed)) return parsed.map((s: string) => s.toLowerCase().trim());
  } catch {}
  return locations.split(',').map((s) => s.toLowerCase().trim()).filter(Boolean);
}

/**
 * Score how well a property matches a single buy box.
 * Returns a score 0-100 and an array of match reasons.
 */
function scoreBuyBox(
  property: Property,
  buyBox: BuyerBuyBox
): { score: number; reasons: string[] } {
  let totalWeight = 0;
  let earned = 0;
  const reasons: string[] = [];

  // Property type match (weight: 25)
  if (buyBox.property_types.length > 0) {
    totalWeight += 25;
    if (buyBox.property_types.includes(property.property_type)) {
      earned += 25;
      reasons.push('Property type');
    }
  }

  // Price range match (weight: 25)
  if (buyBox.min_price != null || buyBox.max_price != null) {
    totalWeight += 25;
    const price = property.asking_price ?? 0;
    const aboveMin = buyBox.min_price == null || price >= buyBox.min_price;
    const belowMax = buyBox.max_price == null || price <= buyBox.max_price;
    if (aboveMin && belowMax) {
      earned += 25;
      reasons.push('Price range');
    }
  }

  // Beds match (weight: 10)
  if (buyBox.min_beds != null) {
    totalWeight += 10;
    if (property.beds != null && property.beds >= buyBox.min_beds) {
      earned += 10;
      reasons.push('Bedrooms');
    }
  }

  // Baths match (weight: 10)
  if (buyBox.min_baths != null) {
    totalWeight += 10;
    if (property.baths != null && property.baths >= buyBox.min_baths) {
      earned += 10;
      reasons.push('Bathrooms');
    }
  }

  // Sqft match (weight: 10)
  if (buyBox.min_sqft != null || buyBox.max_sqft != null) {
    totalWeight += 10;
    const sqft = property.sqft ?? 0;
    const aboveMin = buyBox.min_sqft == null || sqft >= buyBox.min_sqft;
    const belowMax = buyBox.max_sqft == null || sqft <= buyBox.max_sqft;
    if (aboveMin && belowMax) {
      earned += 10;
      reasons.push('Square footage');
    }
  }

  // Location match (weight: 20)
  const locations = parseBuyBoxLocations(buyBox.locations);
  if (locations.length > 0) {
    totalWeight += 20;
    const propCity = (property.city || '').toLowerCase().trim();
    const propState = (property.state || '').toLowerCase().trim();
    const propCityState = `${propCity}, ${propState}`;
    const propZip = (property.zip_code || '').toLowerCase().trim();

    const locationMatch = locations.some((loc) => {
      // Match against city, state, city+state combo, or zip
      return (
        loc === propCity ||
        loc === propState ||
        loc === propCityState ||
        loc === propZip ||
        propCityState.includes(loc) ||
        loc.includes(propCity) ||
        loc.includes(propState)
      );
    });

    if (locationMatch) {
      earned += 20;
      reasons.push('Location');
    }
  }

  // If the buy box has no criteria set, there's nothing to match against
  if (totalWeight === 0) return { score: 0, reasons: [] };

  const score = Math.round((earned / totalWeight) * 100);
  return { score, reasons };
}

/**
 * Match all properties against all of a buyer's buy boxes.
 * Returns only properties that match at least one buy box with score >= threshold.
 */
export function matchProperties(
  properties: (Property & { property_photos: { id: string; url: string; display_order: number }[] })[],
  buyBoxes: BuyerBuyBox[],
  threshold = 50
): MatchedProperty[] {
  if (buyBoxes.length === 0) return [];

  const results: MatchedProperty[] = [];

  for (const property of properties) {
    const matchedBuyBoxes: MatchDetail[] = [];

    for (const box of buyBoxes) {
      const { score, reasons } = scoreBuyBox(property, box);
      if (score >= threshold) {
        matchedBuyBoxes.push({
          buyBoxId: box.id,
          buyBoxName: box.name,
          score,
          reasons,
        });
      }
    }

    if (matchedBuyBoxes.length > 0) {
      matchedBuyBoxes.sort((a, b) => b.score - a.score);
      results.push({
        property,
        matchedBuyBoxes,
        bestScore: matchedBuyBoxes[0].score,
      });
    }
  }

  // Sort by best match score descending, then by newest
  results.sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    return new Date(b.property.created_at).getTime() - new Date(a.property.created_at).getTime();
  });

  return results;
}
