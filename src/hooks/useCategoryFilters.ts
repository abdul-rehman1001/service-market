"use client";

import { useState, useMemo } from "react";

interface Provider {
  id: number;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  description: string;
  image: string;
  price?: number;
  distance?: number;
  isVerified?: boolean;
  isOpenNow?: boolean;
}

export function useCategoryFilters(providers: Provider[]) {
 
  const [sort, setSort] = useState("Best Match");
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(100);
  const [priceRange, setPriceRange] = useState(200);


  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);

  
  const filteredProviders = useMemo(() => {
    let list = [...providers];

    list = list.filter((p) => p.rating >= minRating);

   
    list = list.filter((p) => (p.distance ?? 0) <= maxDistance);

   
    list = list.filter((p) => (p.price ?? 0) <= priceRange);

    
    if (verifiedOnly) list = list.filter((p) => p.isVerified);
    if (openNowOnly) list = list.filter((p) => p.isOpenNow);
    if (nearbyOnly) list = list.filter((p) => (p.distance ?? 0) <= 10);

  
    switch (sort) {
      case "Top Rated":
        list.sort((a, b) => b.rating - a.rating);
        break;

      case "Most Reviewed":
        list.sort((a, b) => b.reviews - a.reviews);
        break;

      case "Lowest Price":
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;

      case "Highest Price":
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;

      default:
        break;
    }

    return list;
  }, [providers, minRating, maxDistance, priceRange, sort, verifiedOnly, openNowOnly, nearbyOnly]);


  function resetFilters() {
    setSort("Best Match");
    setMinRating(0);
    setPriceRange(200);
    setMaxDistance(100);
    setVerifiedOnly(false);
    setOpenNowOnly(false);
    setNearbyOnly(false);
  }

  return {
  
    filteredProviders,
    sort,
    minRating,
    priceRange,
    maxDistance,
    verifiedOnly,
    openNowOnly,
    nearbyOnly,

  
    setSort,
    setMinRating,
    setPriceRange,
    setMaxDistance,
    setVerifiedOnly,
    setOpenNowOnly,
    setNearbyOnly,
    resetFilters,
  };
}
