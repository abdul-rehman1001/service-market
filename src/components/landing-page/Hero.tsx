"use client";

import Image from "next/image";
import Button from "../ui/Button";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
  Wrench,
  Droplets,
  PaintBucket,
  Clock,
  CalendarCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ─── category data ─── */
const CATEGORIES = [
  {
    label: "Electrician",
    query: "My house wiring needs repair",
    icon: <Zap className="h-3.5 w-3.5 text-emerald-600" />,
    responseTime: "Under 30 min",
    available: "Today",
    img: "/images/service1.png",
  },
  {
    label: "Plumber",
    query: "Pipe burst under my kitchen sink",
    icon: <Droplets className="h-3.5 w-3.5 text-emerald-600" />,
    responseTime: "Under 45 min",
    available: "Now",
    img: "/images/service2.png",
  },
  {
    label: "Carpenter",
    query: "Need custom cabinets installed",
    icon: <Wrench className="h-3.5 w-3.5 text-emerald-600" />,
    responseTime: "Same day",
    available: "Today",
    img: "/images/service3.png",
  },
  {
    label: "Painter",
    query: "Full house exterior painting needed",
    icon: <PaintBucket className="h-3.5 w-3.5 text-emerald-600" />,
    responseTime: "Schedule visit",
    available: "Tomorrow",
    img: "/images/service2.png",
  },
];

/* ─── animated counter hook ─── */
function useCountUp(target: number, duration = 1800, suffix = "") {
  const [display, setDisplay] = useState("0" + suffix);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.floor(eased * target) + suffix);
            if (progress < 1) requestAnimationFrame(tick);
            else setDisplay(target + suffix);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); };
  }, [target, duration, suffix]);

  return { ref, display };
}

