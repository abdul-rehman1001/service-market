'use client';

import { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
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

  useEffect(() => {
    void fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
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
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <section className="min-h-[320px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
          Identity Verification & Documents
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Submit CNIC verification and upload supporting documents
        </p>
        {provider && (
          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                provider.verificationStatus === 'APPROVED'
                  ? 'bg-green-100 text-green-800'
                  : provider.verificationStatus === 'REJECTED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {getStatusIcon(provider.verificationStatus)}
              Verification Status: {provider.verificationStatus}
            </span>
          </div>
        )}
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg border text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">CNIC Verification Request</h3>
          <p className="text-sm text-gray-600 mb-5">
            Upload CNIC front and back together in one request. Provider verification is approved only after admin approves this CNIC request.
          </p>

          <form onSubmit={handleCnicRequestSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Number (13 digits) *</label>
              <input
                type="text"
                value={cnicForm.cnicNumber}
                onChange={(e) =>
                  setCnicForm((prev) => ({
                    ...prev,
                    cnicNumber: e.target.value.replace(/\D/g, '').slice(0, 13),
                  }))
                }
                placeholder="1234567890123"
                maxLength={13}
                pattern="\d{13}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter exactly 13 digits without dashes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Front *</label>
                <input
                  id="provider-cnic-front-input"
                  type="file"
                  onChange={(e) => handleCnicFileChange(e, 'frontFile')}
                  accept="image/jpeg,image/png,image/jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {cnicForm.frontFile && (
                  <p className="text-xs text-gray-600 mt-1 truncate">{cnicForm.frontFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Back *</label>
                <input
                  id="provider-cnic-back-input"
                  type="file"
                  onChange={(e) => handleCnicFileChange(e, 'backFile')}
                  accept="image/jpeg,image/png,image/jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {cnicForm.backFile && (
                  <p className="text-xs text-gray-600 mt-1 truncate">{cnicForm.backFile.name}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={uploadingCnic || !cnicForm.frontFile || !cnicForm.backFile}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingCnic ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting CNIC Request...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Submit CNIC Verification Request
                </>
              )}
            </button>
          </form>

          <div className="my-6 border-t border-gray-200" />

          <h3 className="text-lg font-semibold text-gray-900 mb-2">Supporting Documents</h3>
          <p className="text-sm text-gray-600 mb-5">
            Upload optional supporting documents such as certificates.
          </p>

          {provider?.verificationStatus !== 'APPROVED' && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Supporting document requests are available after your CNIC verification is approved.
            </div>
          )}

          <form onSubmit={handleSupportingUpload} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type *</label>
              <select
                value={supportingForm.documentType}
                disabled={provider?.verificationStatus !== 'APPROVED'}
                onChange={(e) =>
                  setSupportingForm({
                    documentType: e.target.value as 'CERTIFICATE' | 'OTHER',
                    files: [],
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                <option value="CERTIFICATE">Certificate (Multiple Images)</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image{supportingForm.documentType === 'CERTIFICATE' ? 's' : ''} *
              </label>
              <input
                id="provider-supporting-doc-input"
                type="file"
                onChange={handleSupportingFilesChange}
                accept="image/jpeg,image/png,image/jpg"
                multiple={supportingForm.documentType === 'CERTIFICATE'}
                disabled={provider?.verificationStatus !== 'APPROVED'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {supportingForm.documentType === 'CERTIFICATE'
                  ? 'JPEG or PNG only, max 5MB each. You can select multiple images.'
                  : 'JPEG or PNG only, max 5MB'}
              </p>
            </div>

            {supportingForm.files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Selected {supportingForm.files.length} file{supportingForm.files.length > 1 ? 's' : ''}:
                </p>
                {supportingForm.files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-emerald-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
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
                provider?.verificationStatus !== 'APPROVED'
              }
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingSupporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload {supportingForm.files.length > 1 ? `${supportingForm.files.length} Documents` : 'Document'}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Uploaded Documents</h3>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-auto pr-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {doc.mimeType.startsWith('image/') ? (
                        <ImageIcon className="w-8 h-8 text-emerald-600" />
                      ) : (
                        <FileText className="w-8 h-8 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {doc.documentType.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">{doc.fileName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            doc.status
                          )}`}
                        >
                          {getStatusIcon(doc.status)}
                          {doc.status}
                        </span>
                      </div>

                      {doc.status === 'REJECTED' && doc.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs font-medium text-red-800">Rejection Reason:</p>
                          <p className="text-xs text-red-700 mt-1">{doc.rejectionReason}</p>
                        </div>
                      )}

                      <button
                        onClick={() => handleViewDocument(doc.fileUrl)}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2 hover:underline"
                      >
                        View Document
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
