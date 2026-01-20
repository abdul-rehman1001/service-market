import Image from "next/image";
import { Star } from "lucide-react";
import { Provider } from "./types";

interface Props {
  provider: Provider;
}

export default function ProviderCard({ provider }: Props) {
  return (
    <div className="group relative flex flex-col justify-between bg-white p-6 rounded-2xl shadow-md transition hover:shadow-lg hover:-translate-y-1">
      
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-100">
          <Image
            src={provider.avatar}
            alt={provider.name}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold truncate">
              {provider.name}
            </h3>

            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full text-sm">
              <Star className="w-4 h-4 text-yellow-400" />
              {provider.rating}
            </div>
          </div>

          <p className="text-sm text-gray-500 truncate">
            {provider.role}
          </p>
        </div>
      </div>

      <p className="text-gray-600 text-sm mt-4 line-clamp-3">
        {provider.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          ({provider.reviews} reviews)
        </span>

        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
          View Profile
        </button>
      </div>
    </div>
  );
}
