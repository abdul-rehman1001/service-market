import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-[#1E3A5F]/10 bg-[#1E3A5F] pt-16 text-white/80">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 text-center md:grid-cols-4 md:text-left">
          <div className="md:col-span-1">
            <div className="mb-4 flex flex-col items-center md:items-start">
              <div className="text-xl font-bold text-white">Servizo</div>
              <p className="mt-2 text-sm leading-7 text-white/60">
                Find trusted service providers, compare options, and book with confidence across Pakistan.
              </p>

              <div className="mt-4 space-y-2.5 text-sm text-white/60">
                <div className="flex items-center justify-center gap-3 md:justify-start">
                  <Mail className="h-4 w-4 text-[#10B981]" />
                  <a href="mailto:support@servizo.com" className="transition hover:text-[#D1FAE5]">support@servizo.com</a>
                </div>
                <div className="flex items-center justify-center gap-3 md:justify-start">
                  <Phone className="h-4 w-4 text-[#10B981]" />
                  <a href="tel:+1234567890" className="transition hover:text-[#D1FAE5]">+1 234 567 890</a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/landing#features" className="text-white/60 transition hover:text-[#D1FAE5]">Features</Link></li>
              <li><Link href="/landing#how-it-works" className="text-white/60 transition hover:text-[#D1FAE5]">How It Works</Link></li>
              <li><Link href="/register/seeker" className="text-white/60 transition hover:text-[#D1FAE5]">Find Services</Link></li>
              <li><Link href="/register/provider" className="text-white/60 transition hover:text-[#D1FAE5]">Become a Provider</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/landing/about" className="text-white/60 transition hover:text-[#D1FAE5]">About Us</Link></li>
              <li><Link href="/landing/faq" className="text-white/60 transition hover:text-[#D1FAE5]">FAQs</Link></li>
              <li><Link href="/landing/privacy" className="text-white/60 transition hover:text-[#D1FAE5]">Privacy Policy</Link></li>
              <li><Link href="/landing/terms" className="text-white/60 transition hover:text-[#D1FAE5]">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/login" className="text-white/60 transition hover:text-[#D1FAE5]">Login</Link></li>
              <li><Link href="/register" className="text-white/60 transition hover:text-[#D1FAE5]">Create Account</Link></li>
              <li><Link href="/register/provider" className="text-white/60 transition hover:text-[#D1FAE5]">Become a Provider</Link></li>
              <li><Link href="/register/seeker" className="text-white/60 transition hover:text-[#D1FAE5]">Find Services</Link></li>
            </ul>
          </div>
        </div>

        <div className="py-8 text-center text-sm text-white/40">
          © 2026 Servizo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
