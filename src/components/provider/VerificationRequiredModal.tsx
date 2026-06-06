'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, ShieldAlert, X } from 'lucide-react';

interface VerificationRequiredModalProps {
  verificationStatus?: string;
  onClose: () => void;
}

export default function VerificationRequiredModal({
  verificationStatus = 'PENDING',
  onClose,
}: VerificationRequiredModalProps) {
  const router = useRouter();

  const statusLabel =
    verificationStatus === 'REJECTED'
      ? 'Verification rejected'
      : verificationStatus === 'PENDING'
        ? 'Verification pending'
        : 'Verification required';

  const statusMessage =
    verificationStatus === 'REJECTED'
      ? 'Your previous verification was rejected. Please review your documents and submit again.'
      : 'Submit your CNIC and required documents so our team can verify your provider account.';

  const handleGoToDocuments = () => {
    onClose();
    router.push('/provider/dashboard?tab=documents');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#1F6F5F]/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#6FCF97]/40 bg-white shadow-[0_24px_60px_-28px_rgba(31,111,95,0.75)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-[#1F6F5F]/60 transition hover:bg-[#EEEEEE] hover:text-[#1F6F5F]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-amber-200/80 bg-gradient-to-r from-amber-50 via-white to-[#EFFAF6] px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="min-w-0 pr-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                {statusLabel}
              </p>
              <h3 className="mt-1 text-xl font-bold text-[#1F6F5F]">
                Verify first to add services
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4A7268]">
                You need an approved provider verification before creating or publishing services on
                Servizo.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm leading-relaxed text-[#1F6F5F]/75">{statusMessage}</p>

          <div className="rounded-xl border border-[#6FCF97]/35 bg-[#EEEEEE]/70 px-4 py-3.5">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#2FA084]" />
              <div>
                <p className="text-sm font-semibold text-[#1F6F5F]">Go to Documents</p>
                <p className="mt-1 text-xs leading-relaxed text-[#4A7268]">
                  Upload your CNIC front and back, then wait for admin approval. This is the same
                  Documents section shown in your provider dashboard sidebar.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={handleGoToDocuments}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2FA084] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1F6F5F]"
            >
              <FileText className="h-4 w-4" />
              Go to Documents
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#6FCF97]/45 bg-white px-4 py-3 text-sm font-semibold text-[#1F6F5F] transition hover:bg-[#EEEEEE]"
            >
              Not now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
