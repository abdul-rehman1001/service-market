'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Award } from 'lucide-react';
import { ProviderDocumentType } from '@/types/provider';

interface Props {
  certificates: ProviderDocumentType[];
  providerName: string;
}

export default function ProviderCertificates({ certificates, providerName }: Props) {
  const reduceMotion = useReducedMotion();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getDocumentLabel = (documentType: string) => {
    switch (documentType) {
      case 'CERTIFICATE':
        return 'Certificate';
      case 'OTHER':
        return 'Supporting Document';
      default:
        return documentType.replace(/_/g, ' ');
    }
  };

  if (certificates.length === 0) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[#E2E8F0]/80 bg-white/95 px-6 py-12 text-center shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:py-16"
      >
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-2 ring-[#10B981]/10">
            <Award className="h-8 w-8 text-[#10B981]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] sm:text-xl">No Certificates</h3>
          <p className="mt-2 text-sm text-[#64748B]">
            This provider hasn&apos;t uploaded any verified certificates yet.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[#E2E8F0]/80 bg-white/95 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-6"
      >
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#0F172A] sm:text-xl">
            <Award className="h-5 w-5 text-[#10B981]" />
            Verified Supporting Documents
          </h3>
          <p className="mt-1 text-sm text-[#64748B]">
            All documents shown here have been verified and approved
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert, index) => (
            <motion.button
              key={cert.id}
              type="button"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              onClick={() => setSelectedImage(cert.fileUrl)}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] text-left shadow-sm transition hover:border-[#10B981]/40 hover:shadow-md"
            >
              <Image
                src={cert.fileUrl}
                alt={cert.fileName}
                width={400}
                height={533}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                <span className="rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold text-[#0F172A] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  View document
                </span>
              </div>
              <div className="absolute right-2 top-2 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] p-1.5 shadow-md">
                <Award className="h-4 w-4 text-white" />
              </div>
              <div className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white">
                {getDocumentLabel(cert.documentType)}
              </div>
            </motion.button>
          ))}
        </div>

        <p className="mt-6 border-t border-[#E2E8F0]/80 pt-5 text-center text-sm font-medium text-[#64748B]">
          {certificates.length}{' '}
          {certificates.length === 1 ? 'Verified Document' : 'Verified Documents'}
        </p>
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute -top-10 right-0 rounded-full p-2 text-white transition hover:bg-white/10 sm:-top-12"
                onClick={() => setSelectedImage(null)}
                aria-label="Close preview"
              >
                <X className="h-7 w-7 sm:h-8 sm:w-8" />
              </button>
              <Image
                src={selectedImage}
                alt={`${providerName} Certificate`}
                width={800}
                height={1067}
                className="max-h-[85vh] max-w-full rounded-2xl object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
