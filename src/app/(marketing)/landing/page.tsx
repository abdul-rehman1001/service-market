import Hero from "@/components/landing-page/Hero";
import Features from "@/components/landing-page/Features";
import HowItWorks from "@/components/landing-page/HowItWorks";
import Testimonials from "@/components/landing-page/Testimonials";
import CTA from "@/components/landing-page/CTA";
import HeroCarousel from "@/components/landing-page/HeroCarousel";

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden bg-white text-slate-900">
      <Hero />
      <HeroCarousel />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </main>
  );
}
