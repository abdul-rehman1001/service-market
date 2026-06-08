'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2, LocateFixed, MapPin, X } from 'lucide-react';

export interface DefaultLocationMapModalProps {
  open: boolean;
  initialLat: number;
  initialLng: number;
  saving?: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: (lat: number, lng: number) => void;
}

export default function DefaultLocationMapModal({
  open,
  initialLat,
  initialLng,
  saving = false,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
}: DefaultLocationMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng });
  const [locating, setLocating] = useState(false);

  const updateMarker = useCallback((lat: number, lng: number) => {
    setPosition({ lat, lng });
    markerRef.current?.setLngLat([lng, lat]);
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 600 });
  }, []);

  useEffect(() => {
    if (!open) return;
    setPosition({ lat: initialLat, lng: initialLng });
    setMapLoaded(false);
  }, [open, initialLat, initialLng]);

  useEffect(() => {
    if (!open || !mapContainerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLng, initialLat],
      zoom: 14,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    const marker = new mapboxgl.Marker({ color: '#10B981', draggable: true })
      .setLngLat([initialLng, initialLat])
      .addTo(map);

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      setPosition({ lat: lngLat.lat, lng: lngLat.lng });
    });

    map.on('load', () => setMapLoaded(true));

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      setMapLoaded(false);
    };
  }, [open, initialLat, initialLng]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateMarker(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 12000 }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#111827]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[#E5E7EB] bg-white shadow-2xl sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="default-location-map-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h3 id="default-location-map-title" className="text-lg font-bold text-[#1E3A5F]">
              {title}
            </h3>
            <p className="mt-1 text-sm text-[#6B7280]">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F5F7F8] disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative h-64 w-full sm:h-80">
          <div ref={mapContainerRef} className="h-full w-full" />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F9FAFB]">
              <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-[#E5E7EB] px-4 py-4 sm:px-5">
          <div className="flex items-start gap-2 rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" />
            <div className="min-w-0 text-xs text-[#374151]">
              <p className="font-semibold text-[#1E3A5F]">Drag the pin to adjust your position</p>
              <p className="mt-0.5 font-mono text-[11px] text-[#6B7280]">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating || saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#1E3A5F] shadow-sm transition hover:border-[#10B981]/40 hover:bg-[#F5F7F8] disabled:opacity-50"
          >
            {locating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LocateFixed size={16} className="text-[#059669]" />
            )}
            Use my current location
          </button>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#F3F4F6] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(position.lat, position.lng)}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition hover:bg-[#059669] disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
