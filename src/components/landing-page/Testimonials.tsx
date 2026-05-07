"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Quote, Star } from "lucide-react";

export default function Testimonials() {
  const reduceMotion = useReducedMotion();

  const container = reduceMotion
    ? undefined
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.09 } },
      };

  const item = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
      };

  const reviews = [
    {
      text: "I needed a plumber urgently, and I found one within an hour. Quick and reliable service!",
      name: "Farhan",
      role: "Homeowner",
      initials: "F",
      bg: "bg-emerald-100 text-emerald-700",
      metric: "Booked in under 30 min",
    },
    {
      text: "My car needed repair, and the mechanic I booked was professional and fast. Very satisfied!",
      name: "Umer",
      role: "Car Owner",
      initials: "U",
      bg: "bg-emerald-100 text-emerald-700",
      metric: "Fast response from provider",
    },
    {
      text: "The AC repair technician arrived the same day and fixed the issue quickly. Very professional and thorough.",
      name: "Sana",
      role: "Homeowner",
      initials: "S",
      bg: "bg-emerald-100 text-emerald-700",
      metric: "AC repaired same day",
    },
  ];

  return (
    <motion.section
      id="testimonials"
      className="relative overflow-hidden bg-white py-20 md:py-28"
      variants={container}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={reduceMotion ? undefined : { once: true, amount: 0.2 }}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={item} className="mb-14 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Customer reviews</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Trusted by customers across Pakistan
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
              Real experiences from people who found the right professionals for their needs. Fast, reliable, and verified.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {reviews.map((review, i) => (
            <motion.article
              key={i}
              className="group flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_70px_-30px_rgba(16,185,129,0.35)]"
              variants={item}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <Quote className="mb-6 h-9 w-9 text-emerald-200" />
              <div className="mb-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                ))}
              </div>
              <p className="flex-1 text-base leading-8 text-slate-600">&ldquo;{review.text}&rdquo;</p>
              <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{review.metric}</div>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${review.bg}`}>
                  {review.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">{review.name}</h4>
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
