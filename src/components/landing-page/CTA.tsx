import Button from "../ui/Button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 px-8 py-12 text-center shadow-[0_30px_90px_-30px_rgba(15,23,42,0.5)] md:px-14 md:py-16">
          <div className="pointer-events-none absolute inset-0 bg-emerald-900/10" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-200 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              Join our growing community
            </div>

            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl">
              Ready to get started?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Join thousands of satisfied customers and verified professionals.
              Find services or grow your business with Servizo today.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                href="/register/seeker"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-50 sm:w-auto"
              >
                Find a service now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                href="/register/provider"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Grow as a provider
                <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
