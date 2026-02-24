'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  uploadedAt: string;
}

interface ProviderData {
  id: string;
  verificationStatus: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [uploadForm, setUploadForm] = useState({
    documentType: 'CNIC_FRONT',
    cnicNumber: '',
    files: [] as File[], // Support multiple files for certificates
  });

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
      // First get current user to get provider ID
      const userRes = await fetch('/api/profile');
      if (!userRes.ok) {
        if (userRes.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch user profile');
      }

      const userData = await userRes.json();

      if (userData.user.role !== 'PROVIDER') {
        router.push('/home');
        return;
      }

      // Get provider profile to get providerId
      const providerRes = await fetch(`/api/providers/${userData.user.id}`);
      if (!providerRes.ok) {
        throw new Error('Failed to fetch provider profile');
      }

      const providerData = await providerRes.json();
      setProvider(providerData.provider);

      // Fetch documents
      const docsRes = await fetch(
        `/api/providers/${providerData.provider.id}/documents`
      );
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData.documents || []);
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
      setMessage({ type: 'error', text: 'Failed to load provider data' });
    } finally {
      setLoading(false);
    }
  };

  // Direct image viewing - no signed URL needed for images
  const handleViewDocument = (fileUrl: string) => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Validate all files are images
    const invalidFiles = selectedFiles.filter(
      file => !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setMessage({
        type: 'error',
        text: 'All files must be images (JPEG or PNG)',
      });
      return;
    }

    // Validate file sizes
    const maxSize = 5 * 1024 * 1024; // 5MB per file
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setMessage({
        type: 'error',
        text: 'Each file must be less than 5MB',
      });
      return;
    }

    // For CNIC, only allow one file
    if (
      (uploadForm.documentType === 'CNIC_FRONT' || uploadForm.documentType === 'CNIC_BACK') &&
      selectedFiles.length > 1
    ) {
      setMessage({
        type: 'error',
        text: 'Only one image allowed for CNIC documents',
      });
      return;
    }

    setMessage({ type: '', text: '' });
    setUploadForm({ ...uploadForm, files: selectedFiles });
  };

  /**
   * Upload image to Cloudinary (images only)
   */
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

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadForm.files.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one image' });
      return;
    }

    if (!provider) {
      setMessage({ type: 'error', text: 'Failed to load provider data' });
      return;
    }

    // Validate CNIC number for CNIC documents
    if (
      (uploadForm.documentType === 'CNIC_FRONT' || uploadForm.documentType === 'CNIC_BACK') &&
      !uploadForm.cnicNumber
    ) {
      setMessage({
        type: 'error',
        text: 'CNIC number is required for CNIC documents',
      });
      return;
    }

    if (uploadForm.documentType === 'CNIC_FRONT' || uploadForm.documentType === 'CNIC_BACK') {
      const cnicRegex = /^\d{13}$/;
      if (!cnicRegex.test(uploadForm.cnicNumber)) {
        setMessage({
          type: 'error',
          text: 'CNIC must be exactly 13 digits',
        });
        return;
      }
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      // Upload all selected files
      let uploadedCount = 0;

      for (const file of uploadForm.files) {
        // Upload to Cloudinary
        const fileUrl = await uploadToCloudinary(file);

        // Save to database
        const res = await fetch(`/api/providers/${provider.id}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            documentType: uploadForm.documentType,
            cnicNumber:
              (uploadForm.documentType === 'CNIC_FRONT' || uploadForm.documentType === 'CNIC_BACK')
                ? uploadForm.cnicNumber
                : undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Upload failed');
        }

        uploadedCount++;
      }

      const successMessage = uploadedCount === 1
        ? 'Document uploaded successfully!'
        : `${uploadedCount} documents uploaded successfully!`;

      setMessage({ type: 'success', text: successMessage });

      // Reset form
      setUploadForm({ documentType: 'CNIC_FRONT', cnicNumber: '', files: [] });

      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Refresh documents list
      fetchProviderData();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Upload failed',
      });
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
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
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Identity Verification & Documents
            </h1>
            <p className="text-gray-600 mt-2">
              Upload your CNIC and certification documents for verification
            </p>
            {provider && (
              <div className="mt-4">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
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

          {/* Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Upload New Document
            </h2>
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  value={uploadForm.documentType}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, documentType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="CNIC_FRONT">CNIC Front</option>
                  <option value="CNIC_BACK">CNIC Back</option>
                  <option value="CERTIFICATE">Certificate (Multiple Images)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {(uploadForm.documentType === 'CNIC_FRONT' ||
                uploadForm.documentType === 'CNIC_BACK') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNIC Number (13 digits) *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.cnicNumber}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, cnicNumber: e.target.value })
                    }
                    placeholder="1234567890123"
                    maxLength={13}
                    pattern="\d{13}"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter exactly 13 digits without dashes
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image{uploadForm.documentType === 'CERTIFICATE' ? 's' : ''} *
                </label>
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg"
                  multiple={uploadForm.documentType === 'CERTIFICATE'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {uploadForm.documentType === 'CERTIFICATE'
                    ? 'JPEG or PNG only, max 5MB each. You can select multiple images.'
                    : 'JPEG or PNG only, max 5MB'}
                </p>
              </div>

              {uploadForm.files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Selected {uploadForm.files.length} file{uploadForm.files.length > 1 ? 's' : ''}:
                  </p>
                  {uploadForm.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <ImageIcon className="w-6 h-6 text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || uploadForm.files.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload {uploadForm.files.length > 1 ? `${uploadForm.files.length} Documents` : 'Document'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Uploaded Documents */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Uploaded Documents
            </h2>
            {documents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No documents uploaded yet
              </p>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {doc.mimeType.startsWith('image/') ? (
                        <ImageIcon className="w-10 h-10 text-emerald-600" />
                      ) : (
                        <FileText className="w-10 h-10 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {doc.documentType.replace(/_/g, ' ')}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(doc.fileSize)} •{' '}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            doc.status
                          )}`}
                        >
                          {getStatusIcon(doc.status)}
                          {doc.status}
                        </span>
                      </div>
                      {doc.status === 'REJECTED' && doc.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs font-medium text-red-800">
                            Rejection Reason:
                          </p>
                          <p className="text-xs text-red-700 mt-1">
                            {doc.rejectionReason}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => handleViewDocument(doc.fileUrl)}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2 cursor-pointer bg-transparent border-0 p-0 hover:underline"
                      >
                        View Document
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
