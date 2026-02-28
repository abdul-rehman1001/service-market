'use client';

import { useState, useEffect } from 'react';
import { usePagination } from './hooks/usePagination';
import SearchHeader from './SearchHeader';
import SearchFilters from './SearchFilters';
import ProvidersList from './ProvidersList';
import Pagination from './Pagination';
import SearchMap from './SearchMap/SearchMap';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [searchQuery, setSearchQuery] = useState('All Services');
  const [location, setLocation] = useState('Current Location');
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
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

  // Fetch user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          setLocation(`${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)}`);
        },
        () => {
          console.warn('Location access denied');
        }
      );
    }
  }, []);

  // Fetch initial random providers
  useEffect(() => {
    const fetchRandomProviders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/providers/random?limit=12');
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

        setAllProviders(providersWithDistance);
        setFilteredProviders(providersWithDistance);
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomProviders();
  }, [userLocation]);

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

  // Handle filters change
  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);

    // Apply filters
    let filtered = allProviders;

    // Rating filter
    if (newFilters.rating !== null) {
      filtered = filtered.filter((p) => p.rating >= newFilters.rating!);
    }

    // Price range filter
    if (newFilters.priceRange[0] > 0 || newFilters.priceRange[1] < 5000) {
      filtered = filtered.filter(
        (p) =>
          p.minPrice &&
          p.minPrice >= newFilters.priceRange[0] &&
          p.minPrice <= newFilters.priceRange[1]
      );
    }

    // Radius filter
    if (newFilters.radius > 0) {
      filtered = filtered.filter(
        (p) => p.distance && p.distance <= newFilters.radius
      );
      setShowMap(true);
    } else {
      setShowMap(false);
    }

    // Experience filter
    if (newFilters.experience !== null) {
      filtered = filtered.filter(
        (p) => p.yearsOfExperience >= newFilters.experience!
      );
    }

    // Sort
    switch (newFilters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        filtered.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
        break;
      case 'price':
        filtered.sort(
          (a, b) => (a.minPrice || 0) - (b.minPrice || 0)
        );
        break;
      case 'distance':
        filtered.sort(
          (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
        );
        break;
    }

    setFilteredProviders(filtered);
    goTo(1);
  };

  const handleRadiusChange = (radius: number) => {
    handleFiltersChange({ ...filters, radius });
  };

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f8]">
      {/* Header */}
      <Header />

      {/* Page Title & Summary */}
      <SearchHeader
        searchQuery={searchQuery}
        location={location}
        totalResults={filteredProviders.length}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-8 py-8">
        {/* Left Column */}
        <main className="flex-1 space-y-6">
          {/* Filters */}
          <SearchFilters
            searchQuery={searchQuery}
            location={location}
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
                  providers={paginatedItems}
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
              location={location}
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
