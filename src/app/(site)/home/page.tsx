import SearchSection from "@/components/home/SearchSection";
import Categories from "@/components/home/Categories";
import FeaturedProviders from "@/components/home/FeaturedProviders";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div>
      <SearchSection />
      <Categories />
      <FeaturedProviders />
      <Footer />
    </div>
  );
}
