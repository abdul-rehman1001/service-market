interface FilterTagProps {
  label: string;
  onClick?: () => void; // optional so you can use without onClick
}

export default function FilterTag({ label, onClick }: FilterTagProps) {
  return (
    <span
      onClick={onClick}
      className="px-3 py-1 text-sm bg-gray-100 border rounded-full cursor-pointer hover:bg-gray-200"
    >
      {label}
    </span>
  );
}
