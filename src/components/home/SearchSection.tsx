"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Loader2,
  Brain,
  ArrowRight,
  X,
  History,
  Clock,
  Trash2,
  Droplets,
  Fan,
  Snowflake,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const EXAMPLE_TAGS: { text: string; icon: LucideIcon }[] = [
  { text: "sink is clogged", icon: Droplets },
  { text: "install ceiling fan", icon: Fan },
  { text: "ac not cooling", icon: Snowflake },
  { text: "fix leaking tap", icon: Wrench },
];

interface ClassificationResult {
  success: boolean;
  query: string;
  matched?: boolean;
  category: string | null;
  categoryId: string | null;
  categoryName: string | null;
  confidence: number;
  allMatches: Array<{
    category: string;
    categoryId: string | null;
    categoryName: string;
    similarity: number;
  }>;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  filters: any;
  createdAt: string;
}

interface SearchSectionProps {
  onClearSearch?: () => void;
}

export default function SearchSection({ onClearSearch }: SearchSectionProps) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  // Check authentication and fetch search history
  useEffect(() => {
    const checkAuthAndFetchHistory = async () => {
      try {
        // Check if user is authenticated
        const userRes = await fetch('/api/user');
        if (userRes.ok) {
          setIsAuthenticated(true);
          fetchSearchHistory();
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };

    checkAuthAndFetchHistory();
  }, []);

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };

    if (showHistory) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHistory]);

  const fetchSearchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch('/api/search/history');
      if (response.ok) {
        const data = await response.json();
        setSearchHistory(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch search history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveSearchToHistory = async (searchQuery: string) => {
    if (!isAuthenticated || !searchQuery.trim()) return;

    try {
      const response = await fetch('/api/search/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (response.ok) {
        fetchSearchHistory(); // Refresh history
      }
    } catch (err) {
      console.error('Failed to save search history:', err);
    }
  };

  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/search/history/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSearchHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const clearAllHistory = async () => {
    try {
      const response = await fetch('/api/search/history', {
        method: 'DELETE',
      });

      if (response.ok) {
        setSearchHistory([]);
        setShowHistory(false);
      }
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const selectHistoryItem = (historyQuery: string) => {
    setQuery(historyQuery);
    setShowHistory(false);
    // Auto-trigger search when selecting from history
    setTimeout(() => {
      handleSearch(historyQuery);
    }, 100);
  };

  const handleClear = () => {
    setQuery("");
    setResult(null);
    setError(null);
    setShowHistory(false);
    
    // Clear AI search results on home page
    if (onClearSearch) {
      onClearSearch();
    }
    
    // Trigger event to clear any filtered providers
    window.dispatchEvent(
      new CustomEvent("aiSearchProviders", {
        detail: { category: null, subcategory: null, categoryId: null, categoryName: null },
      })
    );
  };

  const classifyRequest = async (searchQuery: string): Promise<ClassificationResult> => {
    const response = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: searchQuery }),
    });

    if (!response.ok) {
      let message = "Search failed. Please try again.";
      try {
        const body = await response.json();
        if (body?.error) message = body.error;
      } catch {
        // Non-JSON error response; keep the default message.
      }
      const error = new Error(message) as Error & { retryable?: boolean };
      error.retryable = response.status >= 500;
      throw error;
    }

    return response.json();
  };

  const handleSearch = async (searchQuery?: string | React.MouseEvent) => {
    // If searchQuery is an event object (from onClick), use the current query state
    const queryToSearch = (typeof searchQuery === 'string' ? searchQuery : query) || query;
    
    if (!queryToSearch || typeof queryToSearch !== 'string' || !queryToSearch.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setShowHistory(false);

    try {
      let data: ClassificationResult;
      try {
        data = await classifyRequest(queryToSearch);
      } catch (firstErr: any) {
        // Server errors are often transient cold starts — retry once before
        // surfacing an error to the user.
        if (firstErr?.retryable === false) throw firstErr;
        await new Promise((resolve) => setTimeout(resolve, 1200));
        data = await classifyRequest(queryToSearch);
      }

      setResult(data);

      // Save to history after successful search
      await saveSearchToHistory(queryToSearch);

      // Don't trigger search yet - wait for user to click button
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFindProviders = (category: string, categoryId: string | null, categoryName: string) => {
    // Trigger AI search on home page
    window.dispatchEvent(
      new CustomEvent("aiSearchProviders", {
        detail: { category, categoryId, categoryName },
      })
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") handleClear();
  };

  const formatCategoryName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative w-full overflow-hidden border-b border-[#D1E7DD] bg-[#f5f7f8] pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20 -mt-px"
    >
      {/* Uniform texture — even tone across the full section */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(16,185,129,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#10B981]/10" />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-[800px] text-3xl font-extrabold leading-[1.1] tracking-tight text-[#0F172A] sm:text-4xl lg:text-[3.25rem]"
          >
            Find the perfect service,{" "}
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#059669] bg-clip-text text-transparent"
            >
              your way.
            </motion.span>
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-4 max-w-[600px] text-base leading-relaxed text-[#64748B] sm:mt-5 sm:text-lg"
          >
            Tell us what you need and our AI matches you with the right professional.
          </motion.p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          layout
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:mt-10 sm:p-8 lg:mt-12"
        >
          <div className="flex w-full flex-col gap-3 rounded-[20px] border border-[#E2E8F0]/80 bg-white shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 focus-within:border-[#10B981]/40 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.1),0_4px_16px_rgba(16,185,129,0.08)] sm:flex-row sm:items-center sm:gap-0">
            <div className="flex min-h-[72px] w-full min-w-0 flex-1 items-center gap-3 px-4 py-3 sm:py-0">
              <motion.div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] shadow-md shadow-emerald-500/20"
                animate={reduceMotion ? undefined : { rotate: loading ? 360 : 0 }}
                transition={{ duration: 2, repeat: loading ? Infinity : 0 }}
              >
                <Search className="h-6 w-6 text-white" />
              </motion.div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => isAuthenticated && searchHistory.length > 0 && setShowHistory(true)}
                placeholder="What do you need help with?"
                className="min-w-0 flex-1 bg-transparent text-base font-medium text-[#0F172A] outline-none placeholder:font-normal placeholder:text-[#94A3B8] sm:text-lg"
                disabled={loading}
                aria-label="Search services"
              />

              {!query && isAuthenticated && searchHistory.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl p-2 text-[#10B981] transition-colors hover:bg-emerald-50"
                  title="View search history"
                >
                  <History className="h-4 w-4" />
                  <span className="text-xs font-semibold">{searchHistory.length}</span>
                </motion.button>
              )}

              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleClear}
                  className="shrink-0 rounded-xl p-2 transition-colors hover:bg-slate-100"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-[#94A3B8]" />
                </motion.button>
              )}
            </div>

            <div className="flex w-full items-center px-3 pb-3 sm:w-auto sm:px-0 sm:pb-0 sm:pr-3">
              <motion.button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-[0_0_24px_rgba(16,185,129,0.45)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto sm:min-w-[148px]"
                aria-disabled={loading || !query.trim()}
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <AnimatePresence mode="wait" initial={false}>
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 3 }}
                      className="relative inline-flex items-center gap-2"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Analyzing…</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="search"
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 3 }}
                      className="relative inline-flex items-center gap-2"
                    >
                      <span>AI Search</span>
                      <Brain className="h-5 w-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Search History Dropdown */}
          <AnimatePresence>
            {showHistory && isAuthenticated && searchHistory.length > 0 && (
              <motion.div
                ref={historyRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="mt-3 bg-white border-2 border-emerald-100 rounded-xl shadow-xl overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 bg-emerald-50 px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 sm:text-sm">Recent Searches</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                      {searchHistory.length}
                    </span>
                  </div>
                  <button
                    onClick={clearAllHistory}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {searchHistory.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => selectHistoryItem(item.query)}
                          className="group flex items-center justify-between px-4 py-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-emerald-100 transition-colors">
                              <Search className="w-4 h-4 text-gray-500 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                                {item.query}
                              </p>
                              <p className="text-xs text-gray-500 group-hover:text-emerald-600">
                                {new Date(item.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => deleteHistoryItem(item.id, e)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove from history"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium"
                role="alert"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Match Found */}
          <AnimatePresence>
            {result && (result.matched === false || !result.category) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 text-left sm:p-6"
                role="status"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                      <Search className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                        No results found
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-amber-900">
                        We couldn&apos;t match &ldquo;{result.query}&rdquo; to any of our
                        services. Try describing the problem differently, e.g.
                        &ldquo;fix leaking tap&rdquo; or &ldquo;ac not cooling&rdquo;.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClear}
                    className="rounded-lg p-2 transition hover:bg-white/60"
                    aria-label="Clear results"
                  >
                    <X className="h-5 w-5 text-amber-700" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Results */}
          <AnimatePresence>
            {result && result.matched !== false && result.category && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6 text-left"
              >
                <motion.div
                  layout
                  className="relative mb-4 overflow-hidden rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 shadow-md sm:p-6"
                >
                  {/* Animated Background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/10"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity
                    }}
                    style={{ backgroundSize: '200% 200%' }}
                  />

                  <div className="relative z-10">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <motion.div 
                          className="rounded-xl bg-emerald-600 p-2 shadow-md"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity }}
                        >
                          <Brain className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                        </motion.div>
                        <h3 className="text-lg font-bold text-slate-900 sm:text-xl">AI Match Found!</h3>
                      </div>
                      <button
                        onClick={handleClear}
                        className="p-2 hover:bg-white/50 rounded-lg transition"
                        aria-label="Clear results"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col gap-2 p-3 bg-white/80 backdrop-blur rounded-xl"
                      >
                        <span className="text-xs text-gray-600 font-medium">Category</span>
                        <span className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-lg shadow-md">
                          {result.categoryName || formatCategoryName(result.category!)}
                        </span>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col gap-2 p-3 bg-white/80 backdrop-blur rounded-xl"
                      >
                        <span className="text-xs text-gray-600 font-medium">Confidence</span>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${result.confidence * 100}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                          <motion.span 
                            className="text-sm font-bold text-emerald-700"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            {(result.confidence * 100).toFixed(1)}%
                          </motion.span>
                        </div>
                      </motion.div>
                    </div>

                    {result.categoryId ? (
                      <motion.button
                        onClick={() => handleFindProviders(result.category!, result.categoryId, result.categoryName ?? formatCategoryName(result.category!))}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg sm:gap-3 sm:py-4 sm:text-base"
                      >
                        Find providers
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-center text-sm font-semibold text-amber-900">
                        No providers offer this service yet. Please check back soon.
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Alternative Matches (only ones that map to a real category) */}
                {result.allMatches && result.allMatches.slice(1).filter((m) => m.categoryId).length > 0 && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-5 border-2 border-gray-200 shadow-md"
                  >
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                      Other Possible Matches
                    </h4>
                    <div className="space-y-2">
                      {result.allMatches.slice(1).filter((m) => m.categoryId).slice(0, 3).map((match, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          onClick={() => handleFindProviders(match.category, match.categoryId, match.categoryName)}
                          className="group flex cursor-pointer flex-col gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 p-3 transition-all hover:border-emerald-400 hover:bg-emerald-50 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 group-hover:from-emerald-500 group-hover:to-teal-600 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 group-hover:text-white transition-all">
                              {idx + 2}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition">
                                {match.categoryName || formatCategoryName(match.category)}
                              </div>
                              <div className="text-xs text-gray-500">Click to search providers</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-600 transition">
                              {(match.similarity * 100).toFixed(1)}%
                            </span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Example Tags (also shown after a no-match search to suggest retries) */}
          {(!result || result.matched === false || !result.category) && !loading && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-5 rounded-2xl border border-[#E2E8F0]/70 bg-[#F8FAFC]/90 p-3.5 text-left sm:mt-7 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0"
            >
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#64748B] sm:mb-3 sm:text-sm sm:normal-case sm:tracking-normal">
                Try these examples
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
                {EXAMPLE_TAGS.map(({ text, icon: Icon }, index) => (
                  <motion.button
                    key={text}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.06, duration: 0.4 }}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    onClick={() => setQuery(text)}
                    className="group flex w-full items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-2.5 text-left text-xs font-semibold leading-tight text-[#0F172A] shadow-sm transition-all duration-200 active:border-[#10B981]/50 active:bg-emerald-50/50 sm:inline-flex sm:w-auto sm:rounded-full sm:px-4 sm:py-2.5 sm:text-sm sm:font-medium sm:hover:border-[#10B981]/50 sm:hover:bg-emerald-50/50 sm:hover:shadow-md sm:hover:shadow-emerald-500/10"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#10B981] transition-colors group-active:bg-emerald-100 sm:h-6 sm:w-6 sm:rounded-full sm:group-hover:bg-emerald-100">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="line-clamp-2 min-w-0">{text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
