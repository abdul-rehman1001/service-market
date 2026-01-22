'use client';

import { useState } from 'react';
import AuthCard from '@/components/auth/AuthCard';
import { PortfolioUpload } from '@/components/provider/PortfolioUpload';
import { PortfolioItem } from '@/components/provider/PortfolioItem';

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<
    { id: string; image: string; description: string }[]
  >([]);

  const handleUploadSuccess = (imageUrl: string, description: string) => {
    if (portfolioItems.length >= 3) return;
    setPortfolioItems((prev) => [...prev, { id: `${Date.now()}`, image: imageUrl, description }]);
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-emerald-50 py-10">
      <div className="max-w-2xl w-full">
        <AuthCard>
          <h2 className="text-3xl font-bold text-emerald-700 text-center">Portfolio</h2>
        <p className="text-center text-gray-600 mt-2">
          Upload up to 3 images showcasing your work per service category
        </p>

        <div className="mt-6 space-y-6">
          <PortfolioUpload onUploadSuccess={handleUploadSuccess} uploadedCount={portfolioItems.length} />

          {portfolioItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {portfolioItems.map((item) => (
                <PortfolioItem key={item.id} image={item.image} description={item.description} />
              ))}
            </div>
          )}
        </div>
        </AuthCard>
      </div>
    </div>
  );
}
