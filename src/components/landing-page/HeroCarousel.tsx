"use client";

import Image from "next/image";
import Button from "../ui/Button";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
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
      className="relative overflow-hidden border-y border-slate-200/80 bg-slate-50 py-14 sm:py-16 md:py-20"
      variants={container}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.12 }}
    >
      {/* Subtle background accent — solid only, no gradients */}
      <motion.div
        className="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-emerald-100/60 blur-3xl"
        aria-hidden
        animate={reduceMotion ? undefined : { y: [0, -12, 0], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="pointer-events-none absolute -left-16 bottom-6 h-40 w-40 rounded-full bg-white blur-2xl"
        aria-hidden
        animate={reduceMotion ? undefined : { y: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[min(92%,72rem)] -translate-x-1/2 -translate-y-1/2 bg-slate-200/80"
        aria-hidden
        initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
        whileInView={reduceMotion ? undefined : { scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
      />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(68%,22rem)] w-px -translate-x-1/2 -translate-y-1/2 bg-slate-200/70 hidden lg:block"
        aria-hidden
        initial={reduceMotion ? false : { scaleY: 0, opacity: 0 }}
        whileInView={reduceMotion ? undefined : { scaleY: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.25 }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div variants={headerFade} className="mx-auto max-w-2xl text-center">
         
          <h2 className="mt-4 text-balance text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Simple, fast service booking
          </h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
            Compare providers, check availability, and book.
          </p>
        </motion.div>

        {/* Compact cards */}
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
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] transition-shadow duration-300 hover:border-emerald-200/80 hover:shadow-[0_16px_40px_-14px_rgba(22,163,74,0.18)]"
            >
              {/* Compact image */}
              <motion.div
                className="relative h-48 overflow-hidden bg-slate-100 sm:h-56"
                initial={reduceMotion ? false : { opacity: 0.9 }}
                whileInView={reduceMotion ? undefined : { opacity: 1 }}
                viewport={{ once: true }}
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <motion.div
                  className="absolute inset-0 bg-slate-900/25 transition-colors duration-300 group-hover:bg-slate-900/15"
                  aria-hidden
                />
                <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 shadow-sm backdrop-blur-sm">
                  {card.eyebrow}
                </span>
              </motion.div>

              {/* Compact content */}
              <motion.div
                className="flex flex-1 flex-col p-4 sm:p-5"
                initial={reduceMotion ? false : { opacity: 0 }}
                whileInView={reduceMotion ? undefined : { opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 + index * 0.06, duration: 0.4 }}
              >
                <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 sm:text-lg">
                  {card.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-slate-600">
                  {card.subtitle}
                </p>

                <motion.div
                  className="mt-3 flex flex-wrap gap-1.5"
                  initial={reduceMotion ? false : "hidden"}
                  whileInView={reduceMotion ? undefined : "show"}
                  viewport={{ once: true }}
                  variants={
                    reduceMotion
                      ? undefined
                      : {
                          hidden: {},
                          show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
                        }
                  }
                >
                  {card.highlights.map((h) => (
                    <motion.span
                      key={h}
                      variants={
                        reduceMotion
                          ? undefined
                          : {
                              hidden: { opacity: 0, x: -6 },
                              show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                            }
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 sm:text-[11px]"
                    >
                      <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden />
                      {h}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          variants={headerFade}
          className="mt-8 flex justify-center sm:mt-10"
          whileInView={reduceMotion ? undefined : { opacity: 1 }}
        >
          <Button
            href="/register"
            aria-label="Start using Servizo"
            className="group inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98] sm:w-auto sm:px-7 sm:py-3.5 sm:text-base"
          >
            Start with Servizo
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}
