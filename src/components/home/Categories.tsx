"use client";

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
  Home,
  Brush,
  Settings,
  Laptop,
  Leaf,
  Palette,
  BookOpen,
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
  const [activeCategory, setActiveCategory] = useState(null);
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

  const scroll = (direction: string) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
   <div className="w-full py-12 bg-[#f5f7f8] border-t border-gray-300">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Browse by Category</h2>

        <div className="relative group">
          {/* Left scroll button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl hover:border-emerald-300"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Right scroll button */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl hover:border-emerald-300"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}

          <div className="relative">
            {/* Left fade gradient */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-[5] pointer-events-none" />
            )}
            
            {/* Right fade gradient */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-[5] pointer-events-none" />
            )}

            <div 
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;

                return (
                  <button
                    key={cat.id}
                    className={`flex flex-col items-center justify-center w-40 h-36 rounded-3xl border-2 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer flex-shrink-0 ${
                      isActive 
                        ? 'bg-emerald-500 border-emerald-600 shadow-xl' 
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-lg hover:border-emerald-300'
                    }`}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('filterProviders', { detail: { category: cat.key, subcategory: null } }));
                    }}
                  >
                    <Icon className={`w-10 h-10 mb-3 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                    <span className={`text-sm font-semibold text-center px-2 ${isActive ? 'text-white' : 'text-gray-800'}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        div[style*="scrollbarWidth"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}