/* ─── cycling card ─── */
function CategoryCard() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % CATEGORIES.length);
        setVisible(true);
      }, 450);
    }, 2500);
    return () => { clearInterval(interval); };
  }, []);

  const cat = CATEGORIES[index]!;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.985)",
        transition: "opacity 0.45s ease, transform 0.45s ease",
      }}
      className="relative w-full overflow-hidden rounded-2xl bg-white shadow-[0_20px_56px_-16px_rgba(2,6,23,0.28)] border border-slate-100"
    >
      {/* top bar */}
      <div className="flex items-center justify-between bg-emerald-800 px-4 py-3 text-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-widest text-emerald-300">AI Smart Matching</div>
            <div className="truncate text-xs font-semibold leading-tight">"{cat.query}"</div>
          </div>
        </div>
        <div className="ml-3 flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-600/60 px-2.5 py-1 text-[10px] font-semibold">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
          Matched
        </div>
      </div>

      {/* body: image left + details right */}
      <div className="flex min-h-0">
        {/* image strip */}
        <div className="relative w-28 shrink-0 xs:w-36 sm:w-44">
          <Image
            src={cat.img}
            alt="Service provider"
            fill
            style={{ objectFit: "cover" }}
            priority
            sizes="176px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/75 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-2 flex items-center gap-1 rounded-full bg-emerald-700/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow backdrop-blur-sm">
            {cat.icon}
            <span className="truncate max-w-[56px]">{cat.label}</span>
          </div>
        </div>

        {/* details */}
        <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 min-w-0">
          {/* header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Top Match</div>
              <div className="mt-0.5 text-[11px] leading-snug text-slate-500">Rating, location & availability</div>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Best
            </span>
          </div>

          {/* detail pills grid */}
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <DetailPill
              icon={<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">{cat.icon}</div>}
              label="Category"
              value={cat.label}
            />
            <DetailPill
              icon={<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100"><CalendarCheck className="h-3 w-3 text-emerald-600" /></div>}
              label="Available"
              value={cat.available}
              valueClass="text-emerald-700 font-semibold"
            />
            <DetailPill
              icon={<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100"><Clock className="h-3 w-3 text-slate-500" /></div>}
              label="Response"
              value={cat.responseTime}
            />
            <DetailPill
              icon={<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100"><ShieldCheck className="h-3 w-3 text-emerald-600" /></div>}
              label="Verified"
              value="CNIC checked"
            />
          </div>

          {/* micro tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <MicroTag icon={<ShieldCheck className="h-2.5 w-2.5" />} text="Verified" />
            <MicroTag icon={<Sparkles className="h-2.5 w-2.5" />} text="AI matched" />
            <MicroTag icon={<MapPin className="h-2.5 w-2.5" />} text="Near you" />
          </div>
        </div>
      </div>

      {/* progress dots */}
      <div className="flex justify-center gap-1.5 py-2.5">
        {CATEGORIES.map((_, i) => (
          <span
            key={i}
            className="block h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === index ? "18px" : "5px",
              backgroundColor: i === index ? "#10b981" : "#d1d5db",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function DetailPill({
  icon, label, value, valueClass = "",
}: {
  icon: React.ReactNode; label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5 min-w-0">
      {icon}
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-wide text-slate-400">{label}</div>
        <div className={`truncate text-[11px] font-semibold text-slate-800 ${valueClass}`}>{value}</div>
      </div>
    </div>
  );
}

function MicroTag({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
      {icon}{text}
    </div>
  );
}

/* ─── animated stat card ─── */
function AnimatedStatCard({ raw, label, prefix = "", suffix = "" }: {
  raw: number; label: string; prefix?: string; suffix?: string;
}) {
  const { ref, display } = useCountUp(raw, 1800, suffix);
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
        <span>{prefix}</span>
        <span ref={ref}>{display}</span>
      </div>
      <div className="mt-1 text-xs sm:text-sm text-slate-600 leading-snug">{label}</div>
    </div>
  );
}

/* ─── main Hero ─── */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [leftRef.current, rightRef.current].filter(
      (el): el is HTMLDivElement => el !== null
    );
    els.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(32px)";
      el.style.transition = `opacity 0.75s ease ${i * 0.18}s, transform 0.75s ease ${i * 0.18}s`;
    });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          els.forEach((el) => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          });
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { observer.disconnect(); };
  }, []);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @keyframes hero-drift {
        0%,100%{transform:translate(0,0) scale(1)}
        50%{transform:translate(20px,-15px) scale(1.08)}
      }
      @keyframes hero-float {
        0%,100%{transform:translate(0,0) scale(1)}
        50%{transform:translate(-18px,20px) scale(1.05)}
      }
      @keyframes hero-glow {
        0%,100%{opacity:.45}
        50%{opacity:.7}
      }
      .hero-drift{animation:hero-drift 9s ease-in-out infinite}
      .hero-float{animation:hero-float 11s ease-in-out infinite}
      .hero-glow{animation:hero-glow 4s ease-in-out infinite}
    `;
    document.head.appendChild(s);
    return () => { document.head.removeChild(s); };
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="pointer-events-none absolute -left-20 top-8 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl hero-drift" />
      <div className="pointer-events-none absolute right-8 top-0 h-80 w-80 rounded-full bg-emerald-50/40 blur-2xl hero-float" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/20 blur-3xl hero-glow" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

          {/* LEFT */}
          <div ref={leftRef}>
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Find verified service providers near you,{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-emerald-600">instantly.</span>
                <span
                  className="absolute bottom-1 left-0 h-3 w-full -z-10 opacity-30 rounded"
                  style={{ background: "linear-gradient(90deg,#6ee7b7,#34d399)" }}
                />
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl">
              Describe your problem in plain words. Get matched with verified professionals.
              Book with confidence using real-time availability and authentic reviews.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button
                href="/register/seeker"
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-200 sm:w-auto sm:text-base"
                aria-label="Find a service"
              >
                Find a service
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                href="/register/provider"
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-emerald-200 bg-white px-6 py-3.5 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:w-auto sm:text-base"
                aria-label="Become a provider"
              >
                Become a provider
                <BadgeCheck className="h-4 w-4" />
              </Button>
            </div>

            {/* stat cards */}
            <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-4 max-w-sm sm:max-w-2xl">
              <AnimatedStatCard raw={49} prefix="4." suffix="/5" label="Average provider rating" />
              <AnimatedStatCard raw={500} suffix="+" label="Verified providers" />
              <AnimatedStatCard raw={24} suffix="/7" label="Fast search & booking" />
            </div>

            {/* trust features */}
            <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-700">
              <Feature icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />} text="Verified profiles" />
              <Feature icon={<MapPin className="h-4 w-4 text-emerald-600" />} text="Location-aware matching" />
              <Feature icon={<Star className="h-4 w-4 text-emerald-500" />} text="Rated by real customers" />
            </div>
          </div>

          {/* RIGHT */}
          <div ref={rightRef} className="relative w-full">
            <div className="absolute -inset-4 rounded-3xl bg-emerald-50/50 blur-2xl hero-glow" />
            <div className="relative">
              <CategoryCard />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span>{text}</span>
    </div>
  );
}