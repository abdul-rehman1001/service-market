import StaticContentPage from "@/components/landing-page/StaticContentPage";

export default function LandingAboutPage() {
  return (
    <StaticContentPage
      title="About Us"
      endpoint="/api/content/about-us"
      emptyMessage="About information is being updated. Please check back later."
    />
  );
}