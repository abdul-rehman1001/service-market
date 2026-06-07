'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  RefreshCw,
  Shield,
  IdCard,
  ExternalLink,
  FolderOpen,
  FileCheck,
  FileX,
} from 'lucide-react';

interface ProviderData {
  id: string;
  cnic?: string | null;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface ProviderDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  createdAt: string;
}

const inputClass =
  'w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#111827] shadow-sm transition focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 disabled:cursor-not-allowed disabled:bg-[#F3F4F6]';

const labelClass = 'mb-1.5 block text-sm font-semibold text-[#374151]';

const primaryBtnClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] disabled:cursor-not-allowed disabled:opacity-50';

function verificationBadgeStyles(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'border-[#BBF7D0] bg-[#D1FAE5] text-[#059669]';
    case 'REJECTED':
      return 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]';
    default:
      return 'border-[#FED7AA] bg-[#FEF3C7] text-[#B45309]';
  }
}

function docStatusStyles(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]';
    case 'REJECTED':
      return 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]';
    default:
      return 'border-[#FED7AA] bg-[#FEF3C7] text-[#B45309]';
  }
}

function StatPill({
  label,
  value,
  icon: Icon,
  variant,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'green' | 'navy' | 'amber' | 'red';
}) {
  const styles = {
    green: {
      card: 'border-[#E5E7EB] bg-white',
      iconWrap: 'border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]',
      label: 'text-[#6B7280]',
      value: 'text-[#111827]',
    },
    navy: {
      card: 'border-[#E5E7EB] bg-white',
      iconWrap: 'border border-[#DBEAFE] bg-[#EFF6FF] text-[#1E3A5F]',
      label: 'text-[#6B7280]',
      value: 'text-[#1E3A5F]',
    },
    amber: {
      card: 'border-[#E5E7EB] bg-white',
      iconWrap: 'border border-[#FED7AA] bg-[#FEF3C7] text-[#D97706]',
      label: 'text-[#6B7280]',
      value: 'text-[#9A3412]',
    },
    red: {
      card: 'border-[#E5E7EB] bg-white',
      iconWrap: 'border border-[#FECACA] bg-[#FEF2F2] text-[#EF4444]',
      label: 'text-[#6B7280]',
      value: 'text-[#111827]',
    },
  }[variant];

  return (
    <div
      className={`rounded-2xl border p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)] sm:p-5 ${styles.card}`}
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.iconWrap}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <p className={`text-xs font-semibold sm:text-sm ${styles.label}`}>{label}</p>
      </div>
      <p className={`text-2xl font-bold sm:text-3xl ${styles.value}`}>{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)]">
      <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 sm:px-5">
        <h3 className="flex items-center gap-2.5 text-base font-bold text-[#1E3A5F] sm:text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
            <Icon className="h-4 w-4" />
          </div>
          {title}
        </h3>
        {subtitle ? <p className="mt-1.5 pl-[2.625rem] text-xs text-[#6B7280] sm:text-sm">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

export const DocumentManagementPanel: React.FC = () => {
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [documents, setDocuments] = useState<ProviderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingCnic, setUploadingCnic] = useState(false);
  const [uploadingSupporting, setUploadingSupporting] = useState(false);
  const [message, setMessage] = useState<{ type: '' | 'success' | 'error'; text: string }>({
    type: '',
    text: '',
  });

  const [cnicForm, setCnicForm] = useState({
    cnicNumber: '',
    frontFile: null as File | null,
    backFile: null as File | null,
  });

  const [supportingForm, setSupportingForm] = useState({
    documentType: 'CERTIFICATE' as 'CERTIFICATE' | 'OTHER',
    files: [] as File[],
  });

  const fetchProviderData = useCallback(async () => {
    try {
      setLoading(true);
      const providerRes = await fetch('/api/provider/dashboard');
      if (!providerRes.ok) {
        const data = await providerRes.json();
        throw new Error(data.error || 'Failed to fetch provider data');
      }

      const providerData = await providerRes.json();
      const providerInfo: ProviderData = {
        id: providerData.provider.id,
        cnic: providerData.provider.cnic,
        verificationStatus: providerData.provider.verificationStatus,
      };
      setProvider(providerInfo);
      setCnicForm((prev) => ({
        ...prev,
        cnicNumber: providerData.provider.cnic || prev.cnicNumber,
      }));

      const docsRes = await fetch(`/api/providers/${providerInfo.id}/documents`);
      if (!docsRes.ok) {
        const data = await docsRes.json();
        throw new Error(data.error || 'Failed to fetch documents');
      }

      const docsData = await docsRes.json();
      setDocuments(docsData.documents || []);
      setMessage({ type: '', text: '' });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to load provider data';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProviderData();
  }, [fetchProviderData]);

  const docSummary = useMemo(() => {
    const pending = documents.filter((d) => d.status === 'PENDING').length;
    const approved = documents.filter((d) => d.status === 'APPROVED').length;
    const rejected = documents.filter((d) => d.status === 'REJECTED').length;
    return { pending, approved, rejected, total: documents.length };
  }, [documents]);

  const handleViewDocument = (fileUrl: string) => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const validateImageFile = (file: File): string | null => {
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      return 'All files must be images (JPEG or PNG)';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Each file must be less than 5MB';
    }
    return null;
  };

  const handleCnicFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'frontFile' | 'backFile'
  ) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateImageFile(selectedFile);
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setMessage({ type: '', text: '' });
    setCnicForm((prev) => ({ ...prev, [side]: selectedFile }));
  };

  const handleSupportingFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    for (const selectedFile of selectedFiles) {
      const validationError = validateImageFile(selectedFile);
      if (validationError) {
        setMessage({ type: 'error', text: validationError });
        return;
      }
    }

    if (supportingForm.documentType !== 'CERTIFICATE' && selectedFiles.length > 1) {
      setMessage({ type: 'error', text: 'Only one image is allowed for this document type' });
      return;
    }

    setMessage({ type: '', text: '' });
    setSupportingForm((prev) => ({ ...prev, files: selectedFiles }));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration missing');
    }

    const folder = `service-market/providers/${provider?.id}/documents`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleCnicRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!provider) {
      setMessage({ type: 'error', text: 'Failed to load provider data' });
      return;
    }

    if (!cnicForm.frontFile || !cnicForm.backFile) {
      setMessage({ type: 'error', text: 'Please upload both CNIC front and back images' });
      return;
    }

    if (!/^\d{13}$/.test(cnicForm.cnicNumber)) {
      setMessage({ type: 'error', text: 'CNIC must be exactly 13 digits' });
      return;
    }

    setUploadingCnic(true);
    setMessage({ type: '', text: '' });

    try {
      const [frontFileUrl, backFileUrl] = await Promise.all([
        uploadToCloudinary(cnicForm.frontFile),
        uploadToCloudinary(cnicForm.backFile),
      ]);

      const res = await fetch(`/api/providers/${provider.id}/documents/cnic-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnicNumber: cnicForm.cnicNumber,
          frontDocument: {
            fileUrl: frontFileUrl,
            fileName: cnicForm.frontFile.name,
            fileSize: cnicForm.frontFile.size,
            mimeType: cnicForm.frontFile.type,
          },
          backDocument: {
            fileUrl: backFileUrl,
            fileName: cnicForm.backFile.name,
            fileSize: cnicForm.backFile.size,
            mimeType: cnicForm.backFile.type,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit CNIC verification request');
      }

      setMessage({
        type: 'success',
        text: 'CNIC verification request submitted. Awaiting admin approval.',
      });

      setCnicForm((prev) => ({ ...prev, frontFile: null, backFile: null }));
      const frontInput = document.getElementById('provider-cnic-front-input') as HTMLInputElement;
      const backInput = document.getElementById('provider-cnic-back-input') as HTMLInputElement;
      if (frontInput) frontInput.value = '';
      if (backInput) backInput.value = '';

      await fetchProviderData();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'CNIC request submission failed';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setUploadingCnic(false);
    }
  };

  const handleSupportingUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (supportingForm.files.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one image' });
      return;
    }

    if (!provider) {
      setMessage({ type: 'error', text: 'Failed to load provider data' });
      return;
    }

    setUploadingSupporting(true);
    setMessage({ type: '', text: '' });

    try {
      let uploadedCount = 0;

      for (const file of supportingForm.files) {
        const fileUrl = await uploadToCloudinary(file);

        const res = await fetch(`/api/providers/${provider.id}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            documentType: supportingForm.documentType,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Upload failed');
        }

        uploadedCount++;
      }

      setMessage({
        type: 'success',
        text:
          uploadedCount === 1
            ? 'Document uploaded successfully!'
            : `${uploadedCount} documents uploaded successfully!`,
      });

      setSupportingForm({ documentType: 'CERTIFICATE', files: [] });
      const fileInput = document.getElementById('provider-supporting-doc-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await fetchProviderData();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Upload failed';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setUploadingSupporting(false);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-[#EF4444]" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-[#F59E0B]" />;
      default:
        return <AlertCircle className="h-4 w-4 text-[#6B7280]" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const FilePicker = ({
    id,
    label,
    file,
    onChange,
    disabled,
  }: {
    id: string;
    label: string;
    file: File | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
  }) => (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <label
        htmlFor={id}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D1FAE5] bg-[#F9FAFB] px-3 py-4 text-center transition-all hover:border-[#10B981]/50 hover:bg-[#D1FAE5]/20 ${
          disabled ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <Upload className="mb-1.5 h-5 w-5 text-[#10B981]" />
        <span className="text-xs font-semibold text-[#111827]">Tap to upload</span>
        <span className="mt-0.5 text-[10px] text-[#6B7280]">JPEG or PNG, max 5MB</span>
        <input
          id={id}
          type="file"
          onChange={onChange}
          accept="image/jpeg,image/png,image/jpg"
          disabled={disabled}
          className="hidden"
        />
      </label>
      {file && (
        <p className="mt-1.5 truncate text-xs font-medium text-[#059669]">{file.name}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white py-16 shadow-sm">
        <Loader2 className="h-9 w-9 animate-spin text-[#10B981]" />
        <p className="text-sm text-[#6B7280]">Loading documents…</p>
      </section>
    );
  }

  const isVerified = provider?.verificationStatus === 'APPROVED';

  return (
    <section className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/60 text-[#059669]">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#1E3A5F] sm:text-2xl">Documents</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Submit CNIC for verification and upload supporting files
            </p>
            {provider && (
              <span
                className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${verificationBadgeStyles(provider.verificationStatus)}`}
              >
                <Shield className="h-3.5 w-3.5" />
                Verification: {provider.verificationStatus}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={fetchProviderData}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] shadow-sm transition-all hover:border-[#10B981]/30 hover:bg-[#F5F7F8] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-[#10B981] ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Doc summary */}
      {documents.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatPill label="Total" value={docSummary.total} icon={FolderOpen} variant="navy" />
          <StatPill label="Pending" value={docSummary.pending} icon={Clock} variant="amber" />
          <StatPill label="Approved" value={docSummary.approved} icon={FileCheck} variant="green" />
          {docSummary.rejected > 0 ? (
            <StatPill label="Rejected" value={docSummary.rejected} icon={FileX} variant="red" />
          ) : (
            <StatPill label="Rejected" value={0} icon={FileX} variant="red" />
          )}
        </div>
      )}

      {message.text && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            message.type === 'success'
              ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]'
              : 'border-[#FECACA] bg-[#FEF2F2] text-[#EF4444]'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
          )}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
        {/* Upload column */}
        <div className="space-y-5">
          {/* CNIC card */}
          <SectionCard
            title="CNIC verification"
            subtitle="Upload front and back in one request for admin review"
            icon={IdCard}
          >
            <form onSubmit={handleCnicRequestSubmit} className="space-y-4 p-4 sm:p-5">
              <div>
                <label htmlFor="cnic-number" className={labelClass}>
                  CNIC number <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  id="cnic-number"
                  type="text"
                  inputMode="numeric"
                  value={cnicForm.cnicNumber}
                  onChange={(e) =>
                    setCnicForm((prev) => ({
                      ...prev,
                      cnicNumber: e.target.value.replace(/\D/g, '').slice(0, 13),
                    }))
                  }
                  placeholder="1234567890123"
                  maxLength={13}
                  className={inputClass}
                  required
                />
                <p className="mt-1 text-xs text-[#6B7280]">Exactly 13 digits, no dashes</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FilePicker
                  id="provider-cnic-front-input"
                  label="CNIC front *"
                  file={cnicForm.frontFile}
                  onChange={(e) => handleCnicFileChange(e, 'frontFile')}
                />
                <FilePicker
                  id="provider-cnic-back-input"
                  label="CNIC back *"
                  file={cnicForm.backFile}
                  onChange={(e) => handleCnicFileChange(e, 'backFile')}
                />
              </div>

              <button
                type="submit"
                disabled={uploadingCnic || !cnicForm.frontFile || !cnicForm.backFile}
                className={primaryBtnClass}
              >
                {uploadingCnic ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Submit CNIC request
                  </>
                )}
              </button>
            </form>
          </SectionCard>

          {/* Supporting docs card */}
          <SectionCard
            title="Supporting documents"
            subtitle="Certificates and other optional files"
            icon={FileText}
          >
            <div className="p-4 sm:p-5">
              {!isVerified && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#FED7AA] bg-[#FEF3C7] px-3 py-2.5 text-sm text-[#B45309]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  Available after CNIC verification is approved.
                </div>
              )}

              <form onSubmit={handleSupportingUpload} className="space-y-4">
                <div>
                  <label htmlFor="supporting-type" className={labelClass}>
                    Document type
                  </label>
                  <select
                    id="supporting-type"
                    value={supportingForm.documentType}
                    disabled={!isVerified}
                    onChange={(e) =>
                      setSupportingForm({
                        documentType: e.target.value as 'CERTIFICATE' | 'OTHER',
                        files: [],
                      })
                    }
                    className={inputClass}
                    required
                  >
                    <option value="CERTIFICATE">Certificate (multiple images)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="provider-supporting-doc-input" className={labelClass}>
                    Select image{supportingForm.documentType === 'CERTIFICATE' ? 's' : ''}
                  </label>
                  <label
                    htmlFor="provider-supporting-doc-input"
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D1FAE5] bg-[#F9FAFB] px-3 py-5 text-center transition-all hover:border-[#10B981]/50 hover:bg-[#D1FAE5]/20 ${
                      !isVerified ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    <ImageIcon className="mb-2 h-6 w-6 text-[#10B981]" />
                    <span className="text-xs font-semibold text-[#111827]">Tap to select files</span>
                    <input
                      id="provider-supporting-doc-input"
                      type="file"
                      onChange={handleSupportingFilesChange}
                      accept="image/jpeg,image/png,image/jpg"
                      multiple={supportingForm.documentType === 'CERTIFICATE'}
                      disabled={!isVerified}
                      className="hidden"
                    />
                  </label>
                </div>

                {supportingForm.files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#374151]">
                      Selected ({supportingForm.files.length})
                    </p>
                    {supportingForm.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 transition-colors hover:border-[#10B981]/25"
                      >
                        <ImageIcon className="h-4 w-4 shrink-0 text-[#10B981]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#111827]">{file.name}</p>
                          <p className="text-xs text-[#6B7280]">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    uploadingSupporting ||
                    supportingForm.files.length === 0 ||
                    !isVerified
                  }
                  className={primaryBtnClass}
                >
                  {uploadingSupporting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Upload{' '}
                      {supportingForm.files.length > 1
                        ? `${supportingForm.files.length} files`
                        : 'document'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </SectionCard>
        </div>

        {/* Documents list */}
        <SectionCard title="Uploaded documents" icon={FolderOpen}>
          <div className="p-4 sm:p-5">
            {documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] py-10 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/50">
                  <FileText className="h-6 w-6 text-[#059669]" />
                </div>
                <p className="text-sm text-[#6B7280]">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="max-h-[min(70vh,640px)] space-y-3 overflow-y-auto pr-0.5">
                {documents.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ y: -1 }}
                    className="rounded-xl border border-[#E5E7EB] bg-white p-3.5 shadow-sm transition-all duration-200 hover:border-[#10B981]/25 hover:shadow-[0_4px_16px_rgba(16,185,129,0.08)] sm:p-4"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/50">
                        {doc.mimeType.startsWith('image/') ? (
                          <ImageIcon className="h-5 w-5 text-[#059669]" />
                        ) : (
                          <FileText className="h-5 w-5 text-[#059669]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-[#111827]">
                              {doc.documentType.replace(/_/g, ' ')}
                            </h4>
                            <p className="truncate text-xs text-[#6B7280]">{doc.fileName}</p>
                            <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                              {formatFileSize(doc.fileSize)} ·{' '}
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${docStatusStyles(doc.status)}`}
                          >
                            <StatusIcon status={doc.status} />
                            {doc.status}
                          </span>
                        </div>

                        {doc.status === 'REJECTED' && doc.rejectionReason && (
                          <p className="mt-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-2 text-xs text-[#DC2626]">
                            {doc.rejectionReason}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => handleViewDocument(doc.fileUrl)}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#059669] transition-colors hover:bg-[#D1FAE5]/40"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View document
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </section>
  );
};
