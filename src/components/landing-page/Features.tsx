"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { landingImages } from "@/lib/landing-images";

type FeaturedService = {
  id: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  wide?: boolean;
};

const services: FeaturedService[] = [
  {
    id: "plumber",
    title: "Plumber",
    description: "Professional plumbing repairs, installations, and maintenance from verified plumbers.",
    image: landingImages.plumber,
    badge: "Plumbing",
  },
  {
    id: "electrical",
    title: "Electrical Experts",
    description: "Safe wiring, lighting, and repair services from verified electricians.",
    image: landingImages.electrician,
    badge: "Electrical",
  },
  {
    id: "mechanic",
    title: "Car Mechanic",
    description: "Routine servicing, diagnostics, and auto repairs from trusted mechanics.",
    image: landingImages.autoMechanic,
    badge: "Automotive",
    wide: true,
  },
];

export default function Features() {
  const reduceMotion = useReducedMotion();

  const container = reduceMotion
    ? undefined
    : { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

  const item = reduceMotion
    ? undefined
    : { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <motion.section
      className="bg-white py-16 sm:py-20 md:py-24"
      variants={container}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.12 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          variants={item}
          className="flex flex-col items-center text-center gap-4 md:text-left md:items-start"
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Service categories
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Book top services
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              Plumbing, electrical, and auto service in one place.
            </p>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2">
          {services.map((service) => (
            <motion.article
              key={service.id}
              variants={item}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg ${
                service.wide ? "sm:col-span-2" : ""
              }`}
            >
              <div className="relative h-56 sm:h-64 md:h-72">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  sizes={service.wide ? "(min-width: 640px) 90vw, 100vw" : "(min-width: 640px) 50vw, 100vw"}
                />
                <div className="absolute inset-0 bg-slate-900/60" />

                <div className="relative flex h-full flex-col justify-between p-5 sm:p-6 md:p-7">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                      {service.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white sm:text-2xl">{service.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-200 sm:text-base">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
