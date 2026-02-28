// src/components/services/SearchMap/SearchMap.tsx
"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Phone, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Provider {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  baseAddress: string;
  rating: number;
  distance?: number;
}

interface SearchMapProps {
  location: string;
  providers?: Provider[];
  userLocation?: { lat: number; lng: number };
  radius?: number;
  onProviderSelect?: (provider: Provider) => void;
}

export default function SearchMap({
  location,
  providers = [],
  userLocation,
  radius = 0,
  onProviderSelect,
}: SearchMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: userLocation ? [userLocation.lng, userLocation.lat] : [67.0011, 24.8607],
        zoom: 13,
      });

      map.current.on("load", () => {
        setMapLoaded(true);

        // Add user location marker if available
        if (userLocation) {
          new mapboxgl.Marker({ color: "#10b981" })
            .setLngLat([userLocation.lng, userLocation.lat])
            .addTo(map.current!);
        }

        // Add radius circle if radius is set
        if (radius > 0 && userLocation) {
          addRadiusCircle(radius, [userLocation.lng, userLocation.lat]);
        }
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error("Mapbox initialization error:", error);
    }
  }, [userLocation, radius]);

  // Add radius circle to map
  const addRadiusCircle = (radiusKm: number, center: [number, number]) => {
    if (!map.current) return;

    if (map.current.getSource("radius-circle")) {
      map.current.removeLayer("radius-layer");
      map.current.removeSource("radius-circle");
    }

    const radiusGeoJson = createRadiusGeoJson(center, radiusKm);

    map.current.addSource("radius-circle", {
      type: "geojson",
      data: radiusGeoJson,
    });

    map.current.addLayer({
      id: "radius-layer",
      type: "fill",
      source: "radius-circle",
      paint: {
        "fill-color": "#10b981",
        "fill-opacity": 0.1,
      },
    });

    map.current.addLayer({
      id: "radius-border",
      type: "line",
      source: "radius-circle",
      paint: {
        "line-color": "#10b981",
        "line-width": 2,
        "line-opacity": 0.5,
        "line-dasharray": [5, 5],
      },
    });
  };

  // Helper function to create radius circle GeoJSON
  const createRadiusGeoJson = (
    center: [number, number],
    radiusKm: number
  ): GeoJSON.Feature<GeoJSON.Polygon> => {
    const points = 64;
    const coordinates = [];

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * (2 * Math.PI);
      // Convert radius from km to degrees (approximate)
      const radiusDeg = radiusKm / 111.12;
      const lon = center[0] + radiusDeg * Math.cos(angle);
      const lat = center[1] + radiusDeg * Math.sin(angle);
      coordinates.push([lon, lat]);
    }

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [coordinates],
      },
    };
  };

  // Update provider markers
  useEffect(() => {
    if (!map.current || !mapLoaded || providers.length === 0) return;

    // Remove existing provider markers
    {
      const existingMarkers = document.querySelectorAll(".provider-marker");
      existingMarkers.forEach((marker) => marker.remove());
    }

    // Add new provider markers
    providers.forEach((provider) => {
      const el = document.createElement("div");
      el.className =
        "provider-marker w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-125 transition border-2 border-white";
      el.innerHTML = `<span class="text-white font-bold text-sm">${Math.round(
        provider.rating
      )}</span>`;

      el.addEventListener("click", () => {
        setSelectedProvider(provider);
        onProviderSelect?.(provider);
        map.current?.flyTo({
          center: [provider.longitude, provider.latitude],
          zoom: 15,
          duration: 1000,
        });
      });

      new mapboxgl.Marker({ element: el })
        .setLngLat([provider.longitude, provider.latitude])
        .addTo(map.current!);
    });
  }, [providers, mapLoaded, onProviderSelect]);

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-full rounded-2xl overflow-hidden"
      />

      {/* Map Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-700 font-semibold">Loading map...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 bg-white rounded-xl shadow-lg p-4 border-2 border-gray-200"
      >
        <h3 className="font-bold text-gray-900 mb-3 text-sm">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-gray-700">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600"></div>
            <span className="text-xs text-gray-700">Provider</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-emerald-500" style={{ width: "16px" }}></div>
            <span className="text-xs text-gray-700">Search Radius</span>
          </div>
        </div>
      </motion.div>

      {/* Selected Provider Info Card */}
      <AnimatePresence>
        {selectedProvider && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 bg-white rounded-xl shadow-2xl border-2 border-emerald-200 overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
              <h3 className="font-bold text-gray-900">{selectedProvider.name}</h3>
              <p className="text-xs text-gray-600 mt-1">
                <MapPin className="w-3 h-3 inline mr-1" />
                {selectedProvider.baseAddress}
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Rating
                  </span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                    ★ {selectedProvider.rating.toFixed(1)}
                  </span>
                </div>
                {selectedProvider.distance && (
                  <span className="text-sm font-semibold text-blue-600">
                    {selectedProvider.distance.toFixed(1)} km away
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Call</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Message</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Data Message */}
      {mapLoaded && providers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm rounded-2xl"
        >
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">
              No providers found. Adjust your filters.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
