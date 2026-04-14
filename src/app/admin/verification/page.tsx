'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface VerificationRequest {
  id: string;
  userId: string;
  businessName?: string;
  cnic: string;
  cnicRequestReady: boolean;
  yearsOfExperience: number;
  verificationStatus: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  documents: Array<{
    id: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    status: string;
    rejectionReason?: string;
    uploadedAt: string;
  }>;
}

export default function VerificationRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/verification-requests');
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch requests');
      }

      const data = await res.json();
      setRequests(data.verificationRequests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMessage({ type: 'error', text: 'Failed to load verification requests' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (providerId: string) => {
    if (!confirm('Are you sure you want to approve this provider?')) return;

    setProcessing(providerId);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(
        `/api/admin/verification-requests/${providerId}/approve`,
        { method: 'POST' }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve');
      }

      setMessage({ type: 'success', text: 'Provider approved successfully!' });
      fetchRequests();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(selectedRequest.id);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(
        `/api/admin/verification-requests/${selectedRequest.id}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject');
      }

      setMessage({
        type: 'success',
        text: 'Provider rejected and notified successfully!',
      });
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setProcessing(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Verification Requests
          </h1>
          <p className="text-gray-600 mt-2">
            Review and approve or reject provider identity verification requests
          </p>
        </div>

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

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Pending Requests
            </h3>
            <p className="text-gray-600">
              All verification requests have been processed
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:border-emerald-300 transition-colors"
              >
                {/* Provider Info */}
                <div className="flex items-start gap-6 mb-6">
                  {request.user.profileImage ? (
                    <img
                      src={request.user.profileImage}
                      alt={`${request.user.firstName} ${request.user.lastName}`}
                      className="w-20 h-20 rounded-full object-cover border-4 border-emerald-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-emerald-100">
                      {request.user.firstName[0]}
                      {request.user.lastName[0]}
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {request.user.firstName} {request.user.lastName}
                    </h3>
                    {request.businessName && (
                      <p className="text-gray-600 font-medium">
                        {request.businessName}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {request.user.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {request.user.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        CNIC: {request.cnic}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        {request.yearsOfExperience} years experience
                      </div>
                    </div>

                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                          request.verificationStatus
                        )}`}
                      >
                        {getStatusIcon(request.verificationStatus)}
                        {request.verificationStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Uploaded Documents ({request.documents.length})
                  </h4>

                  {request.documents.length === 0 ? (
                    <p className="text-gray-500 text-sm">No documents uploaded</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {request.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {doc.mimeType.startsWith('image/') ? (
                              <ImageIcon className="w-8 h-8 text-emerald-600" />
                            ) : (
                              <FileText className="w-8 h-8 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900">
                              {doc.documentType.replace(/_/g, ' ')}
                            </h5>
                            <p className="text-xs text-gray-600 truncate">
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(doc.fileSize)}
                            </p>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 text-xs font-medium mt-1 inline-block"
                            >
                              View Document →
                            </a>
                          </div>
                          <span
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              doc.status
                            )}`}
                          >
                            {getStatusIcon(doc.status)}
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {request.verificationStatus === 'PENDING' && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    {!request.cnicRequestReady && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                        Approval is disabled until provider submits both CNIC Front and CNIC Back in pending status.
                      </div>
                    )}

                    <div className="flex gap-4">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processing === request.id || !request.cnicRequestReady}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {processing === request.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectClick(request)}
                      disabled={processing === request.id}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Reject Verification Request
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting{' '}
                <strong>
                  {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                </strong>
                's verification request:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Enter detailed reason for rejection..."
                required
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  disabled={processing !== null}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={processing !== null || !rejectionReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {processing === selectedRequest.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
