"use client";

import Image from "next/image";
import Button from "../ui/Button";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { landingImages } from "@/lib/landing-images";

interface CarouselItem {
  id: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  highlights: string[];
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    eyebrow: "For seekers",
    title: "Find trusted providers near you",
    subtitle: "Compare verified providers and book the service you need.",
    image: landingImages.seeker,
    highlights: ["AI matching", "Instant booking"],
  },
  {
    id: 2,
    eyebrow: "For providers",
    title: "Get more bookings",
    subtitle: "Show your profile and connect with customers.",
    image: landingImages.provider,
    highlights: ["Verified profile", "Smart schedule"],
  },
  {
    id: 3,
    eyebrow: "All-in-one",
    title: "Manage everything in one app",
    subtitle: "Chat, track jobs, and leave reviews after completion.",
    image: landingImages.allInOne,
    highlights: ["Live chat", "Job tracking"],
  },
];

export default function HeroCarousel() {
  const reduceMotion = useReducedMotion();

  const container: Variants | undefined = reduceMotion
    ? undefined
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
      };

  const headerFade: Variants | undefined = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      };

  const cardFade: Variants | undefined = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 28, scale: 0.98 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <motion.section
      id="features"
      className="relative overflow-hidden border-y border-[#E5E7EB] bg-white py-14 sm:py-16 md:py-20"
      variants={container}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.12 }}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div variants={headerFade} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-[#D1FAE5] bg-[#D1FAE5]/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#059669]">
            Platform features
          </span>
          <h2 className="mt-4 text-balance text-2xl font-bold tracking-tight text-[#1E3A5F] sm:text-3xl md:text-4xl">
            Simple, fast service booking
          </h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-[#6B7280] sm:text-base">
            Compare providers, check availability, and book in minutes.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {carouselItems.map((card, index) => (
            <motion.article
              key={card.id}
              variants={cardFade}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -6,
                      transition: { type: "spring", stiffness: 320, damping: 22 },
                    }
              }
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_4px_20px_rgba(17,24,39,0.05)] transition-shadow duration-300 hover:border-[#10B981]/30 hover:shadow-[0_12px_36px_rgba(16,185,129,0.1)]"
            >
              <div className="relative h-48 overflow-hidden bg-[#F9FAFB] sm:h-56">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-[#1E3A5F]/20 transition-colors duration-300 group-hover:bg-[#1E3A5F]/10" />
                <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#059669] shadow-sm backdrop-blur-sm">
                  {card.eyebrow}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#111827] sm:text-lg">
                  {card.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-[#6B7280]">
                  {card.subtitle}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {card.highlights.map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center gap-1 rounded-full border border-[#D1FAE5] bg-[#D1FAE5]/40 px-2.5 py-1 text-[10px] font-medium text-[#059669] sm:text-[11px]"
                    >
                      <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden />
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <motion.div variants={headerFade} className="mt-8 flex justify-center sm:mt-10">
          <Button
            href="/register"
            aria-label="Start using Servizo"
            className="group inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#10B981] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:scale-[0.99] sm:w-auto sm:text-base"
          >
            Start with Servizo
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}
