"use client";

import {
  BellRing,
  CalendarCheck2,
  CheckCircle2,
  Search,
  UserRoundPlus,
  WalletCards,
} from "lucide-react";
import { useEffect, useRef } from "react";

interface Step {
  icon: React.ReactNode;
  title: string;
  desc: string;
  step: number;
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const seekers: Step[] = [
    {
      icon: <Search className="h-5 w-5 text-white" />,
      title: "Describe your problem",
      desc: "Tell us what you need in plain words. AI will identify the service category and show relevant providers near you.",
      step: 1,
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-white" />,
      title: "Compare verified providers",
      desc: "View profiles, portfolios, ratings, prices, and real-time availability. Filter by location, price, or experience.",
      step: 2,
    },
    {
      icon: <CalendarCheck2 className="h-5 w-5 text-white" />,
      title: "Book and track your service",
      desc: "Select a time slot, confirm booking, chat with provider, track job status, and review after completion.",
      step: 3,
    },
  ];

  const providers: Step[] = [
    {
      icon: <UserRoundPlus className="h-5 w-5 text-white" />,
      title: "Register and verify",
      desc: "Complete registration, upload CNIC for verification, add certifications, and showcase your portfolio.",
      step: 1,
    },
    {
      icon: <BellRing className="h-5 w-5 text-white" />,
      title: "Receive booking requests",
      desc: "Get notified when customers book your services. Accept, reject, or suggest alternate times within 30 minutes.",
      step: 2,
    },
    {
      icon: <WalletCards className="h-5 w-5 text-white" />,
      title: "Complete jobs and grow",
      desc: "Update job status, chat with customers, complete work, collect reviews, and build your reputation.",
      step: 3,
    },
  ];

  useEffect(() => {
    const id = "hiw-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `
        .hiw-from-top {
          opacity: 0;
          transform: translateY(-30px);
          transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1),
                      transform 0.65s cubic-bezier(0.22,1,0.36,1);
        }
        .hiw-from-left {
          opacity: 0;
          transform: translateX(-40px);
          transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1) 0.12s,
                      transform 0.65s cubic-bezier(0.22,1,0.36,1) 0.12s;
        }
        .hiw-from-right {
          opacity: 0;
          transform: translateX(40px);
          transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1) 0.24s,
                      transform 0.65s cubic-bezier(0.22,1,0.36,1) 0.24s;
        }
        .hiw-from-top.visible,
        .hiw-from-left.visible,
        .hiw-from-right.visible {
          opacity: 1;
          transform: translate(0,0);
        }
        .hiw-step-row {
          opacity: 0;
          transform: translateY(-18px);
          transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1),
                      transform 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .hiw-step-row.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hiw-step-ball {
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.3s ease;
        }
        .hiw-step-row:hover .hiw-step-ball {
          transform: scale(1.12);
          box-shadow: 0 0 0 6px rgba(16,185,129,0.15);
        }
        .hiw-card {
          transition: box-shadow 0.4s ease, transform 0.4s ease;
        }
        .hiw-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 72px -24px rgba(16,185,129,0.22);
        }
        @keyframes hiw-blob {
          0%,100%{transform:scale(1) translate(0,0)}
          50%{transform:scale(1.08) translate(12px,-10px)}
        }
        .hiw-blob { animation: hiw-blob 8s ease-in-out infinite; }
        .hiw-blob2 { animation: hiw-blob 11s ease-in-out infinite reverse; }
      `;
      document.head.appendChild(s);
    }
    return () => {
      const el = document.getElementById(id);
      if (el) document.head.removeChild(el);
    };
  }, []);

  useEffect(() => {
    const observe = (el: HTMLElement | null, cls: string) => {
      if (!el) return;
      el.classList.add(cls);
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
        { threshold: 0.1 }
      );
      obs.observe(el);
    };

    observe(headerRef.current, "hiw-from-top");
    observe(leftRef.current, "hiw-from-left");
    observe(rightRef.current, "hiw-from-right");

    const steps = sectionRef.current?.querySelectorAll<HTMLElement>(".hiw-step-row");
    steps?.forEach((el, i) => {
      el.classList.add("hiw-step-row");
      el.style.transitionDelay = `${0.3 + i * 0.1}s`;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
        { threshold: 0.1 }
      );
      obs.observe(el);
    });
  }, []);

  const renderSteps = (steps: Step[]) => (
    <div className="flex flex-col">
      {steps.map((step, idx) => (
        <div key={idx} className="hiw-step-row relative flex gap-4 sm:gap-5">
          {/* timeline spine */}
          <div className="flex flex-col items-center">
            <div className="hiw-step-ball relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 shadow-md shadow-emerald-200">
              {step.icon}
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 w-px bg-gradient-to-b from-emerald-400 via-emerald-200 to-emerald-100 my-1" style={{ minHeight: "40px" }} />
            )}
          </div>

          {/* content */}
          <div className={`pb-7 pt-1 min-w-0 ${idx === steps.length - 1 ? "pb-1" : ""}`}>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Step {step.step}
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 sm:text-[17px]">{step.title}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-20 md:py-28"
    >
      {/* blobs */}
      <div className="hiw-blob pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="hiw-blob2 pointer-events-none absolute -bottom-16 -right-16 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* header */}
        <div ref={headerRef} className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">How It Works</span>
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-5xl leading-tight">
            Three simple steps for{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-emerald-600">seekers & providers</span>
              <span
                className="absolute bottom-1 left-0 h-3 w-full -z-10 opacity-25 rounded"
                style={{ background: "linear-gradient(90deg,#6ee7b7,#34d399)" }}
              />
            </span>
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
            Whether you need a service or provide one, our platform makes the entire process straightforward and secure.
          </p>
        </div>

        {/* cards */}
        <div className="mt-12 grid gap-5 sm:gap-8 lg:grid-cols-2">

          {/* seekers */}
          <div
            ref={leftRef}
            className="hiw-card rounded-3xl border border-emerald-100 bg-white p-6 sm:p-8 shadow-[0_16px_48px_-20px_rgba(2,6,23,0.12)]"
          >
            <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-sm shadow-emerald-300">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">For Customers</div>
                <div className="text-base font-bold text-slate-900">Find a service provider</div>
              </div>
            </div>
            {renderSteps(seekers)}
          </div>

          {/* providers */}
          <div
            ref={rightRef}
            className="hiw-card rounded-3xl border border-emerald-100 bg-white p-6 sm:p-8 shadow-[0_16px_48px_-20px_rgba(2,6,23,0.12)]"
          >
            <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-sm shadow-emerald-300">
                <UserRoundPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">For Providers</div>
                <div className="text-base font-bold text-slate-900">Offer your services</div>
              </div>
            </div>
            {renderSteps(providers)}
          </div>

        </div>
      </div>
    </section>
  );
}