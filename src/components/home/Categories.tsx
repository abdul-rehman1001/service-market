'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Wrench,
  Circle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  displayOrder: number;
  servicesCount?: number;
}

export default function Categories() {
  const reduceMotion = useReducedMotion();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handler = (event: Event) => {
      const { category } = (event as CustomEvent).detail || {};
      setActiveCategory(category ?? null);
    };

    window.addEventListener('filterProviders', handler);
    return () => window.removeEventListener('filterProviders', handler);
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

  const handleCategoryClick = (cat: Category) => {
    window.dispatchEvent(
      new CustomEvent('filterProviders', {
        detail: {
          category: cat.name.toLowerCase().replace(/\s+/g, '_'),
          categoryId: cat.id,
          categoryName: cat.name,
          source: 'category',
        },
      })
    );
  };

  return (
    <section className="w-full border-t border-[#E2E8F0]/80 bg-white py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
              Categories
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl lg:text-4xl">
              Browse by Category
            </h2>
          </div>
          <p className="text-xs font-medium text-[#64748B] sm:text-sm">
            Swipe to explore more
          </p>
        </motion.div>

        {loading && (
          <div className="flex gap-4 overflow-hidden py-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[8.5rem] w-[8.5rem] shrink-0 animate-pulse rounded-3xl border border-[#E2E8F0]/80 bg-[#F8FAFC] sm:h-[9.5rem] sm:w-40"
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="flex gap-3 rounded-2xl border border-red-200/80 bg-red-50/50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="group relative">
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Scroll categories left"
                className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E2E8F0] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.1)] transition hover:border-[#10B981]/40 hover:bg-emerald-50/50 md:flex md:opacity-0 md:group-hover:opacity-100 lg:-left-3 lg:h-11 lg:w-11"
              >
                <ChevronLeft className="h-5 w-5 text-[#0F172A]" />
              </button>
            )}

            {canScrollRight && (
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll categories right"
                className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E2E8F0] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.1)] transition hover:border-[#10B981]/40 hover:bg-emerald-50/50 md:flex md:opacity-0 md:group-hover:opacity-100 lg:-right-3 lg:h-11 lg:w-11"
              >
                <ChevronRight className="h-5 w-5 text-[#0F172A]" />
              </button>
            )}

            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth py-4 snap-x snap-proximity [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
            >
              {categories.map((cat, index) => {
                const isActive =
                  activeCategory === cat.name.toLowerCase().replace(/\s+/g, '_');

                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.04,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    onClick={() => handleCategoryClick(cat)}
                    className={`
                      group/card relative flex w-[8.5rem] shrink-0 snap-start flex-col items-center
                      rounded-3xl border px-3 py-5 transition-all duration-300
                      sm:w-40 sm:px-4 sm:py-6
                      ${
                        isActive
                          ? 'border-transparent bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-[0_8px_28px_rgba(16,185,129,0.35)]'
                          : 'border-[#E2E8F0] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:border-[#10B981]/40 hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)]'
                      }
                    `}
                  >
                    <div
                      className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 sm:h-14 sm:w-14 ${
                        isActive
                          ? 'bg-white/20 ring-2 ring-white/30'
                          : 'bg-emerald-50 ring-2 ring-[#10B981]/10 group-hover/card:bg-emerald-100/80 group-hover/card:ring-[#10B981]/25'
                      }`}
                    >
                      {cat.icon ? (
                        <span className="text-2xl leading-none sm:text-3xl">{cat.icon}</span>
                      ) : (
                        <Wrench
                          className={`h-6 w-6 sm:h-7 sm:w-7 ${
                            isActive ? 'text-white' : 'text-[#10B981]'
                          }`}
                        />
                      )}
                    </div>

                    <span className="line-clamp-2 text-center text-xs font-bold leading-tight tracking-tight sm:text-sm">
                      {cat.name}
                    </span>

                    {cat.servicesCount !== undefined && (
                      <span
                        className={`mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${
                          isActive
                            ? 'bg-white/20 text-white/90'
                            : 'bg-[#F8FAFC] text-[#64748B] group-hover/card:bg-emerald-50/80 group-hover/card:text-[#059669]'
                        }`}
                      >
                        {cat.servicesCount} services
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] py-12 text-center">
            <Circle className="mx-auto mb-3 h-8 w-8 text-[#94A3B8]" />
            <p className="text-sm font-medium text-[#64748B]">No categories available</p>
          </div>
        )}
      </div>
    </section>
  );
}
