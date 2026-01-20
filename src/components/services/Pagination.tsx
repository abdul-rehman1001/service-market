import { ChevronLeft, ChevronRight } from "lucide-react";

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
  return (
    <div className="mt-8 flex justify-center gap-2">
      <button onClick={onPrev} disabled={currentPage === 1}>
        <ChevronLeft />
      </button>

      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i + 1)}
          className={currentPage === i + 1 ? "font-bold" : ""}
        >
          {i + 1}
        </button>
      ))}

      <button onClick={onNext} disabled={currentPage === totalPages}>
        <ChevronRight />
      </button>
    </div>
  );
}
