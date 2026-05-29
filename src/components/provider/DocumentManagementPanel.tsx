'use client';

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
  'w-full rounded-xl border border-[#6FCF97]/45 bg-white px-4 py-2.5 text-sm text-[#1F6F5F] shadow-sm transition focus:border-[#2FA084] focus:outline-none focus:ring-2 focus:ring-[#2FA084]/25 disabled:cursor-not-allowed disabled:bg-[#EEEEEE]';

const labelClass = 'mb-1.5 block text-sm font-semibold text-[#1F6F5F]';

const primaryBtnClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2FA084] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1F6F5F] disabled:cursor-not-allowed disabled:opacity-50';

/** Solid secondary text — avoids opacity-based “faded” look */
const mutedTextClass = 'text-[#4A7268]';

const cardHeaderClass = 'border-b border-[#6FCF97] bg-[#EEEEEE] px-4 py-3.5 sm:px-5';

function verificationBadgeStyles(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'bg-[#6FCF97]/25 text-[#1F6F5F] border-[#6FCF97]/40';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
}

function docStatusStyles(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'bg-[#6FCF97]/25 text-[#1F6F5F] border-[#6FCF97]/40';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
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
        return <CheckCircle2 className="h-4 w-4 text-[#2FA084]" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-[#1F6F5F]/50" />;
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
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#6FCF97] bg-[#EEEEEE] px-3 py-4 text-center transition hover:border-[#2FA084] hover:bg-[#6FCF97]/20 ${
          disabled ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <Upload className="mb-1.5 h-5 w-5 text-[#2FA084]" />
        <span className="text-xs font-semibold text-[#1F6F5F]">Tap to upload</span>
        <span className={`mt-0.5 text-[10px] ${mutedTextClass}`}>JPEG or PNG, max 5MB</span>
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
        <p className="mt-1.5 truncate text-xs font-medium text-[#2FA084]">{file.name}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#6FCF97]/35 bg-white py-16">
        <Loader2 className="h-9 w-9 animate-spin text-[#2FA084]" />
        <p className={`text-sm ${mutedTextClass}`}>Loading documents…</p>
      </section>
    );
  }

  const isVerified = provider?.verificationStatus === 'APPROVED';

  return (
    <section className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#1F6F5F] sm:text-2xl">Documents</h2>
          <p className={`mt-1 text-sm ${mutedTextClass}`}>
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
        <button
          type="button"
          onClick={fetchProviderData}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#6FCF97]/50 bg-white px-3.5 py-2 text-sm font-semibold text-[#1F6F5F] shadow-sm transition hover:border-[#2FA084] hover:bg-[#EEEEEE] disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Doc summary pills */}
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#6FCF97]/40 bg-[#EEEEEE] px-3 py-1 text-xs font-semibold text-[#1F6F5F]">
            Total: {docSummary.total}
          </span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            Pending: {docSummary.pending}
          </span>
          <span className="rounded-full border border-[#6FCF97]/40 bg-[#6FCF97]/15 px-3 py-1 text-xs font-semibold text-[#1F6F5F]">
            Approved: {docSummary.approved}
          </span>
          {docSummary.rejected > 0 && (
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              Rejected: {docSummary.rejected}
            </span>
          )}
        </div>
      )}

      {message.text && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            message.type === 'success'
              ? 'border-[#6FCF97]/50 bg-[#6FCF97]/15 text-[#1F6F5F]'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
        {/* Upload column */}
        <div className="space-y-5">
          {/* CNIC card */}
          <div className="overflow-hidden rounded-2xl border border-[#6FCF97]/35 bg-white shadow-sm">
            <div className={cardHeaderClass}>
              <h3 className="flex items-center gap-2 text-base font-bold text-[#1F6F5F]">
                <IdCard className="h-5 w-5 text-[#2FA084]" />
                CNIC verification
              </h3>
              <p className={`mt-1 text-xs sm:text-sm ${mutedTextClass}`}>
                Upload front and back in one request for admin review
              </p>
            </div>

            <form onSubmit={handleCnicRequestSubmit} className="space-y-4 p-4 sm:p-5">
              <div>
                <label htmlFor="cnic-number" className={labelClass}>
                  CNIC number <span className="text-red-500">*</span>
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
                <p className={`mt-1 text-xs ${mutedTextClass}`}>Exactly 13 digits, no dashes</p>
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
          </div>

          {/* Supporting docs card */}
          <div className="overflow-hidden rounded-2xl border border-[#6FCF97]/35 bg-white shadow-sm">
            <div className={cardHeaderClass}>
              <h3 className="flex items-center gap-2 text-base font-bold text-[#1F6F5F]">
                <FileText className="h-5 w-5 text-[#2FA084]" />
                Supporting documents
              </h3>
              <p className={`mt-1 text-xs sm:text-sm ${mutedTextClass}`}>
                Certificates and other optional files
              </p>
            </div>

            <div className="p-4 sm:p-5">
              {!isVerified && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
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
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#6FCF97] bg-[#EEEEEE] px-3 py-5 text-center transition hover:border-[#2FA084] ${
                      !isVerified ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    <ImageIcon className="mb-2 h-6 w-6 text-[#2FA084]" />
                    <span className="text-xs font-semibold text-[#1F6F5F]">Tap to select files</span>
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
                    <p className="text-xs font-semibold text-[#1F6F5F]">
                      Selected ({supportingForm.files.length})
                    </p>
                    {supportingForm.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2.5 rounded-lg border border-[#6FCF97] bg-[#EEEEEE] px-3 py-2"
                      >
                        <ImageIcon className="h-4 w-4 shrink-0 text-[#2FA084]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#1F6F5F]">{file.name}</p>
                          <p className={`text-xs ${mutedTextClass}`}>{formatFileSize(file.size)}</p>
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
          </div>
        </div>

        {/* Documents list */}
        <div className="overflow-hidden rounded-2xl border border-[#6FCF97]/35 bg-white shadow-sm">
          <div className={cardHeaderClass}>
            <h3 className="text-base font-bold text-[#1F6F5F] sm:text-lg">Uploaded documents</h3>
          </div>

          <div className="p-4 sm:p-5">
            {documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#6FCF97] bg-[#EEEEEE] py-10 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-[#2FA084]" />
                <p className={`text-sm ${mutedTextClass}`}>No documents uploaded yet</p>
              </div>
            ) : (
              <div className="max-h-[min(70vh,640px)] space-y-3 overflow-y-auto pr-0.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-[#6FCF97] bg-[#EEEEEE] p-3.5 sm:p-4"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6FCF97]/35">
                        {doc.mimeType.startsWith('image/') ? (
                          <ImageIcon className="h-5 w-5 text-[#2FA084]" />
                        ) : (
                          <FileText className="h-5 w-5 text-[#2FA084]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-[#1F6F5F]">
                              {doc.documentType.replace(/_/g, ' ')}
                            </h4>
                            <p className={`truncate text-xs ${mutedTextClass}`}>{doc.fileName}</p>
                            <p className={`mt-0.5 text-[10px] ${mutedTextClass}`}>
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
                          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-700">
                            {doc.rejectionReason}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => handleViewDocument(doc.fileUrl)}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#2FA084] hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View document
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
