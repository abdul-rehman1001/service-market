"use client";

import Image from "next/image";
import { Star } from "lucide-react";

const providers = [
  {
    id: 1,
    name: "Jane Doe",
    role: "Expert Home Cleaner",
    rating: 4.9,
    reviews: 138,
    description: "Providing top-notch cleaning services with an eco-friendly approach.",
    avatar: "/images/avatar1.png",
  },
  {
    id: 2,
    name: "John Smith",
    role: "Math & Science Tutor",
    rating: 5.0,
    reviews: 82,
    description: "Helping students achieve their academic goals for over 10 years.",
    avatar: "/images/avatar2.png",
  },
  {
    id: 3,
    name: "Emily White",
    role: "Creative Web Designer",
    rating: 4.8,
    reviews: 97,
    description: "Building beautiful, responsive websites for small businesses.",
    avatar: "/images/avatar3.png",
  },
];

export default function FeaturedProviders() {
  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-xl font-semibold mb-6">Featured Providers</h2>

        <div className="grid gap-6 md:grid-cols-3">

          {providers.map((provider) => (
            <div
              key={provider.id}
              className="border rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full overflow-hidden mb-4">
                <Image
                  src={provider.avatar}
                  alt={provider.name}
                  width={56}
                  height={56}
                  className="object-cover"
                />
              </div>

              {/* Name + Role */}
              <h3 className="text-lg font-semibold">{provider.name}</h3>
              <p className="text-sm text-gray-500">{provider.role}</p>

              {/* Rating */}
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{provider.rating}</span>
                <span className="text-gray-500 text-sm">
                  ({provider.reviews} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                {provider.description}
              </p>

              {/* Button */}
              <button className="w-full mt-5 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition">
                View Profile
              </button>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
