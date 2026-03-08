import Image from "next/image";
import Button from "../ui/Button";
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
    eyebrow: "For homeowners",
    title: "Book reliable help across plumbing, electrical, cleaning and more.",
    subtitle:
      "Clear categories, verified profiles and fast provider discovery keep urgent tasks moving.",
    image: "/images/service1.png",
  },
  {
    id: 2,
    eyebrow: "For professionals",
    title: "Turn expertise into booked jobs with a profile built to convert.",
    subtitle:
      "Showcase skills, manage availability and receive better-matched leads from real customers.",
    image: "/images/service2.png",
  },
  {
    id: 3,
    eyebrow: "For operations",
    title: "Run discovery, matching and booking from one professional workflow.",
    subtitle:
      "A streamlined marketplace experience reduces friction from search to confirmed work.",
    image: "/images/service3.png",
  },
];

export default function HeroCarousel() {
  return (
    <section id="features" className="relative bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Platform Highlights
            </div>

            <h2 className="mt-3 max-w-3xl text-3xl font-extrabold text-slate-900 md:text-5xl">
              Built for trust, speed, and a better booking experience.
            </h2>
          </div>

          {/* Feature indicators */}
          <div className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:grid-cols-3">
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
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {carouselItems.map((item, index) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  priority={index === 0}
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
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 flex justify-center">
          <Button
            href="/register"
            aria-label="Start using Servizo"
            className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            Start with Servizo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}