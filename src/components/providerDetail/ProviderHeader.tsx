'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { landingImages } from '@/lib/landing-images';
import { ProviderProfileType } from '@/types/provider';
import StarRating from './StarRating';
import { MapPin, Award, Briefcase, CheckCircle, Clock, BadgeCheck } from 'lucide-react';
import { formatPKR } from '@/lib/utils';

interface Props {
  provider: ProviderProfileType;
}

export default function ProviderHeader({ provider }: Props) {
  const reduceMotion = useReducedMotion();
  const fullName = `${provider.user.firstName} ${provider.user.lastName}`;
  const businessName = provider.businessName || fullName;
  const categories = [...new Set(provider.services.map((s) => s.category.name))].join(', ');
  const minPrice =
    provider.services.length > 0
      ? Math.min(...provider.services.map((s) => Number(s.minPrice)))
      : 0;

  const stats = [
    {
      icon: Award,
      value: `${provider.yearsOfExperience} ${provider.yearsOfExperience === 1 ? 'year' : 'years'}`,
      label: 'Experience',
      color: 'text-[#10B981]',
      bg: 'bg-emerald-50',
    },
    {
      icon: Briefcase,
      value: String(provider.completedBookingsCount),
      label: 'Jobs done',
      color: 'text-[#059669]',
      bg: 'bg-emerald-50',
    },
    {
      icon: Clock,
      value: 'Quick',
      label: 'Response',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    ...(minPrice > 0
      ? [
          {
            icon: BadgeCheck,
            value: formatPKR(minPrice),
            label: 'Starting from',
            color: 'text-[#10B981]',
            bg: 'bg-emerald-50',
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-3xl border border-[#E2E8F0]/80 bg-white/95 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6 lg:p-8"
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6 lg:gap-8">
        <div className="relative shrink-0">
          <div className="h-24 w-24 overflow-hidden rounded-2xl ring-2 ring-[#E2E8F0] sm:h-28 sm:w-28 lg:h-32 lg:w-32">
            <Image
              src={provider.user.profileImage || landingImages.defaultAvatar}
              alt={fullName}
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          </div>
          {provider.verificationStatus === 'APPROVED' && (
            <div className="absolute -bottom-1.5 -right-1.5 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] p-1.5 shadow-lg shadow-emerald-500/30">
              <CheckCircle className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
            Service Provider
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl lg:text-4xl">
            {businessName}
          </h1>
          <p className="mt-1 text-sm font-medium text-[#64748B] sm:text-base lg:text-lg">
            {categories || 'Service Provider'}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <StarRating
              rating={Number(provider.averageRating)}
              showRating
              reviewCount={provider.totalReviews}
              size="md"
            />
            {provider.user.city && (
              <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
                <MapPin className="h-4 w-4 shrink-0 text-[#10B981]" />
                <span>{provider.user.city}</span>
              </div>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${
                provider.isAvailable
                  ? 'bg-emerald-50 text-[#059669] ring-1 ring-[#10B981]/20'
                  : 'bg-slate-100 text-[#64748B] ring-1 ring-[#E2E8F0]'
              }`}
            >
              {provider.isAvailable ? 'Available now' : 'Currently unavailable'}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.06, duration: 0.4 }}
                className={`rounded-2xl ${stat.bg} px-3 py-3 text-center sm:px-4 sm:py-3.5 sm:text-left`}
              >
                <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <p className={`text-base font-bold ${stat.color} sm:text-lg`}>
                    {stat.value}
                  </p>
                </div>
                <p className="mt-0.5 text-xs font-medium text-[#64748B]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
