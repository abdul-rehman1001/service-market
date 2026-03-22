"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Sparkles, ArrowRight, X, History, Clock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ClassificationResult {
  success: boolean;
  query: string;
  category: string;
  categoryId: string | null;
  categoryName: string;
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

  const handleSearch = async (searchQuery?: string | React.MouseEvent) => {
    // If searchQuery is an event object (from onClick), use the current query state
    const queryToSearch = (typeof searchQuery === 'string' ? searchQuery : query) || query;
    
    if (!queryToSearch || typeof queryToSearch !== 'string' || !queryToSearch.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setShowHistory(false);

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryToSearch }),
      });

      if (!response.ok) throw new Error("Classification failed");
      const data = await response.json();
      setResult(data);

      // Save to history after successful search
      await saveSearchToHistory(queryToSearch);

      // Don't trigger search yet - wait for user to click button
    } catch (err: any) {
      setError(err.message || "Something went wrong");
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 pt-10 pb-16"
    >
      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Find the perfect service, <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">your way.</span>
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Describe the problem and our AI will suggest the best professional — or search manually.
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-10 bg-white shadow-2xl rounded-2xl p-6 border border-emerald-100"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 transition-all">
            <div className="flex items-center gap-3 w-full">
              <motion.div 
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600"
                animate={{ rotate: loading ? 360 : 0 }}
                transition={{ duration: 2, repeat: loading ? Infinity : 0, ease: "linear" }}
              >
                <Search className="w-5 h-5 text-white" />
              </motion.div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => isAuthenticated && searchHistory.length > 0 && setShowHistory(true)}
                placeholder="Find providers"
                className="flex-1 text-gray-700 bg-transparent outline-none placeholder:text-gray-400 text-sm sm:text-base"
                disabled={loading}
                aria-label="Search services"
              />

              {!query && isAuthenticated && searchHistory.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 hover:bg-emerald-50 rounded-lg transition flex items-center gap-1.5 text-emerald-600"
                  title="View search history"
                >
                  <History className="w-4 h-4" />
                  <span className="text-xs font-medium">{searchHistory.length}</span>
                </motion.button>
              )}

              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleClear}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <motion.button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                aria-disabled={loading || !query.trim()}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 3 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing…</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="search"
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 3 }}
                      className="inline-flex items-center gap-2"
                    >
                      <span>AI Search</span>
                      <Sparkles className="w-5 h-5" />
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
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-gray-900">Recent Searches</span>
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

          {/* AI Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-6 text-left"
              >
                <motion.div
                  layout
                  className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300 rounded-2xl p-6 mb-4 shadow-lg relative overflow-hidden"
                >
                  {/* Animated Background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/10"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{ backgroundSize: '200% 200%' }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-6 h-6 text-white" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-900">AI Match Found!</h3>
                      </div>
                      <button
                        onClick={handleClear}
                        className="p-2 hover:bg-white/50 rounded-lg transition"
                        aria-label="Clear results"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col gap-2 p-3 bg-white/80 backdrop-blur rounded-xl"
                      >
                        <span className="text-xs text-gray-600 font-medium">Category</span>
                        <span className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-lg shadow-md">
                          {result.categoryName || formatCategoryName(result.category)}
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
                              transition={{ duration: 1, ease: "easeOut" }}
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

                    <motion.button
                      onClick={() => handleFindProviders(result.category, result.categoryId, result.categoryName)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-base"
                    >
                      Find providers
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Alternative Matches */}
                {result.allMatches && result.allMatches.length > 1 && (
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
                      {result.allMatches.slice(1, 4).map((match, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          onClick={() => handleFindProviders(match.category, match.categoryId, match.categoryName)}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-emerald-400 hover:from-emerald-50 hover:to-teal-50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
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
                              {(match.similarity * 100).toFixed(0)}%
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

          {/* Helper Text */}
          {!result && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-5 text-sm text-gray-600 bg-gray-50 rounded-xl p-4 border border-gray-200"
            >
              <p className="font-semibold text-gray-700 mb-2">💡 Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {["sink is clogged", "install ceiling fan", "ac not cooling", "fix leaking tap"].map((example) => (
                  <button
                    key={example}
                    onClick={() => setQuery(example)}
                    className="px-3 py-1 bg-white border border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 rounded-lg text-gray-700 hover:text-emerald-700 transition font-medium"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
