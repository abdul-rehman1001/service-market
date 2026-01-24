'use client';

import { useEffect, useRef, useState } from "react";
import {
  Wrench,
  Droplets,
  Circle,
  Battery,
  Zap,
  Hammer,
  Paintbrush,
  Snowflake,
  Plug,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const categories = [
  { id: 1, key: 'engine_repair', label: "Engine Repair", icon: Wrench },
  { id: 2, key: 'oil_change', label: "Oil Change", icon: Droplets },
  { id: 3, key: 'tire_service', label: "Tire Service", icon: Circle },
  { id: 4, key: 'battery_replacement', label: "Battery Replacement", icon: Battery },
  { id: 5, key: 'plumbing', label: "Plumbing", icon: Wrench },
  { id: 6, key: 'electrical', label: "Electrical Repair", icon: Zap },
  { id: 7, key: 'carpentry', label: "Carpentry", icon: Hammer },
  { id: 8, key: 'painting', label: "Painting", icon: Paintbrush },
  { id: 9, key: 'ac_repair', label: "A/C Repair", icon: Snowflake },
  { id: 10, key: 'appliance_repair', label: "Appliance Repair", icon: Plug },
];

export default function Categories() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: any) => {
      const { category } = event.detail || {};
      setActiveCategory(category ?? null);
    };
    window.addEventListener('filterProviders', handler as EventListener);
    return () => window.removeEventListener('filterProviders', handler as EventListener);
  }, []);

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="w-full py-12 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Browse by Category</h2>

        <div className="relative group">
          {/* Scroll Buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-lg"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-lg"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.key;

              return (
                <button
                  key={cat.id}
                  className={`
                    flex flex-col items-center justify-center w-40 h-36 snap-start rounded-3xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105
                    flex-shrink-0
                    ${isActive
                      ? 'bg-emerald-500 border-emerald-600 shadow-xl text-white'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md hover:border-emerald-300 text-gray-800'
                    }
                  `}
                  onClick={() => window.dispatchEvent(new CustomEvent('filterProviders', { detail: { category: cat.key } }))}
                >
                  <div className={`w-12 h-12 mb-2 flex items-center justify-center rounded-full transition-colors duration-300 ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-center px-2">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        div[style*="scrollbarWidth"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
