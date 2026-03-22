'use client';

import { useEffect, useRef, useState } from "react";
import {
  Wrench,
  Circle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null; // Now emoji
  displayOrder: number;
  servicesCount?: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories?parentOnly=true');

        if (!response.ok) throw new Error('Failed to fetch categories');

        const data = await response.json();

        if (data.success) {
          setCategories(data.data || []);
          setError(null);
        } else {
          throw new Error(data.error || 'Failed to load categories');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter listener
  useEffect(() => {
    const handler = (event: any) => {
      const { category } = event.detail || {};
      setActiveCategory(category ?? null);
    };

    window.addEventListener('filterProviders', handler);
    return () => window.removeEventListener('filterProviders', handler);
  }, []);

  // Scroll controls
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
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const amount = container.clientWidth * 0.7;

    container.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="w-full py-12 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-3xl font-bold mb-8 text-gray-900">
          Browse by Category
        </h2>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Categories */}
        {!loading && !error && categories.length > 0 && (
          <div className="relative group">

            {/* Scroll Buttons */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Scroll Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
            >
              {categories.map((cat) => {

                const isActive =
                  activeCategory ===
                  cat.name.toLowerCase().replace(/\s+/g, '_');

                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('filterProviders', {
                          detail: {
                            category: cat.name
                              .toLowerCase()
                              .replace(/\s+/g, '_'),
                            categoryId: cat.id,
                            categoryName: cat.name,
                          },
                        })
                      )
                    }
                    className={`
                      flex flex-col items-center justify-center
                      w-40 h-36 rounded-3xl border-2
                      transition-all duration-300
                      flex-shrink-0
                      ${
                        isActive
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'bg-white border-gray-200 hover:shadow-md'
                      }
                    `}
                  >
                    {/* ICON */}
                    <div className="w-12 h-12 mb-2 flex items-center justify-center rounded-full bg-emerald-50">

                      {cat.icon ? (
                        <span className="text-2xl leading-none">
                          {cat.icon}
                        </span>
                      ) : (
                        <Wrench className="w-6 h-6 text-emerald-600" />
                      )}

                    </div>

                    <span className="text-sm font-semibold text-center px-2">
                      {cat.name}
                    </span>

                    {cat.servicesCount !== undefined && (
                      <span className="text-xs mt-1 opacity-70">
                        {cat.servicesCount} services
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-12">
            <Circle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              No categories available
            </p>
          </div>
        )}

      </div>
    </section>
  );
}