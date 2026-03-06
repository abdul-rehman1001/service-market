import { BrainCircuit, CalendarClock, CircleCheckBig, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";

export default function Features() {
  const features: {
    icon: React.ReactNode;
    title: string;
    description: string;
    iconBg: string;
    iconColor: string;
  }[] = [
    {
      icon: <BrainCircuit className="h-5 w-5" />,
      title: "Intent-aware matching",
      description:
        "Queries are mapped to real marketplace categories so search results reflect actual providers in your database.",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Verified provider quality",
      description:
        "Only approved, active providers are surfaced, creating a safer and more credible marketplace experience.",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
    {
      icon: <CalendarClock className="h-5 w-5" />,
      title: "Faster booking journey",
      description:
        "From discovery to provider comparison and booking, the flow is structured to reduce friction and drop-off.",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Built for both sides",
      description:
        "Customers get clarity while professionals get better visibility, simpler scheduling, and more relevant leads.",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
    {
      icon: <SlidersHorizontal className="h-5 w-5" />,
      title: "Smarter ranking",
      description:
        "Results can be sorted by quality signals like rating, distance, price, and experience for more useful outcomes.",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
    },
    {
      icon: <CircleCheckBig className="h-5 w-5" />,
      title: "Production-ready structure",
      description:
        "A cleaner component system and lighter rendering path keep the landing page fast, scalable, and easier to maintain.",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-white md:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Why Servizo</div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
            A marketplace experience that feels structured, fast and trustworthy.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
            Every section is designed to communicate confidence: clear discovery, stronger proof points,
            and a lighter rendering path for better perceived performance.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/10 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.06]"
            >
              <div className="relative">
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.iconBg} ${feature.iconColor}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
