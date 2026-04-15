import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 pt-16 text-slate-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-xl font-black text-white">Servizo</div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Trusted service discovery</div>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-400">
              A database-backed marketplace for discovering verified professionals, matching service intent, and booking with more confidence.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/landing#features" className="text-slate-400 transition hover:text-emerald-300">Features</Link></li>
              <li><Link href="/landing#how-it-works" className="text-slate-400 transition hover:text-emerald-300">How It Works</Link></li>
              <li><Link href="/register/seeker" className="text-slate-400 transition hover:text-emerald-300">Find Services</Link></li>
              <li><Link href="/register/provider" className="text-slate-400 transition hover:text-emerald-300">Become a Provider</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/landing/about" className="text-slate-400 transition hover:text-emerald-300">About</Link></li>
              <li><Link href="/landing/faq" className="text-slate-400 transition hover:text-emerald-300">FAQ</Link></li>
              <li><Link href="/login" className="text-slate-400 transition hover:text-emerald-300">Login</Link></li>
              <li><Link href="/register" className="text-slate-400 transition hover:text-emerald-300">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/landing/terms" className="text-slate-400 transition hover:text-emerald-300">Terms of Service</Link></li>
              <li><Link href="/landing/privacy" className="text-slate-400 transition hover:text-emerald-300">Privacy Policy</Link></li>
              <li><Link href="/landing#testimonials" className="text-slate-400 transition hover:text-emerald-300">Customer Stories</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 py-8 text-sm md:flex-row">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} Servizo. All rights reserved.
          </p>
          <div className="text-slate-500">Designed for service seekers and professionals who expect a cleaner marketplace experience.</div>
        </div>
      </div>
    </footer>
  );
}
