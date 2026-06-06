"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mail,
  Phone,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
} from "lucide-react";

const exploreLinks = [
  { label: "Home", href: "/home" },
  { label: "Services", href: "/services" },
  { label: "My Bookings", href: "/bookings" },
  { label: "Messages", href: "/messages" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "FAQs", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Login", href: "/login" },
  { label: "Create Account", href: "/register" },
  { label: "Become a Provider", href: "/register/provider" },
  { label: "Find Services", href: "/register/seeker" },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 text-sm text-gray-400 transition hover:text-[#34D399]"
      >
        <span>{label}</span>
        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
      </Link>
    </li>
  );
}

function FooterColumn({
  title,
  links,
  delay = 0,
}: {
  title: string;
  links: { label: string; href: string }[];
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="text-center md:text-left"
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#10B981]">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <FooterLink key={link.href} href={link.href} label={link.label} />
        ))}
      </ul>
    </motion.div>
  );
}

interface FooterProps {
  flush?: boolean;
}

export default function Footer({ flush = false }: FooterProps) {
  const reduceMotion = useReducedMotion();

  return (
    <footer
      className={`relative overflow-hidden bg-gray-900 text-gray-300 ${flush ? 'mt-0' : 'mt-16'}`}
    >
      {!flush && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#10B981]/40 to-transparent" />
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(16,185,129,0.35) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-4 xl:gap-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5 text-center md:text-left"
          >
            <div className="flex flex-col items-center gap-3 md:items-start">
              <Link href="/home" className="inline-flex items-center gap-3 transition hover:opacity-90">
                <Image
                  src="/images/Servizo.jpeg"
                  alt="Servizo"
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-xl ring-2 ring-white/10"
                />
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
                  Servizo
                </span>
              </Link>
              <p className="max-w-sm text-sm leading-relaxed text-gray-400">
                Find trusted service providers, compare options, and book with confidence across Pakistan.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 ring-1 ring-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                Verified providers
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 ring-1 ring-white/10">
                <MapPin className="h-3.5 w-3.5 text-[#10B981]" />
                Nationwide
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <a
                href="mailto:support@servizo.com"
                className="flex items-center justify-center gap-2.5 text-gray-400 transition hover:text-[#34D399] md:justify-start"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                  <Mail className="h-4 w-4 text-[#10B981]" />
                </span>
                support@servizo.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center justify-center gap-2.5 text-gray-400 transition hover:text-[#34D399] md:justify-start"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                  <Phone className="h-4 w-4 text-[#10B981]" />
                </span>
                +1 234 567 890
              </a>
            </div>
          </motion.div>

          <FooterColumn title="Explore" links={exploreLinks} delay={0.05} />
          <FooterColumn title="Company" links={companyLinks} delay={0.1} />
          <FooterColumn title="Support" links={supportLinks} delay={0.15} />
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center sm:flex-row sm:text-left"
        >
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Servizo — All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built for seekers and providers across Pakistan
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
