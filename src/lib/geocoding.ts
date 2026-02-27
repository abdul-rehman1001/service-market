/**
 * Mapbox Geocoding Utility
 * Converts addresses to longitude/latitude coordinates using Mapbox Geocoding API
 */

export interface GeocodeResult {
  longitude: number;
  latitude: number;
  formatted_address: string;
  place_name: string;
}

/**
 * Geocode an address to coordinates using Mapbox Geocoding API
 * @param address - The address string to geocode
 * @returns GeocodeResult with coordinates and formatted address
 * @throws Error if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const mapboxToken = process.env.MAPBOX_TOKEN;

  if (!mapboxToken) {
    throw new Error('MAPBOX_TOKEN environment variable is not set');
  }

  if (!address || address.trim().length === 0) {
    throw new Error('Address cannot be empty');
  }

  try {
    // Encode the address for URL
    const encodedAddress = encodeURIComponent(address.trim());

    // Mapbox Geocoding API endpoint
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Mapbox API error: ${response.status} ${response.statusText} - ${
          errorData.message || 'Unknown error'
        }`
      );
    }

    const data = await response.json();

    // Check if we got any results
    if (!data.features || data.features.length === 0) {
      throw new Error('Address not found. Please provide a valid address.');
    }

    const feature = data.features[0];

    // Extract coordinates (Mapbox returns [longitude, latitude])
    const [longitude, latitude] = feature.center;

    return {
      longitude,
      latitude,
      formatted_address: feature.place_name,
      place_name: feature.place_name,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to geocode address. Please try again.');
  }
}

/**
 * Validate if coordinates are within valid ranges
 * @param longitude - Longitude value
 * @param latitude - Latitude value
 * @returns boolean indicating if coordinates are valid
 */
export function validateCoordinates(longitude: number, latitude: number): boolean {
  return (
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lon1 - Longitude of first point
 * @param lat1 - Latitude of first point
 * @param lon2 - Longitude of second point
 * @param lat2 - Latitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
