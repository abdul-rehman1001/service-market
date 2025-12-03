interface FilterButtonProps {
  label: string;
  onClick: () => void; // required
}

export default function FilterButton({ label, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
    >
      {label}
    </button>
  );
}
