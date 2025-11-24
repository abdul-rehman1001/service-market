import Hero from "../components/sections/Hero";
import Features from "../components/sections/Features";
import HowItWorks from "../components/sections/HowItWorks";
import Testimonials from "../components/sections/Testimonials";
import CTA from "../components/sections/CTA";
import HeroCarousel from "@/components/sections/HeroCarousel";

export default function Home() {
  return (
    <>
      <Hero />
      <HeroCarousel />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </>
  );
}
