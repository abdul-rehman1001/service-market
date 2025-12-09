"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Sparkles, Filter } from "lucide-react";

interface Provider {
  id: number;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  description: string;
  avatar: string;
  category: string;
  subcategory: string;
}

const allProviders: Provider[] = [
  // Plumbers
  {
    id: 1,
    name: "Ahmed Khan",
    role: "Expert Plumber",
    rating: 4.9,
    reviews: 138,
    description: "Specializing in pipe repairs, leak fixes, and bathroom installations.",
    avatar: "/images/avatar1.png",
    category: "plumber",
    subcategory: "pipe_repair",
  },
  {
    id: 2,
    name: "Sarah Wilson",
    role: "Professional Plumber",
    rating: 5.0,
    reviews: 95,
    description: "Expert in sink repairs, faucet installations, and drain cleaning.",
    avatar: "/images/avatar2.png",
    category: "plumber",
    subcategory: "sink_issues",
  },
  {
    id: 3,
    name: "Mike Johnson",
    role: "Licensed Plumber",
    rating: 4.8,
    reviews: 112,
    description: "Providing fast and reliable plumbing services for over 15 years.",
    avatar: "/images/avatar3.png",
    category: "plumber",
    subcategory: "drain_cleaning",
  },

  // Electricians
  {
    id: 4,
    name: "David Lee",
    role: "Master Electrician",
    rating: 4.9,
    reviews: 156,
    description: "Certified electrician with expertise in wiring and electrical repairs.",
    avatar: "/images/avatar1.png",
    category: "electrician",
    subcategory: "wiring_repair",
  },
  {
    id: 5,
    name: "Emma Brown",
    role: "Licensed Electrician",
    rating: 4.7,
    reviews: 89,
    description: "Specializing in lighting installations and socket repairs.",
    avatar: "/images/avatar2.png",
    category: "electrician",
    subcategory: "light_installation",
  },
  {
    id: 6,
    name: "James Miller",
    role: "Electrical Expert",
    rating: 5.0,
    reviews: 124,
    description: "Expert in circuit breakers, panel upgrades, and electrical troubleshooting.",
    avatar: "/images/avatar3.png",
    category: "electrician",
    subcategory: "circuit_breaker",
  },

  // Carpenters
  {
    id: 7,
    name: "Robert Garcia",
    role: "Master Carpenter",
    rating: 4.8,
    reviews: 143,
    description: "Custom furniture building and woodwork specialist with 20 years experience.",
    avatar: "/images/avatar1.png",
    category: "carpenter",
    subcategory: "furniture_building",
  },
  {
    id: 8,
    name: "Lisa Anderson",
    role: "Professional Carpenter",
    rating: 4.9,
    reviews: 97,
    description: "Expert in furniture repair, door installations, and cabinet work.",
    avatar: "/images/avatar2.png",
    category: "carpenter",
    subcategory: "furniture_repair",
  },
  {
    id: 9,
    name: "Chris Taylor",
    role: "Skilled Carpenter",
    rating: 4.7,
    reviews: 108,
    description: "Specializing in door installations, deck construction, and custom cabinetry.",
    avatar: "/images/avatar3.png",
    category: "carpenter",
    subcategory: "door_installation",
  },
];

export default function FeaturedProviders() {
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>(allProviders);
  const [activeFilter, setActiveFilter] = useState<{
    category: string | null;
    subcategory: string | null;
  }>({ category: null, subcategory: null });

  useEffect(() => {
    // Listen for AI search results
    const handleFilterProviders = (event: any) => {
      const { category, subcategory } = event.detail;
      setActiveFilter({ category, subcategory });

      // Filter providers based on category and subcategory
      const filtered = allProviders.filter(
        (provider) =>
          provider.category === category &&
          provider.subcategory === subcategory
      );

      // If no exact match, show all providers in that category
      if (filtered.length === 0) {
        const categoryFiltered = allProviders.filter(
          (provider) => provider.category === category
        );
        setFilteredProviders(categoryFiltered.length > 0 ? categoryFiltered : allProviders);
      } else {
        setFilteredProviders(filtered);
      }
    };

    window.addEventListener('filterProviders', handleFilterProviders);
    return () => window.removeEventListener('filterProviders', handleFilterProviders);
  }, []);

  const clearFilter = () => {
    setActiveFilter({ category: null, subcategory: null });
    setFilteredProviders(allProviders);
  };

  const formatCategoryName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const formatSubcategoryName = (name: string) => {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <section id="featured-providers" className="w-full py-12 bg-[#f5f7f8] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header with Filter Info */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Featured Providers</h2>
            {activeFilter.category && (
              <p className="text-sm text-gray-600 mt-1">
                Showing results for {formatCategoryName(activeFilter.category)}
                {activeFilter.subcategory && ` → ${formatSubcategoryName(activeFilter.subcategory)}`}
              </p>
            )}
          </div>

          {activeFilter.category && (
            <button
              onClick={clearFilter}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Clear Filter
            </button>
          )}
        </div>

        {/* AI Filter Badge */}
        {activeFilter.category && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-900">
                AI-filtered results based on your search
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {filteredProviders.length} {filteredProviders.length === 1 ? 'provider' : 'providers'} found
              </p>
            </div>
          </div>
        )}

        {/* Providers Grid */}
        {filteredProviders.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className={`border rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition ${
                  activeFilter.subcategory === provider.subcategory
                    ? 'ring-2 ring-emerald-500 border-emerald-500'
                    : ''
                }`}
              >
                {/* Best Match Badge */}
                {activeFilter.subcategory === provider.subcategory && (
                  <div className="mb-3 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full inline-block">
                    Best Match
                  </div>
                )}

                {/* Avatar */}
                <div className="w-14 h-14 rounded-full overflow-hidden mb-4 bg-gray-200">
                  <Image
                    src={provider.avatar}
                    alt={provider.name}
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                </div>

                {/* Name + Role */}
                <h3 className="text-lg font-semibold">{provider.name}</h3>
                <p className="text-sm text-gray-500">{provider.role}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{provider.rating}</span>
                  <span className="text-gray-500 text-sm">
                    ({provider.reviews} reviews)
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                  {provider.description}
                </p>

                {/* Button */}
                <button className="w-full mt-5 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No providers found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or browse all providers
            </p>
            <button
              onClick={clearFilter}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
            >
              View All Providers
            </button>
          </div>
        )}
      </div>
    </section>
  );
}