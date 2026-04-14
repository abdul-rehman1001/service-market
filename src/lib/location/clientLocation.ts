export type UserCoordinates = {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
};

const LOCATION_STORAGE_KEY = 'user-coordinates';

export function saveUserCoordinates(coords: UserCoordinates): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(coords));
  } catch {
    // Ignore localStorage failures (private mode/quota issues).
  }
}

export function getStoredUserCoordinates(maxAgeMs?: number): UserCoordinates | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as UserCoordinates;
    if (!Number.isFinite(parsed.lat) || !Number.isFinite(parsed.lng)) {
      return null;
    }

    if (maxAgeMs && Number.isFinite(maxAgeMs)) {
      const age = Date.now() - (parsed.timestamp || 0);
      if (age > maxAgeMs) return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredUserCoordinates(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch {
    // Ignore localStorage failures.
  }
}

export function appendUserCoordinatesToParams(
  params: URLSearchParams,
  coords?: { lat: number; lng: number } | null
): URLSearchParams {
  if (!coords) return params;

  params.set('userLat', String(coords.lat));
  params.set('userLng', String(coords.lng));
  return params;
}
