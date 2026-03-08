import { BellRing, CalendarCheck2, CheckCircle2, Search, UserRoundPlus, WalletCards } from "lucide-react";

interface Step {
  icon: React.ReactNode;
  title: string;
  desc: string;
  step: number;
}

export default function HowItWorks() {
  const seekers: Step[] = [
    {
      icon: <Search className="h-5 w-5 text-emerald-700" />,
      title: "Describe your problem",
      desc: "Tell us what you need in plain words. AI will identify the service category and show relevant providers near you.",
      step: 1,
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-700" />,
      title: "Compare verified providers",
      desc: "View profiles, portfolios, ratings, prices, and real-time availability. Filter by location, price, or experience.",
      step: 2,
    },
    {
      icon: <CalendarCheck2 className="h-5 w-5 text-emerald-700" />,
      title: "Book and track your service",
      desc: "Select a time slot, confirm booking, chat with provider, track job status, and review after completion.",
      step: 3,
    },
  ];

  const providers: Step[] = [
    {
      icon: <UserRoundPlus className="h-5 w-5 text-emerald-700" />,
      title: "Register and verify",
      desc: "Complete registration, upload CNIC for verification, add certifications, and showcase your portfolio with work images.",
      step: 1,
    },
    {
      icon: <BellRing className="h-5 w-5 text-emerald-700" />,
      title: "Receive booking requests",
      desc: "Get notified when customers book your services. Accept, reject, or suggest alternate times within 30 minutes.",
      step: 2,
    },
    {
      icon: <WalletCards className="h-5 w-5 text-emerald-700" />,
      title: "Complete jobs and grow",
      desc: "Update job status, chat with customers, complete work, collect reviews, and build your reputation.",
      step: 3,
    },
  ];

  const renderSteps = (
    steps: Step[],
    accentColor: string,
    accentBg: string,
    lineColor: string
  ) => (
    <div className="flex w-full flex-col gap-0">
      {steps.map((step, idx) => (
        <div key={idx} className="relative flex items-start gap-5">
          <div className="flex flex-col items-center">
            <div
              className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${accentBg} ${accentColor}`}
            >
              {step.icon}
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-16 w-0.5 ${lineColor}`} />
            )}
          </div>

          <div className="pt-1.5 pb-8">
            <span className={`mb-1 block text-xs font-bold uppercase tracking-wider ${accentColor}`}>
              Step {step.step}
            </span>
            <h4 className="text-lg font-bold text-slate-950">{step.title}</h4>
            <p className="mt-1 text-sm leading-7 text-slate-600">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute left-0 top-20 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">How It Works</div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
            Three simple steps for seekers and providers
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
            Whether you need a service or provide one, our platform makes the entire process straightforward and secure.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-8 shadow-xl shadow-slate-100">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
              <Search className="h-4 w-4" />
              For customers
            </div>
            {renderSteps(
              seekers,
              "border-emerald-200 text-emerald-600",
              "bg-emerald-50",
              "bg-emerald-200"
            )}
          </div>

          <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-8 shadow-xl shadow-slate-100">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
              <UserRoundPlus className="h-4 w-4" />
              For providers
            </div>
            {renderSteps(
              providers,
              "border-emerald-200 text-emerald-600",
              "bg-emerald-50",
              "bg-emerald-200"
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
