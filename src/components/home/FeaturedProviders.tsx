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
    const handleFilterProviders = (event: any) => {
      const { category, subcategory } = event.detail;
      setActiveFilter({ category, subcategory });

      const filtered = allProviders.filter(
        (provider) =>
          provider.category === category &&
          provider.subcategory === subcategory
      );

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

  const formatCategoryName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
  const formatSubcategoryName = (name: string) =>
    name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <section id="featured-providers" className="w-full py-12 bg-[#f5f7f8] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Featured Providers</h2>
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
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className={`group relative flex flex-col justify-between bg-white p-6 rounded-2xl shadow-md transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]`}
              >
                {/* Top row: avatar + name/role */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-gray-100">
                    <Image
                      src={provider.avatar}
                      alt={provider.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                       
                        <h3 className="text-md md:text-lg font-semibold text-gray-900 truncate">{provider.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full text-sm text-gray-700">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium">{provider.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{provider.role}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mt-4 leading-relaxed max-h-[4.8rem] overflow-hidden">
                  {provider.description}
                </p>

                {/* Footer: reviews + button */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500">
                    ({provider.reviews} reviews)
                  </span>

                  <button
                    className="ml-auto px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors"
                    aria-label={`View profile of ${provider.name}`}
                  >
                    View Profile
                  </button>
                </div>
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
