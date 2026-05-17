"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const reviews = [
  {
    text: "I needed a plumber urgently, and I found one within an hour. Quick and reliable service!",
    name: "Farhan",
    role: "Homeowner",
    initials: "F",
    metric: "Booked in under 30 min",
  },
  {
    text: "My car needed repair, and the mechanic I booked was professional and fast. Very satisfied!",
    name: "Umer",
    role: "Car Owner",
    initials: "U",
    metric: "Fast response from provider",
  },
  {
    text: "The AC repair technician arrived the same day and fixed the issue quickly. Very professional and thorough.",
    name: "Sana",
    role: "Homeowner",
    initials: "S",
    metric: "AC repaired same day",
  },
];

export default function Testimonials() {
  const reduceMotion = useReducedMotion();

  const container = reduceMotion
    ? undefined
    : { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

  const item = reduceMotion
    ? undefined
    : { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const card = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 18, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55 } },
      };

  return (
    <motion.section
      id="testimonials"
      className="bg-white py-16 sm:py-20 md:py-24"
      variants={container}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div variants={item} className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Customer reviews
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Trusted by customers across Pakistan
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Real experiences from people who found the right professionals for their needs.
          </p>
        </motion.div>

        {/* Review cards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
          {reviews.map((review) => (
            <motion.article
              key={review.name}
              variants={card}
              whileHover={reduceMotion ? undefined : { y: -8, transition: { type: "spring", stiffness: 320, damping: 24 } }}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-lg sm:p-7"
            >
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
                transition={reduceMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Quote className="mb-4 h-8 w-8 text-emerald-200" aria-hidden />
              </motion.div>

              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Review text */}
              <p className="flex-1 text-sm leading-relaxed text-slate-700 sm:text-base">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Metric */}
              <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors duration-300 group-hover:bg-emerald-100">
                {review.metric}
              </div>

              {/* Author */}
              <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {review.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{review.name}</p>
                  <p className="text-xs text-slate-500">{review.role}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
