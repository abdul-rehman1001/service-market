'use client';

import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { landingImages } from "@/lib/landing-images";
import { Provider } from "./types";

interface Props {
  provider: Provider;
}

export default function ProviderCard({ provider }: Props) {
  return (
    <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#E2E8F0]/80 bg-white/95 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#10B981]/40 hover:shadow-[0_8px_32px_rgba(16,185,129,0.12)] sm:p-6">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#F8FAFC] ring-2 ring-[#E2E8F0] transition-all duration-300 group-hover:ring-[#10B981]/30 sm:h-16 sm:w-16">
          <Image
            src={provider.avatar || landingImages.defaultAvatar}
            alt={provider.name}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-bold tracking-tight text-[#0F172A] sm:text-lg">
              {provider.name}
            </h3>

            <div className="flex shrink-0 items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 sm:text-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 sm:h-4 sm:w-4" />
              {provider.rating.toFixed(1)}
            </div>
          </div>

          <p className="mt-1 truncate text-xs font-medium text-[#64748B] sm:text-sm">
            {provider.role}
          </p>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[#64748B]">
        {provider.description}
      </p>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#E2E8F0]/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium text-[#64748B] sm:text-sm">
          {provider.reviews} {provider.reviews === 1 ? "review" : "reviews"}
        </span>

        <Link href={`/provider/${provider.userId}`} className="w-full sm:w-auto">
          <button
            type="button"
            className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] sm:w-auto"
          >
            View profile
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
