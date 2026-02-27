'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

interface AddressAutofillInputProps {
  value: string;
  onChange: (address: string) => void;
  onSelect?: (result: any) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

interface AddressSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

export default function AddressAutofillInput({
  value,
  onChange,
  onSelect,
  placeholder = 'Enter your address...',
  required = false,
  className = '',
}: AddressAutofillInputProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch address suggestions from Mapbox
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!query || !accessToken || query.length < 3) {
        setSuggestions([]);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?country=pk&language=en&limit=5&access_token=${accessToken}`,
          { signal: abortControllerRef.current.signal }
        );

        if (!response.ok) throw new Error('Failed to fetch suggestions');

        const data = await response.json();
        setSuggestions(
          data.features?.map((feature: any) => ({
            id: feature.id,
            place_name: feature.place_name,
            center: feature.center,
          })) || []
        );
        setShowSuggestions(true);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching address suggestions:', error);
        }
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange(val);
      fetchSuggestions(val);
    },
    [onChange, fetchSuggestions]
  );

  const handleSelectSuggestion = useCallback(
    (suggestion: AddressSuggestion) => {
      onChange(suggestion.place_name);
      setSuggestions([]);
      setShowSuggestions(false);

      if (onSelect) {
        onSelect({
          place_name: suggestion.place_name,
          center: suggestion.center,
          longitude: suggestion.center[0],
          latitude: suggestion.center[1],
        });
      }
    },
    [onChange, onSelect]
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fallback for when token is not available
  if (!accessToken) {
    return (
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className}`}
      />
    );
  }

  return (
    <div className="w-full relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className}`}
        autoComplete="off"
        onFocus={() => value && suggestions.length > 0 && setShowSuggestions(true)}
      />

      {isLoading && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg p-3 text-gray-500 text-sm z-50">
          Loading suggestions...
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && !isLoading && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 transition-colors"
              type="button"
            >
              <div className="text-sm font-medium text-gray-900">
                {suggestion.place_name}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
