import StaticContentPage from "@/components/landing-page/StaticContentPage";

export default function LandingPrivacyPage() {
  return (
    <StaticContentPage
      title="Privacy Policy"
      endpoint="/api/content/privacy"
      emptyMessage="Privacy Policy content is being updated. Please check back later."
    />
  );
}