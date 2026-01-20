import SearchSection from "@/components/home/SearchSection";
import Categories from "@/components/home/Categories";
import FeaturedProviders from "@/components/home/providers/FeaturedProviders";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="bg-[#f5f7f8] min-h-screen">
      <SearchSection />
      <Categories />
      <FeaturedProviders />
      <Footer />
    </div>
  );
}
