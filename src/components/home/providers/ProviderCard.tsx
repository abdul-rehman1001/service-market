'use client';

import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";
import { landingImages } from "@/lib/landing-images";
import { Provider } from "./types";

interface Props {
  provider: Provider;
}

export default function ProviderCard({ provider }: Props) {
  return (
    <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg sm:p-5 lg:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-100 sm:h-16 sm:w-16">
          <Image
            src={provider.avatar || landingImages.defaultAvatar}
            alt={provider.name}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
              {provider.name}
            </h3>

            <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 sm:text-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 sm:h-4 sm:w-4" />
              {provider.rating.toFixed(1)}
            </div>
          </div>

          <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
            {provider.role}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600 sm:mt-4 sm:text-sm">
        {provider.description}
      </p>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-slate-500">
          {provider.reviews} {provider.reviews === 1 ? "review" : "reviews"}
        </span>

        <Link href={`/provider/${provider.userId}`} className="w-full sm:w-auto">
          <button
            type="button"
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto sm:py-2"
          >
            View profile
          </button>
        </Link>
      </div>
    </div>
  );
}
