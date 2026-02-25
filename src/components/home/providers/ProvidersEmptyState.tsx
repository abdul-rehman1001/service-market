import { Search } from "lucide-react";

export default function ProvidersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-600 text-lg font-medium">No providers found</p>
      <p className="text-gray-500 text-sm mt-1">Try adjusting your search filters</p>
    </div>
  );
}
