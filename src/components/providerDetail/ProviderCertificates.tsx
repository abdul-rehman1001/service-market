import React, { useState } from 'react';
import Image from 'next/image';
import { X, Award } from 'lucide-react';
import { ProviderDocumentType } from '@/types/provider';

interface Props {
  certificates: ProviderDocumentType[];
  providerName: string;
}

export default function ProviderCertificates({ certificates, providerName }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (certificates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Certificates</h3>
          <p className="text-gray-500 text-sm">This provider hasn't uploaded any verified certificates yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Verified Certificates
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            All certificates have been verified and approved
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="aspect-[3/4] rounded-lg overflow-hidden cursor-pointer relative bg-gray-200 group border-2 border-gray-200 hover:border-blue-500 transition-colors"
              onClick={() => setSelectedImage(cert.fileUrl)}
            >
              <Image
                src={cert.fileUrl}
                alt={cert.fileName}
                width={400}
                height={533}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 px-4 py-2 rounded-lg">
                  View Certificate
                </span>
              </div>
              {/* Verification Badge */}
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5">
                <Award className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Certificate Count */}
        <div className="mt-6 pt-6 border-t text-center text-sm text-gray-600">
          {certificates.length} {certificates.length === 1 ? 'Verified Certificate' : 'Verified Certificates'}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <Image
              src={selectedImage}
              alt={`${providerName} Certificate`}
              width={800}
              height={1067}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
