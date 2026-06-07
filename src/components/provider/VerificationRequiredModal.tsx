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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#1E3A5F]/40 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_24px_60px_rgba(17,24,39,0.15)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-[#FED7AA] bg-[#FFFBEB] px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#FED7AA] bg-[#FEF3C7] text-[#D97706]">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="min-w-0 pr-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B45309]">
                {statusLabel}
              </p>
              <h3 className="mt-1 text-xl font-bold text-[#1E3A5F]">
                Verify first to add services
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                You need an approved provider verification before creating or publishing services on
                Servizo.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm leading-relaxed text-[#6B7280]">{statusMessage}</p>

          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
              <div>
                <p className="text-sm font-semibold text-[#111827]">Go to Documents</p>
                <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">
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
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition hover:bg-[#059669]"
            >
              <FileText className="h-4 w-4" />
              Go to Documents
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Not now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
