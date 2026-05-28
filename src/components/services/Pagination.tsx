"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onSelect,
}: Props) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Show range around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < totalPages - 1) pages.push("...");

    // Always show last page if more than 1 page
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex items-center justify-between gap-3 lg:order-1 lg:justify-start">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrev}
          disabled={currentPage === 1}
          className="flex min-w-0 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-3 text-gray-700 transition hover:border-emerald-500 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white sm:px-4"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Previous</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="flex min-w-0 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-3 text-gray-700 transition hover:border-emerald-500 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white sm:px-4 lg:ml-0"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-2 lg:order-2 lg:w-auto lg:flex-1">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-1 text-gray-400 sm:px-2">
              ...
            </span>
          ) : (
            <motion.button
              key={page}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(page as number)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg font-bold transition sm:h-10 sm:w-10 ${
                currentPage === page
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                  : "border-2 border-gray-200 bg-white text-gray-700 hover:border-emerald-500 hover:text-emerald-600"
              }`}
            >
              {page}
            </motion.button>
          ),
        )}
      </div>

      <div className="hidden sm:block rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2">
        <span className="text-sm font-semibold text-gray-700">
          Page <span className="text-emerald-600">{currentPage}</span> of{" "}
          <span className="text-emerald-600">{totalPages}</span>
        </span>
      </div>
    </motion.div>
  );
}
