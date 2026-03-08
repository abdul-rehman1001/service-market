import {
  BrainCircuit,
  CalendarClock,
  CircleCheckBig,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export default function Features() {
  const features: Feature[] = [
    {
      icon: <BrainCircuit className="h-6 w-6 text-emerald-600" />,
      title: "Intent-aware matching",
      description:
        "User queries are mapped to real service categories so search results reflect verified providers from your database.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
      title: "Verified provider quality",
      description:
        "Only approved and active professionals appear in results, improving trust and marketplace reliability.",
    },
    {
      icon: <CalendarClock className="h-6 w-6 text-emerald-600" />,
      title: "Faster booking journey",
      description:
        "A streamlined discovery and booking flow reduces friction and helps customers hire professionals quickly.",
    },
    {
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      title: "Built for both sides",
      description:
        "Customers gain clarity while professionals receive more visibility, better scheduling, and relevant leads.",
    },
    {
      icon: <SlidersHorizontal className="h-6 w-6 text-emerald-600" />,
      title: "Smarter ranking",
      description:
        "Providers are ranked using quality signals like ratings, distance, price, and experience.",
    },
    {
      icon: <CircleCheckBig className="h-6 w-6 text-emerald-600" />,
      title: "Production-ready architecture",
      description:
        "Clean components and optimized rendering keep the platform fast, scalable, and maintainable.",
    },
  ];

  return (
    <section className="relative bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Why Servizo
          </div>

          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 md:text-5xl">
            A smarter marketplace experience
          </h2>

          <p className="mt-5 text-lg text-slate-600">
            Designed to deliver trust, speed, and clarity for both customers
            and professionals. Every interaction focuses on simplicity and
            reliable service discovery.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
              {/* Icon */}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-900">
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