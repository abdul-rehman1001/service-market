import SearchSection from "@/components/home/SearchSection";
import Categories from "@/components/home/Categories";

export default function HomePage() {
  return (
    <div>
      <SearchSection />
      <Categories />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-gray-600">Next: Featured providers will appear here.</p>
      </div>
    </div>
  );
}
