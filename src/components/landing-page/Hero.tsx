import Image from "next/image";
import Button from "../ui/Button";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      {/* subtle decorative shapes (purely presentational) */}
      <div className="pointer-events-none absolute -left-20 top-8 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl animate-drift" />
      <div className="pointer-events-none absolute right-8 top-0 h-80 w-80 rounded-full bg-emerald-50/40 blur-2xl animate-float-medium" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
          {/* LEFT: Headline + CTAs */}
          <div className="animate-slide-up-fade">
           

            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Find verified service providers near you, instantly.
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Describe your problem in plain words. Get matched with verified professionals.
              Book with confidence using real-time availability and authentic reviews.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                href="/register/seeker"
                className="group inline-flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                aria-label="Find a service"
              >
                Find a service
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                href="/register/provider"
                className="group inline-flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-6 py-3 text-base font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                aria-label="Become a provider"
              >
                Become a provider
                <BadgeCheck className="h-4 w-4" />
              </Button>
            </div>

            {/* Key metrics */}
            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                value="4.9/5"
                label="Average provider rating"
              />
              <StatCard
                value="500+"
                label="Verified service providers"
              />
              <StatCard
                value="24/7"
                label="Fast search & booking"
              />
            </div>

            {/* trust features */}
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-700">
              <Feature icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />} text="Verified profiles" />
              <Feature icon={<MapPin className="h-4 w-4 text-emerald-600" />} text="Location-aware matching" />
              <Feature icon={<Star className="h-4 w-4 text-emerald-500" />} text="Rated by real customers" />
            </div>
          </div>

          {/* RIGHT: Live match preview card */}
          <div className="relative animate-slide-up-fade [animation-delay:160ms]">
            <div className="absolute -inset-6 rounded-3xl bg-emerald-50/50 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-[0_20px_60px_-20px_rgba(2,6,23,0.35)]">
              {/* header */}
              <div className="flex items-center justify-between rounded-2xl bg-emerald-800 px-5 py-3 text-white">
                <div>
                  <div className="text-xs uppercase tracking-widest text-emerald-200">AI Smart Matching</div>
                  <div className="mt-1 text-sm font-semibold">"My house wiring needs repair"</div>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">Matched</div>
              </div>

              {/* content */}
              <div className="mt-5 grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
                <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Top Match</div>
                      <div className="text-sm text-slate-500">Based on rating, location & availability</div>
                    </div>
                    <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Best Match</div>
                  </div>

                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src="/images/service2.png"
                      alt="Professional service provider"
                      fill
                      style={{ objectFit: "cover" }}
                      priority
                      sizes="(min-width: 1024px) 560px, 100vw"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">Provider Details</div>
                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                      <KeyValue label="Category" value="Electrician" />
                      <KeyValue label="Available" value="Today" valueClass="text-emerald-700 font-semibold" />
                      <KeyValue label="Response Time" value="Under 30 min" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">Why Choose Us</div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                        CNIC verified providers only
                      </li>
                      <li className="flex items-start gap-3">
                        <Sparkles className="mt-0.5 h-4 w-4 text-emerald-600" />
                        AI understands your problem
                      </li>
                      <li className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
                        Search by location radius
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> {/* /container */}
    </section>
  );
}

/* -- small presentational subcomponents (keeps main component focused) -- */

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="text-2xl font-extrabold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function KeyValue({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm ${valueClass} text-slate-900`}>{value}</span>
    </div>
  );
}