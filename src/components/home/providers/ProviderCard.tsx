'use client';

import Image from "next/image";
import { Star } from "lucide-react";
import { Provider } from "./types";

interface Props {
  provider: Provider;
}

export default function ProviderCard({ provider }: Props) {
  return (
    <div className="group relative flex flex-col justify-between bg-white p-6 rounded-2xl shadow-md transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
      
      {/* Top section: Avatar + Name + Role */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200 flex-shrink-0">
          <Image
            src={provider.avatar || "/images/avatar-placeholder.png"}
            alt={provider.name}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-800 truncate">
              {provider.name}
            </h3>

            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full text-sm font-medium text-yellow-700">
              <Star className="w-4 h-4" />
              {provider.rating.toFixed(1)}
            </div>
          </div>

          <p className="text-sm text-gray-500 truncate mt-1">
            {provider.role}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mt-4 line-clamp-3">
        {provider.description}
      </p>

      {/* Bottom section: Reviews + Button */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          ({provider.reviews} reviews)
        </span>

        <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all duration-200">
          View Profile
        </button>
      </div>
    </div>
  );
}
