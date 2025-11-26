import SearchSection from "@/components/home/SearchSection";
import Categories from "@/components/home/Categories";
import FeaturedProviders from "@/components/home/FeaturedProviders";

export default function HomePage() {
  return (
    <div>
      <SearchSection />
      <Categories />
      <FeaturedProviders />
    </div>
  );
}
