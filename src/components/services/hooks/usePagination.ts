import { useState } from "react";

export function usePagination<T>(items: T[], perPage: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(items.length / perPage);

  const start = (currentPage - 1) * perPage;
  const paginatedItems = items.slice(start, start + perPage);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goNext: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    goPrev: () => setCurrentPage((p) => Math.max(p - 1, 1)),
    goTo: setCurrentPage,
  };
}
