interface Props {
  searchQuery: string;
  location: string;
  totalResults: number;
}

export default function SearchHeader({
  searchQuery,
  location,
  totalResults,
}: Props) {
  return (
    <div className="border-b py-8">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Showing results for{" "}
          <span className="text-emerald-600">{searchQuery}</span> in{" "}
          <span className="text-emerald-600">{location}</span>
        </h1>
        <p className="text-gray-600 mt-2">
          {totalResults} results found. Review providers below or use the map to refine your search.
        </p>
      </div>
    </div>
  );
}
