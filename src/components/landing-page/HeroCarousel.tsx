"use client";

import Image from "next/image";
import Button from "../ui/Button";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeDollarSign, Clock3, ShieldCheck } from "lucide-react";

interface CarouselItem {
  id: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    eyebrow: "For Service Seekers",
    title: "Find trusted professionals for plumbing, electrical, cleaning & more.",
    subtitle:
      "Describe your problem, get matched with verified providers, view portfolios, check reviews, and book instantly.",
    image: "/images/service1.png",
  },
  {
    id: 2,
    eyebrow: "For Service Providers",
    title: "Grow your business with verified credentials and real bookings.",
    subtitle:
      "Upload certifications, showcase your portfolio, manage availability, and connect with customers actively looking for your services.",
    image: "/images/service2.png",
  },
  {
    id: 3,
    eyebrow: "Smart & Simple",
    title: "Everything happens in one place - search, chat, book, and review.",
    subtitle:
      "No phone calls, no confusion. Track booking status, chat with providers in real-time, and leave reviews after job completion.",
    image: "/images/service3.png",
  },
];

export default function HeroCarousel() {
  const reduceMotion = useReducedMotion();

  const container = reduceMotion
    ? undefined
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      };

  const item = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
      };

  return (
    <motion.section
      id="features"
      className="relative bg-white py-20 md:py-28"
      variants={container}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={reduceMotion ? undefined : { once: true, amount: 0.2 }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          variants={item}
          className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
              How It Works
            </div>

            <h2 className="mt-3 max-w-3xl text-3xl font-extrabold text-slate-900 md:text-5xl">
              Simple, fast, and secure service booking
            </h2>
          </div>

          {/* Feature indicators */}
          <motion.div
            className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:grid-cols-3"
            whileHover={reduceMotion ? undefined : { y: -3 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Approved providers
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Clock3 className="h-4 w-4 text-emerald-600" />
              Faster discovery
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700">
              <BadgeDollarSign className="h-4 w-4 text-emerald-600" />
              Transparent pricing
            </div>
          </motion.div>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {carouselItems.map((item, index) => (
            <motion.article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              variants={item}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                  {item.eyebrow}
                </div>

                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {item.subtitle}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <motion.div variants={item} className="mt-14 flex justify-center">
          <Button
            href="/register"
            aria-label="Start using Servizo"
            className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Start with Servizo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}