'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePagination } from './hooks/usePagination';
import SearchFilters from './SearchFilters';
import ProvidersList from './ProvidersList';
import Pagination from './Pagination';
import SearchMap from './SearchMap/SearchMap';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserLocation } from '@/hooks/useUserLocation';

interface Provider {
  id: string;
  userId: string;
  name: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  bio: string | null;
  rating: number;
  totalReviews: number;
  totalJobsCompleted: number;
  yearsOfExperience: number;
  baseAddress: string;
  phone?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  minPrice: number | null;
  services: any[];
  verificationStatus: string;
}

interface FiltersState {
  rating: number | null;
  priceRange: [number, number];
  radius: number;
  experience: number | null;
  sortBy: string;
}

export default function ServicesPageClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [filters, setFilters] = useState<FiltersState>({
    rating: null,
    priceRange: [0, 5000],
    radius: 0,
    experience: null,
    sortBy: 'rating',
  });

  const { currentPage, totalPages, paginatedItems, goNext, goPrev, goTo } =
    usePagination(filteredProviders, 6);

  const {
    location: detectedLocation,
  } = useUserLocation({
    requestOnMount: true,
    enableHighAccuracy: true,
    maximumAge: 5 * 60_000,
    timeout: 12_000,
    cacheMaxAgeMs: 30 * 60_000,
  });

  const userLocation = useMemo(
    () =>
      detectedLocation
        ? { lat: detectedLocation.lat, lng: detectedLocation.lng }
        : null,
    [detectedLocation?.lat, detectedLocation?.lng]
  );

  const locationLat = userLocation?.lat;
  const locationLng = userLocation?.lng;

  // Reorder providers to show selected provider at the top
  const orderedProviders = useMemo(() => {
    const selectedId = selectedProvider?.id as string | undefined;
    if (!selectedId) return paginatedItems;

    const selectedIndex = paginatedItems.findIndex((p) => p.id === selectedId);
    if (selectedIndex <= 0) return paginatedItems;

    const reordered = [...paginatedItems];
    const [selected] = reordered.splice(selectedIndex, 1);
    return [selected, ...reordered];
  }, [paginatedItems, selectedProvider?.id]);

  // Fetch all providers for initial unfiltered view
  useEffect(() => {
    const controller = new AbortController();

    const fetchProviders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/providers', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        // Calculate distances if user location is available
        let providersWithDistance = data.data || [];
        if (userLocation) {
          providersWithDistance = providersWithDistance.map((provider: Provider) => ({
            ...provider,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              provider.latitude,
              provider.longitude
            ),
          }));
        }

        if (!controller.signal.aborted) {
          setAllProviders(providersWithDistance);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Error fetching providers:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProviders();

    return () => {
      controller.abort();
    };
  }, [locationLat, locationLng]);

  // Calculate distance using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100;
  };

  const applyFilters = (
    providers: Provider[],
    activeFilters: FiltersState,
    activeSearchQuery: string
  ) => {
    let filtered = [...providers];

    const normalizedSearch = activeSearchQuery.trim().toLowerCase();
    if (normalizedSearch) {
      filtered = filtered.filter((provider) => {
        const serviceText = (provider.services || [])
          .map((service: any) => `${service.name || ''} ${service.description || ''} ${service.category?.name || ''}`)
          .join(' ')
          .toLowerCase();

        const providerText = `${provider.name || ''} ${provider.firstName || ''} ${provider.lastName || ''} ${provider.bio || ''} ${provider.baseAddress || ''}`.toLowerCase();

        return `${providerText} ${serviceText}`.includes(normalizedSearch);
      });
    }

    if (activeFilters.rating !== null) {
      filtered = filtered.filter((provider) => provider.rating >= activeFilters.rating!);
    }

    if (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 5000) {
      filtered = filtered.filter(
        (provider) =>
          provider.minPrice !== null &&
          provider.minPrice >= activeFilters.priceRange[0] &&
          provider.minPrice <= activeFilters.priceRange[1]
      );
    }

    if (activeFilters.radius > 0 && userLocation) {
      filtered = filtered.filter(
        (provider) => provider.distance !== undefined && provider.distance <= activeFilters.radius
      );
    }

    if (activeFilters.experience !== null) {
      filtered = filtered.filter(
        (provider) => provider.yearsOfExperience >= activeFilters.experience!
      );
    }

    switch (activeFilters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        filtered.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
        break;
      case 'price':
        filtered.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
        break;
      case 'distance':
        filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        break;
      default:
        break;
    }

    return filtered;
  };

  useEffect(() => {
    setFilteredProviders(applyFilters(allProviders, filters, searchQuery));
    setShowMap(filters.radius > 0 && Boolean(userLocation));
  }, [allProviders, filters, searchQuery, locationLat, locationLng]);

  // Handle filters change
  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
    goTo(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    goTo(1);
  };

  const handleRadiusChange = (radius: number) => {
    handleFiltersChange({ ...filters, radius });
  };

  const handleProviderSelect = (provider: any) => {
    const providerId = provider?.id as string | undefined;
    const fullProvider = providerId
      ? filteredProviders.find((p) => p.id === providerId) ?? provider
      : provider;
    setSelectedProvider(fullProvider);

    // If the provider is not on the current 6-item page, jump to the correct page
    // so the card exists in the list and can be highlighted.
    if (providerId) {
      const indexInFiltered = filteredProviders.findIndex((p) => p.id === providerId);
      if (indexInFiltered >= 0) {
        const targetPage = Math.floor(indexInFiltered / 6) + 1;
        if (targetPage !== currentPage) goTo(targetPage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f8]">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-8 py-8">
        {/* Left Column */}
        <main className="flex-1 space-y-6">
          {/* Filters */}
          <SearchFilters
            searchQuery={searchQuery}
            canUseRadius={Boolean(userLocation)}
            onSearchChange={handleSearchChange}
            onFiltersChange={handleFiltersChange}
            onRadiusChange={handleRadiusChange}
          />

          {/* Results Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-100"
          >
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Showing{' '}
                <span className="text-emerald-600">
                  {Math.min(6, paginatedItems.length)} of {filteredProviders.length}
                </span>{' '}
                providers
              </p>
            </div>
            {showMap && (
              <span className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                Map visible with radius filter
              </span>
            )}
          </motion.div>

          {/* Providers List */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-4"
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-2xl shadow-sm animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : paginatedItems.length > 0 ? (
              <motion.div
                key="providers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ProvidersList
                  providers={orderedProviders}
                  selectedProvider={selectedProvider}
                  onProviderSelect={handleProviderSelect}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300"
              >
                <p className="text-gray-600 font-semibold">
                  No providers found. Try adjusting your filters.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {!loading && filteredProviders.length > 6 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={goPrev}
              onNext={goNext}
              onSelect={goTo}
            />
          )}
        </main>

        {/* Right Column / Map */}
        {showMap && (
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-2/5 h-[600px] lg:h-auto lg:sticky lg:top-24"
          >
            <SearchMap
              location="Current Location"
              providers={filteredProviders.map((p) => ({
                id: p.id,
                userId: p.userId,
                name: p.name,
                latitude: p.latitude,
                longitude: p.longitude,
                baseAddress: p.baseAddress,
                rating: p.rating,
                distance: p.distance,
              })) as any}
              userLocation={userLocation || undefined}
              radius={filters.radius}
              onProviderSelect={handleProviderSelect}
            />
          </motion.aside>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
