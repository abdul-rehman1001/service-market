import Image from "next/image";
import Link from "next/link";

interface Provider {
  id: number;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  description: string;
  image: string;
}

export default function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition cursor-pointer">

      {/* Top: Profile Image */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 relative">
          <Image
            src={provider.image}
            alt={provider.name}
            fill
            className="rounded-full object-cover"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800">{provider.name}</h3>
          <p className="text-blue-600 text-sm font-medium">{provider.role}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
            <span>⭐ {provider.rating}</span>
            <span className="text-gray-500">({provider.reviews} reviews)</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-sm text-gray-600 leading-relaxed line-clamp-3">
        {provider.description}
      </p>

      {/* Button */}
      <div className="mt-5">
        <Link
          href={`/providers/${provider.id}`}
          className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
