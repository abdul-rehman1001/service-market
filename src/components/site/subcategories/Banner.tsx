// src/components/site/subcategories/Banner.tsx

import { landingImages } from "@/lib/landing-images";
import Image from "next/image";

export default function Banner({ title }: { title: string }) {
  return (
    <div className="relative w-full h-60 md:h-72 lg:h-80 overflow-hidden rounded-b-2xl shadow-sm bg-gray-200">

      {/* World Map Image */}
      <Image
        src={landingImages.banner}
        alt="world map"
        fill
        className="object-cover opacity-90"
        priority
      />

      {/* White Overlay (gradient fade like your screenshot) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90" />

      {/* Title */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 capitalize">
          {title}
        </h1>
      </div>

    </div>
  );
}
