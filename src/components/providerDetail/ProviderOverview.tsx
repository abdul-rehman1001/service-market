'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ProviderProfileType } from '@/types/provider';
import { Phone, Mail, Award, FileCheck } from 'lucide-react';

interface Props {
  provider: ProviderProfileType;
}

function SectionCard({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-3xl border border-[#E2E8F0]/80 bg-white/95 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function ProviderOverview({ provider }: Props) {
  const fullName = `${provider.user.firstName} ${provider.user.lastName}`;
  const certificates = provider.documents.filter(
    (doc) => doc.documentType === 'CERTIFICATE'
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <SectionCard delay={0}>
        <h2 className="text-lg font-bold tracking-tight text-[#0F172A] sm:text-xl">
          About {fullName}
        </h2>
        {provider.user.bio ? (
          <p className="mt-3 text-sm leading-relaxed text-[#64748B] whitespace-pre-line sm:text-base">
            {provider.user.bio}
          </p>
        ) : (
          <p className="mt-3 text-sm italic text-[#94A3B8]">No bio available</p>
        )}
      </SectionCard>

      <SectionCard delay={0.05}>
        <h3 className="text-lg font-bold tracking-tight text-[#0F172A]">
          Contact Information
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0]/60 bg-[#F8FAFC] p-4 transition hover:border-[#10B981]/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <Phone className="h-5 w-5 text-[#10B981]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#64748B]">Phone</p>
              <p className="truncate text-sm font-semibold text-[#0F172A]">
                {provider.user.phone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0]/60 bg-[#F8FAFC] p-4 transition hover:border-[#10B981]/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <Mail className="h-5 w-5 text-[#10B981]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#64748B]">Email</p>
              <p className="break-all text-sm font-semibold text-[#0F172A]">
                {provider.user.email}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {certificates.length > 0 && (
        <SectionCard delay={0.1}>
          <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#0F172A]">
            <Award className="h-5 w-5 text-[#10B981]" />
            Certifications
          </h3>
          <div className="mt-4 space-y-2.5">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileCheck className="h-5 w-5 shrink-0 text-[#10B981]" />
                  <span className="truncate text-sm font-medium text-[#0F172A]">
                    {cert.fileName}
                  </span>
                </div>
                <span className="w-fit rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] px-3 py-1 text-xs font-semibold text-white">
                  Approved
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard delay={0.15}>
        <h3 className="text-lg font-bold tracking-tight text-[#0F172A]">
          Professional Stats
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            {
              value: provider.yearsOfExperience,
              label: 'Years of Experience',
              color: 'text-[#10B981]',
            },
            {
              value: provider.completedBookingsCount,
              label: 'Jobs Completed',
              color: 'text-[#059669]',
            },
            {
              value: Number(provider.averageRating).toFixed(1),
              label: 'Average Rating',
              color: 'text-amber-600',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#E2E8F0]/60 bg-[#F8FAFC] p-4 text-center"
            >
              <p className={`text-2xl font-extrabold sm:text-3xl ${stat.color}`}>
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-[#64748B] sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
