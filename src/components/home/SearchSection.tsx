"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchSection() {
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");

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
              onClick={() => setActiveTab("manual")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                activeTab === "manual"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Manual Search
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                activeTab === "ai"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              🔍 AI-Powered
            </button>
          </div>

          {/* Input + Button */}
          <div className="flex items-center gap-3 w-full border rounded-xl px-4 py-3 shadow-sm">
            <Search className="w-5 h-5 text-gray-500" />

            <input
              type="text"
              placeholder={
                activeTab === "manual"
                  ? "What service are you looking for?"
                  : "Describe your needs and AI will help..."
              }
              className="flex-1 outline-none text-gray-700"
            />

            <button className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition">
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
