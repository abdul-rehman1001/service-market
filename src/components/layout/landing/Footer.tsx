import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 pt-16 text-slate-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 md:grid-cols-4 text-center md:text-left">
          <div className="md:col-span-1 md:text-left">
            <div className="mb-4 flex flex-col items-center md:items-start">
              <div className="text-xl font-black text-white">Servizo</div>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                Find trusted service providers, compare options, and book with confidence across Pakistan.
              </p>

              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a href="mailto:support@servizo.com" className="transition hover:text-emerald-300">support@servizo.com</a>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <a href="tel:+1234567890" className="transition hover:text-emerald-300">+1 234 567 890</a>
                </div>
              </div>
            </div>
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
              <li><Link href="/landing/about" className="text-slate-400 transition hover:text-emerald-300">About Us</Link></li>
              <li><Link href="/landing/faq" className="text-slate-400 transition hover:text-emerald-300">FAQs</Link></li>
              <li><Link href="/landing/privacy" className="text-slate-400 transition hover:text-emerald-300">Privacy Policy</Link></li>
              <li><Link href="/landing/terms" className="text-slate-400 transition hover:text-emerald-300">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/login" className="text-slate-400 transition hover:text-emerald-300">Login</Link></li>
              <li><Link href="/register" className="text-slate-400 transition hover:text-emerald-300">Create Account</Link></li>
              <li><Link href="/register/provider" className="text-slate-400 transition hover:text-emerald-300">Become a Provider</Link></li>
              <li><Link href="/register/seeker" className="text-slate-400 transition hover:text-emerald-300">Find Services</Link></li>
            </ul>
          </div>
        </div>

        <div className="py-8 text-sm text-slate-500 text-center">
          © 2026 Servizo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
