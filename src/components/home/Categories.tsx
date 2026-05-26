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
    <section className="w-full border-t border-slate-200 bg-white py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-1 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Categories
            </p>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
              Browse by Category
            </h2>
          </div>
          <p className="text-xs text-slate-500 sm:text-sm">
            Swipe to explore more
          </p>
        </div>

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
                type="button"
                onClick={() => scroll('left')}
                aria-label="Scroll categories left"
                className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition hover:bg-emerald-50 sm:h-11 sm:w-11 md:opacity-0 md:group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5 text-slate-700" />
              </button>
            )}

            {canScrollRight && (
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll categories right"
                className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition hover:bg-emerald-50 sm:h-11 sm:w-11 md:opacity-0 md:group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5 text-slate-700" />
              </button>
            )}

            {/* Scroll Container */}
            <div
              ref={scrollContainerRef}
              className="-mx-1 flex gap-3 overflow-x-auto scroll-smooth px-1 pb-2 snap-x snap-mandatory [scrollbar-width:none] sm:gap-4 sm:pb-4 [&::-webkit-scrollbar]:hidden"
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
                            source: 'category',
                          },
                        })
                      )
                    }
                    className={`
                      flex w-[7.5rem] shrink-0 snap-start flex-col items-center justify-center
                      rounded-2xl border-2 px-2 py-4
                      transition-all duration-200
                      sm:w-36 sm:rounded-3xl sm:py-5
                      ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-200/60'
                          : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'
                      }
                    `}
                  >
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 ${
                        isActive ? 'bg-white/20' : 'bg-emerald-50'
                      }`}
                    >
                      {cat.icon ? (
                        <span className="text-xl leading-none sm:text-2xl">
                          {cat.icon}
                        </span>
                      ) : (
                        <Wrench className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                      )}
                    </div>

                    <span className="line-clamp-2 text-center text-xs font-semibold leading-tight sm:text-sm">
                      {cat.name}
                    </span>

                    {cat.servicesCount !== undefined && (
                      <span className={`mt-1 text-[10px] sm:text-xs ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
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