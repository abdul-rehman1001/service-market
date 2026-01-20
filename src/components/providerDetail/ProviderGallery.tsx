import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  images: string[];
  providerName: string;
}

export default function ProviderGallery({ images, providerName }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <div
            key={i}
            className="aspect-video rounded-lg overflow-hidden cursor-pointer relative bg-gray-200"
            onClick={() => setSelectedImage(img)}
          >
            <img
              src={img}
              alt={`${providerName} ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all">
              <span className="text-white text-sm opacity-0 hover:opacity-100 transition-opacity">View Image</span>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <img src={selectedImage} alt={providerName} className="max-w-full max-h-full object-contain rounded-lg" />
          </div>
        </div>
      )}
    </>
  );
}
