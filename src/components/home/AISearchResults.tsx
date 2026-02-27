"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  MapPin, 
  Award, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  category: {
    id: string;
    name: string;
    parentId: string | null;
  };
}

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
  services: Service[];
  verificationStatus: string;
}

interface AISearchResultsProps {
  providers: Provider[];
  loading: boolean;
  category: string;
  subcategory?: string;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasMore: boolean;
  };
  onPageChange: (page: number) => void;
}

export default function AISearchResults({
  providers,
  loading,
  category,
  subcategory,
  pagination,
  onPageChange
}: AISearchResultsProps) {
  
  const formatCategoryName = (name: string) => 
    name.charAt(0).toUpperCase() + name.slice(1);

  const formatSubcategoryName = (name: string) =>
    name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-7xl mx-auto px-6 py-8"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              AI-Powered Results
            </h2>
            <p className="text-gray-600 mt-1">
              Showing {pagination.total} {formatCategoryName(category)}{" "}
              {subcategory && `· ${formatSubcategoryName(subcategory)}`}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">
              Sorted by: Rating → Distance → Price → Experience
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm text-gray-600">Verified Providers Only</span>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md p-6 animate-pulse"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : providers.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16 bg-white rounded-2xl shadow-md"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No providers found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse other categories
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {providers.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden group"
              >
                <Link href={`/provider/${provider.userId}`}>
                  {/* Card Header */}
                  <div className="relative p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                          {provider.profileImage ? (
                            <Image
                              src={provider.profileImage}
                              alt={provider.name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                              <span className="text-white font-bold text-xl">
                                {provider.firstName[0]}{provider.lastName[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Verification Badge */}
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 ring-2 ring-white">
                          <Award className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-emerald-600 transition">
                          {provider.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {provider.services[0]?.name || "Service Provider"}
                        </p>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-bold text-amber-700">
                              {provider.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({provider.totalReviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Bio */}
                    {provider.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {provider.bio}
                      </p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {provider.distance !== undefined && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-blue-600 font-medium">Distance</p>
                            <p className="text-sm font-bold text-blue-700 truncate">
                              {provider.distance.toFixed(1)} km
                            </p>
                          </div>
                        </div>
                      )}

                      {provider.minPrice !== undefined && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <span className="text-lg">💰</span>
                          <div className="min-w-0">
                            <p className="text-xs text-green-600 font-medium">From</p>
                            <p className="text-sm font-bold text-green-700 truncate">
                              Rs. {provider.minPrice}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                        <Briefcase className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-purple-600 font-medium">Experience</p>
                          <p className="text-sm font-bold text-purple-700 truncate">
                            {provider.yearsOfExperience} yrs
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                        <Award className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-orange-600 font-medium">Jobs Done</p>
                          <p className="text-sm font-bold text-orange-700 truncate">
                            {provider.totalJobsCompleted}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Services */}
                    {provider.services.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Services:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {provider.services.slice(0, 3).map((service) => (
                            <span
                              key={service.id}
                              className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium"
                            >
                              {service.name}
                            </span>
                          ))}
                          {provider.services.length > 3 && (
                            <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                              +{provider.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6">
                    <button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform group-hover:scale-105">
                      View Profile
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && providers.length > 0 && pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex items-center justify-center gap-2"
        >
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-lg border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {[...Array(pagination.totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Show first, last, current, and pages around current
              const showPage =
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                Math.abs(pageNum - pagination.page) <= 1;

              if (!showPage) {
                // Show ellipsis
                if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                  return (
                    <span key={i} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={i}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg font-semibold transition ${
                    pagination.page === pageNum
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                      : "border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasMore}
            className="p-2 rounded-lg border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
