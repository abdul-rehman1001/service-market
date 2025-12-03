"use client";

import { useState } from "react";

const options = [
  "Best Match",
  "Top Rated",
  "Most Reviewed",
  "Lowest Price",
  "Highest Price",
];

interface SortDropdownProps {
  onChange: (value: string) => void;
}

export default function SortDropdown({ onChange }: SortDropdownProps) {
  const [selected, setSelected] = useState(options[0]);

  return (
    <select
      value={selected}
      onChange={(e) => {
        setSelected(e.target.value);
        onChange(e.target.value);
      }}
      className="border rounded-lg px-3 py-2 bg-white shadow-sm cursor-pointer"
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}
