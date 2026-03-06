import Image from "next/image";
import Button from "../ui/Button";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f6f8f7] pt-12 pb-16 md:pt-16 md:pb-24">
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-40" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl animate-drift" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-100/45 blur-3xl animate-float-medium" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-slate-200/40 blur-3xl animate-float-fast" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <div className="animate-slide-up-fade">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm shadow-emerald-100">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            AI-first marketplace for trusted local services
          </div>

          <h1 className="mt-7 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-7xl lg:leading-[1.02]">
            Hire verified professionals without wasting time.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Servizo matches customers with real providers from your database-backed marketplace,
            not generic suggestions. Search faster, compare with confidence, and book with clarity.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Button
              href="/register/seeker"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Find a service
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              href="/register/provider"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-7 py-4 text-base font-semibold text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50"
            >
              Become a provider
              <BadgeCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
            </Button>
          </div>

          <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-lg shadow-slate-100 backdrop-blur">
              <div className="text-2xl font-black text-slate-950">4.9/5</div>
              <div className="mt-1 text-sm text-slate-600">Average provider rating</div>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-lg shadow-slate-100 backdrop-blur">
              <div className="text-2xl font-black text-slate-950">500+</div>
              <div className="mt-1 text-sm text-slate-600">Verified service providers</div>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-lg shadow-slate-100 backdrop-blur">
              <div className="text-2xl font-black text-slate-950">24/7</div>
              <div className="mt-1 text-sm text-slate-600">Fast search and booking flow</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Verified profiles
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Location-aware matching
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
              Rated by real customers
            </div>
          </div>
        </div>

        <div className="relative animate-slide-up-fade [animation-delay:160ms]">
          <div className="absolute -inset-6 rounded-[2rem] bg-emerald-100/40 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)] backdrop-blur">
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-950 px-5 py-4 text-white">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-emerald-300">Live match preview</div>
                <div className="mt-1 text-lg font-semibold">"Need an electrician for wiring repair"</div>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">AI matched</div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Recommended provider</div>
                    <div className="text-sm text-slate-500">Matched by category, rating and location</div>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">98% fit</div>
                </div>
                <div className="relative overflow-hidden rounded-[1.25rem] bg-slate-100">
                  <Image
                    src="/images/service2.png"
                    alt="Professional service provider"
                    width={560}
                    height={420}
                    priority
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">Result summary</div>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                      <span>Category</span>
                      <span className="font-semibold text-slate-900">Electrician</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                      <span>Availability</span>
                      <span className="font-semibold text-emerald-700">Today</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                      <span>Typical response</span>
                      <span className="font-semibold text-slate-900">Under 10 min</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-emerald-100 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">Why customers trust Servizo</div>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />Only active, approved providers appear in results</li>
                    <li className="flex items-start gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-emerald-600" />AI maps real intent to real categories</li>
                    <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />Distance-aware sorting improves local relevance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
