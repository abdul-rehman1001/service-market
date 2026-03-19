"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import SearchSection from "@/components/home/SearchSection";
import Categories from "@/components/home/Categories";
import FeaturedProviders from "@/components/home/providers/FeaturedProviders";
import AISearchResults from "@/components/home/AISearchResults";
import Footer from "@/components/layout/Footer";

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
  distance?: number;
  minPrice?: number;
  services: any[];
  verificationStatus: string;
}

interface AISearchState {
  active: boolean;
  category: string;
  categoryId: string | null;
  categoryName: string;
  providers: Provider[];
  loading: boolean;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasMore: boolean;
  };
}

export default function HomePage() {
  const [aiSearchState, setAISearchState] = useState<AISearchState>({
    active: false,
    category: "",
    categoryId: null,
    categoryName: "",
    providers: [],
    loading: false,
    pagination: {
      page: 1,
      totalPages: 0,
      total: 0,
      hasMore: false
    }
  });

  // Get user location for distance calculation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  }, []);

  // Listen for AI search events
  useEffect(() => {
    const handleAISearch = async (event: any) => {
      const { category, categoryId, categoryName } = event.detail;
      
      if (!category) {
        // Clear AI search
        setAISearchState({
          active: false,
          category: "",
          categoryId: null,
          categoryName: "",
          providers: [],
          loading: false,
          pagination: {
            page: 1,
            totalPages: 0,
            total: 0,
            hasMore: false
          }
        });
        return;
      }

      // Set loading state
      setAISearchState(prev => ({
        ...prev,
        active: true,
        category,
        categoryId: categoryId || null,
        categoryName: categoryName || "",
        loading: true,
        pagination: { ...prev.pagination, page: 1 }
      }));

      // Fetch providers
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "12"
        });

        // Prefer categoryId for exact DB matching, fall back to text
        if (categoryId) {
          params.append('categoryId', categoryId);
        } else {
          params.append('category', category);
        }

        if (userLocation) {
          params.append('userLat', userLocation.lat.toString());
          params.append('userLng', userLocation.lng.toString());
        }

        const response = await fetch(`/api/providers/ai-search?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch providers');
        }

        const data = await response.json();

        setAISearchState(prev => ({
          ...prev,
          providers: data.data || [],
          loading: false,
          pagination: data.pagination
        }));

        // Scroll to results
        setTimeout(() => {
          const resultsElement = document.getElementById('ai-search-results');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);

      } catch (error) {
        console.error('Error fetching AI search results:', error);
        setAISearchState(prev => ({
          ...prev,
          loading: false,
          providers: []
        }));
      }
    };

    window.addEventListener('aiSearchProviders', handleAISearch);
    return () => window.removeEventListener('aiSearchProviders', handleAISearch);
  }, [userLocation]);

  // Handle pagination
  const handlePageChange = async (page: number) => {
    if (page < 1 || page > aiSearchState.pagination.totalPages) return;

    setAISearchState(prev => ({ ...prev, loading: true }));

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12"
      });

      if (aiSearchState.categoryId) {
        params.append('categoryId', aiSearchState.categoryId);
      } else {
        params.append('category', aiSearchState.category);
      }

      if (userLocation) {
        params.append('userLat', userLocation.lat.toString());
        params.append('userLng', userLocation.lng.toString());
      }

      const response = await fetch(`/api/providers/ai-search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }

      const data = await response.json();

      setAISearchState(prev => ({
        ...prev,
        providers: data.data || [],
        loading: false,
        pagination: data.pagination
      }));

      // Scroll to results
      const resultsElement = document.getElementById('ai-search-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } catch (error) {
      console.error('Error fetching page:', error);
      setAISearchState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="bg-[#f5f7f8] min-h-screen">
      <SearchSection onClearSearch={() => {
        setAISearchState({
          active: false,
          category: "",
          categoryId: null,
          categoryName: "",
          providers: [],
          loading: false,
          pagination: {
            page: 1,
            totalPages: 0,
            total: 0,
            hasMore: false
          }
        });
      }} />
      
      {/* Show AI Search Results or Default Content */}
      <AnimatePresence mode="wait">
        {aiSearchState.active ? (
          <div key="ai-results" id="ai-search-results">
            <AISearchResults
              providers={aiSearchState.providers}
              loading={aiSearchState.loading}
              category={aiSearchState.categoryName || aiSearchState.category}
              pagination={aiSearchState.pagination}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <div key="default-content">
            <Categories />
            <FeaturedProviders />
          </div>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
}
