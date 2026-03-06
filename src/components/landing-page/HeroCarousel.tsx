import Image from "next/image";
import Button from "../ui/Button";
import { ArrowRight, BadgeDollarSign, Clock3, ShieldCheck } from "lucide-react";

interface CarouselItem {
  id: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  accent: string;
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    eyebrow: "For homeowners",
    title: "Book reliable help across plumbing, electrical, cleaning and more.",
    subtitle: "Clear categories, verified profiles and fast provider discovery keep urgent tasks moving.",
    image: "/images/service1.png",
    accent: "bg-emerald-600",
  },
  {
    id: 2,
    eyebrow: "For professionals",
    title: "Turn expertise into booked jobs with a profile built to convert.",
    subtitle: "Showcase skills, manage availability and receive better-matched leads from real customers.",
    image: "/images/service2.png",
    accent: "bg-slate-900",
  },
  {
    id: 3,
    eyebrow: "For operations",
    title: "Run discovery, matching and booking from one professional workflow.",
    subtitle: "A cleaner marketplace experience for both sides reduces friction from search to confirmed work.",
    image: "/images/service3.png",
    accent: "bg-emerald-700",
  },
];

export default function HeroCarousel() {
  return (
    <section id="features" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Platform Highlights</div>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Built for trust, speed and a better booking experience.
            </h2>
          </div>
          <div className="grid gap-3 rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-lg shadow-slate-100 sm:grid-cols-3">
            <div className="flex items-center gap-3 text-sm text-slate-700"><ShieldCheck className="h-4 w-4 text-emerald-600" />Approved providers only</div>
            <div className="flex items-center gap-3 text-sm text-slate-700"><Clock3 className="h-4 w-4 text-emerald-600" />Faster discovery flow</div>
            <div className="flex items-center gap-3 text-sm text-slate-700"><BadgeDollarSign className="h-4 w-4 text-emerald-600" />Transparent service pricing</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {carouselItems.map((item, index) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-30px_rgba(15,23,42,0.42)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <div className={`absolute inset-x-0 top-0 h-1.5 ${item.accent}`} />
                <Image
                  src={item.image}
                  alt={item.title}
                  width={640}
                  height={420}
                  priority={index === 0}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-7">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">{item.eyebrow}</div>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-slate-600">{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            href="/register"
            className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-700"
          >
            Start with Servizo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}
