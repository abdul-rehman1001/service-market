"use client";

import {
  BrainCircuit,
  CalendarClock,
  CircleCheckBig,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useEffect, useRef } from "react";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: <BrainCircuit className="h-6 w-6 text-emerald-600" />,
    title: "AI-Powered Search",
    description:
      "Describe your problem in plain English. Our AI automatically identifies the right service category and matches you with qualified providers.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
    title: "Verified Providers",
    description:
      "All service providers are verified with CNIC and undergo admin approval. Only trusted professionals are listed on our platform.",
  },
  {
    icon: <CalendarClock className="h-6 w-6 text-emerald-600" />,
    title: "Real-Time Booking",
    description:
      "View provider availability instantly, select your preferred time slot, and book services directly. No back-and-forth needed.",
  },
  {
    icon: <Users className="h-6 w-6 text-emerald-600" />,
    title: "Authentic Reviews",
    description:
      "Read real reviews from verified customers. Rate providers on professionalism, quality, punctuality, and communication.",
  },
  {
    icon: <SlidersHorizontal className="h-6 w-6 text-emerald-600" />,
    title: "Location-Based Search",
    description:
      "Find providers near you using our map search. Set your preferred radius (1–20 km) and see available providers in your area.",
  },
  {
    icon: <CircleCheckBig className="h-6 w-6 text-emerald-600" />,
    title: "Real-Time Chat",
    description:
      "Chat directly with service providers before and during the job. Get instant clarification and updates on job status.",
  },
];

export default function Features() {
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* inject styles once */
    const s = document.createElement("style");
    s.id = "features-anim-styles";
    if (!document.getElementById("features-anim-styles")) {
      s.textContent = `
        .feat-card {
          opacity: 0;
          transform: translateY(-30px);
          transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1),
                      transform 0.55s cubic-bezier(0.22,1,0.36,1),
                      box-shadow 0.3s ease,
                      border-color 0.3s ease,
                      translate 0.3s ease;
        }
        .feat-card.in-view {
          opacity: 1;
          transform: translateY(0);
        }
        .feat-card:hover {
          translate: 0 -4px;
        }
        .feat-header {
          opacity: 0;
          transform: translateY(-24px);
          transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1),
                      transform 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        .feat-header.in-view {
          opacity: 1;
          transform: translateY(0);
        }
        /* underline hover effect */
        .feat-title {
          position: relative;
          display: inline-block;
        }
        .feat-title::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          height: 2px;
          width: 0;
          border-radius: 999px;
          background: linear-gradient(90deg, #10b981, #34d399);
          transition: width 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .feat-card:hover .feat-title::after {
          width: 100%;
        }
        /* icon bg pulse on hover */
        .feat-icon-wrap {
          transition: background-color 0.3s ease, transform 0.3s ease;
        }
        .feat-card:hover .feat-icon-wrap {
          background-color: #d1fae5;
          transform: scale(1.1) rotate(-4deg);
        }
      `;
      document.head.appendChild(s);
    }
    return () => {
      const el = document.getElementById("features-anim-styles");
      if (el) document.head.removeChild(el);
    };
  }, []);

  useEffect(() => {
    /* animate header */
    const headerEl = headerRef.current;
    if (headerEl) {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            headerEl.classList.add("in-view");
            obs.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      obs.observe(headerEl);
    }

    /* staggered cards */
    const cards = gridRef.current?.querySelectorAll<HTMLDivElement>(".feat-card");
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = Number(el.dataset.delay ?? 0);
            setTimeout(() => {
              el.classList.add("in-view");
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    cards.forEach((card) => observer.observe(card));
    return () => { observer.disconnect(); };
  }, []);

  return (
    <section className="relative bg-white py-20 md:py-28 overflow-hidden">
      {/* subtle background decoration */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-50/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div ref={headerRef} className="feat-header mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Key Features</span>
          </div>

          <h2 className="mt-5 text-3xl font-extrabold text-slate-900 md:text-5xl leading-tight">
            Everything you need to{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-emerald-600">find and hire</span>
              <span
                className="absolute bottom-1 left-0 h-3 w-full -z-10 opacity-25 rounded"
                style={{ background: "linear-gradient(90deg,#6ee7b7,#34d399)" }}
              />
            </span>{" "}
            professionals
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-600">
            From AI-powered search to verified providers, real-time booking to authentic reviews.
            We've built features that make finding services simple and reliable.
          </p>
        </div>

        {/* Features Grid */}
        <div
          ref={gridRef}
          className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              data-delay={idx * 80}
              className="feat-card group rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-sm hover:border-emerald-200 hover:shadow-lg cursor-default"
            >
              {/* Icon */}
              <div className="feat-icon-wrap mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                {feature.icon}
              </div>

              {/* Title with underline */}
              <h3 className="feat-title text-base sm:text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}