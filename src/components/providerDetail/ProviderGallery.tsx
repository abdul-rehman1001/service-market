import React, { useState } from 'react';
import Image from 'next/image';
import { X, ImageIcon } from 'lucide-react';
import { PortfolioItemType } from '@/types/provider';

interface Props {
  portfolios: PortfolioItemType[];
  providerName: string;
}

export default function ProviderGallery({ portfolios, providerName }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (portfolios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Portfolio Items</h3>
          <p className="text-gray-500 text-sm">This provider hasn't added any portfolio items yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">{portfolio.category.name}</h3>
              {portfolio.description && (
                <p className="text-gray-600 text-sm">{portfolio.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {portfolio.images.map((img, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer relative bg-gray-200 group"
                  onClick={() => setSelectedImage(img)}
                >
                  <Image
                    src={img}
                    alt={`${portfolio.category.name} ${i + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <button
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <Image
              src={selectedImage}
              alt={providerName}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
