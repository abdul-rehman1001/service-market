"use client";

import { useState } from "react";
import SortDropdown from "./filters/SortDropdown";
import FilterButton from "./filters/FilterButton";
import FilterTag from "./filters/FilterTag";
import FilterPopup from "./FilterPopup";

interface FilterBarProps {
  setSort: (value: string) => void;
  setVerified: (value: boolean | ((prev: boolean) => boolean)) => void;
  setOpenNow: (value: boolean | ((prev: boolean) => boolean)) => void;
  setNearby: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export default function FilterBar({
  setSort,
  setVerified,
  setOpenNow,
  setNearby,
}: FilterBarProps) {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Main Filter Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-xl shadow-sm border">

        {/* Left Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterTag label="Verified" onClick={() => setVerified(v => !v)} />
          <FilterTag label="Open Now" onClick={() => setOpenNow(v => !v)} />
          <FilterTag label="Nearby" onClick={() => setNearby(v => !v)} />
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          <SortDropdown onChange={setSort} />
          <FilterButton label="Filters" onClick={() => setIsOpen(true)} />
        </div>
      </div>

      {/* Popup Modal */}
      <FilterPopup open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
