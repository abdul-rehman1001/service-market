'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ProviderProfileType } from '@/types/provider';
import { Clock, Tag } from 'lucide-react';
import { formatPKR } from '@/lib/utils';

interface Props {
  provider: ProviderProfileType;
}

export default function ProviderServices({ provider }: Props) {
  const reduceMotion = useReducedMotion();

  if (provider.services.length === 0) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[#E2E8F0]/80 bg-white/95 px-6 py-12 text-center shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:py-16"
      >
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-2 ring-[#10B981]/10">
            <Tag className="h-8 w-8 text-[#10B981]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] sm:text-xl">
            No Services Available
          </h3>
          <p className="mt-2 text-sm text-[#64748B]">
            This provider hasn&apos;t listed any services yet.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {provider.services.map((service, index) => (
        <motion.div
          key={service.id}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduceMotion ? undefined : { y: -2 }}
          className="overflow-hidden rounded-3xl border border-[#E2E8F0]/80 bg-white/95 shadow-[0_4px_24px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_32px_rgba(16,185,129,0.1)]"
        >
          {service.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
              {service.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-video overflow-hidden rounded-xl bg-[#F8FAFC]"
                >
                  <Image
                    src={img}
                    alt={`${service.name} ${idx + 1}`}
                    width={300}
                    height={200}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold tracking-tight text-[#0F172A] sm:text-xl">
                  {service.name}
                </h3>
                <span className="mt-2 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#059669] ring-1 ring-[#10B981]/20">
                  {service.category.name}
                </span>
              </div>
              <div className="shrink-0 sm:text-right">
                <div className="text-xl font-extrabold text-[#10B981] sm:text-2xl">
                  {formatPKR(service.minPrice)}
                  {Number(service.minPrice) !== Number(service.maxPrice) && (
                    <span className="text-lg sm:text-xl">
                      {' '}
                      – {formatPKR(service.maxPrice)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-[#64748B]">Price range</span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#64748B] sm:text-base">
              {service.description}
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm text-[#64748B]">
              <Clock className="h-4 w-4 text-[#10B981]" />
              <span>{service.defaultDurationMinutes} minutes</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
