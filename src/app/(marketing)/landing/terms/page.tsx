import StaticContentPage from "@/components/landing-page/StaticContentPage";

export default function LandingTermsPage() {
  return (
    <StaticContentPage
      title="Terms of Service"
      endpoint="/api/content/terms"
      emptyMessage="Terms of Service content is being updated. Please check back later."
    />
  );
}