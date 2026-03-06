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
      title: "Describe the job clearly",
      desc: "Enter a natural language request and let the platform map it to the right service category.",
      step: 1,
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-700" />,
      title: "Review the best matches",
      desc: "Compare verified providers using quality signals like rating, availability, experience and location.",
      step: 2,
    },
    {
      icon: <CalendarCheck2 className="h-5 w-5 text-emerald-700" />,
      title: "Book with confidence",
      desc: "Move from search to scheduling without a messy handoff or guesswork around the right provider.",
      step: 3,
    },
  ];

  const providers: Step[] = [
    {
      icon: <UserRoundPlus className="h-5 w-5 text-emerald-700" />,
      title: "Build a credible profile",
      desc: "Present services, experience and business details in a format that supports trust and conversion.",
      step: 1,
    },
    {
      icon: <BellRing className="h-5 w-5 text-emerald-700" />,
      title: "Receive relevant demand",
      desc: "Get surfaced for the work you actually offer instead of appearing in vague or random search results.",
      step: 2,
    },
    {
      icon: <WalletCards className="h-5 w-5 text-emerald-700" />,
      title: "Convert more efficiently",
      desc: "Respond faster, manage availability and turn profile visibility into booked work.",
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
            One workflow for customers. Another for professionals. Both stay clean.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
            The platform experience is structured around clarity, faster decision-making and fewer unnecessary steps.
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
