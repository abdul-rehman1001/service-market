"use client";

import { useState } from "react";
import { Search, Loader2, Sparkles, ArrowRight } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    if (activeTab === "manual") {
      // Manual search - just redirect or handle normally
      console.log("Manual search:", query);
      // You can add your manual search logic here
      return;
    }

    // AI-powered search
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Classification failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatCategoryName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const formatSubcategoryName = (name: string) => {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <section className="w-full bg-white pt-10 pb-16 border-b">
      <div className="max-w-4xl mx-auto px-6 text-center">

        {/* Heading */}
        <h1 className="text-4xl font-bold text-gray-900">
          Find the perfect service, <span className="text-emerald-600">your way.</span>
        </h1>
        <p className="text-gray-600 mt-3">
          Search manually or let our AI match you with the perfect professional.
        </p>

        {/* Search Box Container */}
        <div className="mt-10 bg-white shadow-lg rounded-2xl p-6">
          
          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => {
                setActiveTab("manual");
                setResult(null);
                setError(null);
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                activeTab === "manual"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Manual Search
            </button>

            <button
              onClick={() => {
                setActiveTab("ai");
                setResult(null);
                setError(null);
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                activeTab === "ai"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered
            </button>
          </div>

          {/* Input + Button */}
          <div className="flex items-center gap-3 w-full border rounded-xl px-4 py-3 shadow-sm">
            <Search className="w-5 h-5 text-gray-500" />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                activeTab === "manual"
                  ? "What service are you looking for?"
                  : "Describe your needs and AI will help..."
              }
              className="flex-1 outline-none text-gray-700"
              disabled={loading}
            />

            <button 
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* AI Results */}
          {result && activeTab === "ai" && (
            <div className="mt-6 text-left">
              {/* Main Result Card */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        AI Match Found!
                      </h3>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="px-3 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full">
                          {formatCategoryName(result.category)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Service Type:</span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                          {formatSubcategoryName(result.subcategory)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-600 rounded-full transition-all"
                              style={{ width: `${result.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-emerald-700">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                      Find {formatCategoryName(result.category)}s Near You
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Alternative Matches */}
              {result.allMatches && result.allMatches.length > 1 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Other Possible Matches:
                  </h4>
                  <div className="space-y-2">
                    {result.allMatches.slice(1, 4).map((match, idx) => (
                      <div 
                        key={idx}
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
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">
                          {(match.similarity * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Helper Text */}
          {activeTab === "ai" && !result && !loading && (
            <div className="mt-4 text-sm text-gray-500">
              💡 Try: "my sink is clogged", "need to fix broken chair", "install ceiling fan"
            </div>
          )}
        </div>
      </div>
    </section>
  );
}