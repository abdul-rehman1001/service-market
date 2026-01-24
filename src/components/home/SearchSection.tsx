"use client";

import { useState } from "react";
import { Search, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ClassificationResult {
  success: boolean;
  query: string;
  category: string;
  subcategory: string;
  confidence: number;
  allMatches: Array<{
    category: string;
    subcategory: string;
    similarity: number;
  }>;
}

export default function SearchSection() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Classification failed");
      const data = await response.json();
      setResult(data);

      window.dispatchEvent(
        new CustomEvent("filterProviders", {
          detail: { category: data.category ?? null, subcategory: data.subcategory ?? null },
        })
      );
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const formatCategoryName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
  const formatSubcategoryName = (name: string) =>
    name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full bg-white pt-10 pb-16"
    >
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
          Find the perfect service, <span className="text-emerald-600">your way.</span>
        </h1>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Describe the problem and our AI will suggest the best professional — or search manually.
        </p>

        {/* Search Box */}
        <motion.div
          layout
          className="mt-10 bg-white shadow-xl rounded-2xl p-6"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full border rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50">
                <Search className="w-5 h-5 text-emerald-600" />
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your service needs (e.g. 'sink clogged', 'AC not cooling')"
                className="flex-1 text-gray-700 bg-transparent outline-none placeholder:text-gray-400 text-sm sm:text-base"
                disabled={loading}
                aria-label="Search services"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                aria-disabled={loading || !query.trim()}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 3 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analyzing…</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="search"
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 3 }}
                      className="inline-flex items-center gap-2"
                    >
                      <span>Search</span>
                      <Sparkles className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                role="status"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.28 }}
                className="mt-6 text-left"
              >
                <motion.div
                  layout
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 mb-4 shadow-sm"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-md bg-emerald-100">
                          <Sparkles className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">AI Match Found</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">Category</span>
                          <span className="px-3 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full">
                            {formatCategoryName(result.category)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">Service Type</span>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                            {formatSubcategoryName(result.subcategory)}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          <span className="text-sm text-gray-600">Confidence</span>
                          <div className="flex items-center gap-3">
                            <div className="w-full max-w-[160px] h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 rounded-full transition-all ease-out"
                                style={{ width: `${result.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-emerald-700">
                              {(result.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("filterProviders", {
                              detail: { category: result.category ?? null, subcategory: result.subcategory ?? null },
                            })
                          );
                        }}
                        className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                      >
                        Find {formatCategoryName(result.category)}s Near You
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Alternative Matches */}
                {result.allMatches && result.allMatches.length > 1 && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                  >
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Other Possible Matches</h4>
                    <div className="space-y-2">
                      {result.allMatches.slice(1, 4).map((match, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.01 }}
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent("filterProviders", {
                                detail: { category: match.category ?? null, subcategory: match.subcategory ?? null },
                              })
                            )
                          }
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                              {idx + 2}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatCategoryName(match.category)} → {formatSubcategoryName(match.subcategory)}
                              </div>
                              <div className="text-xs text-gray-500">Tap to filter providers</div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            {(match.similarity * 100).toFixed(0)}%
                          </span>
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
            <div className="mt-4 text-sm text-gray-500">
              💡 Try examples: <span className="font-medium text-gray-700">"sink is clogged"</span>,{" "}
              <span className="font-medium text-gray-700">"install ceiling fan"</span>, or <span className="font-medium text-gray-700">"ac not cooling"</span>.
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
