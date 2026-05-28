"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  ShieldCheck,
  FileCheck,
  ExternalLink,
} from "lucide-react";

interface VerificationRequest {
  id: string;
  userId: string;
  businessName?: string;
  cnic: string;
  cnicRequestReady: boolean;
  supportingDocumentsReady?: boolean;
  pendingSupportingDocumentCount?: number;
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

const statusBadge: Record<string, string> = {
  APPROVED:
    "bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)] border border-[var(--admin-beige)]",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
  PENDING: "bg-amber-50 text-amber-800 border border-amber-200",
};

export default function VerificationRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.verificationStatus === "PENDING").length;
    const readyForReview = requests.filter(
      (r) => r.cnicRequestReady || r.supportingDocumentsReady
    ).length;
    const totalDocs = requests.reduce((sum, r) => sum + r.documents.length, 0);
    return { pending, readyForReview, total: requests.length, totalDocs };
  }, [requests]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/verification-requests");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch requests");
      }

      const data = await res.json();
      setRequests(data.verificationRequests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setMessage({ type: "error", text: "Failed to load verification requests" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (providerId: string) => {
    if (!confirm("Are you sure you want to approve this provider?")) return;

    setProcessing(providerId);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`/api/admin/verification-requests/${providerId}/approve`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to approve");
      }

      setMessage({ type: "success", text: "Provider approved successfully!" });
      fetchRequests();
    } catch (error: unknown) {
      const err = error as Error;
      setMessage({ type: "error", text: err.message });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setProcessing(selectedRequest.id);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(
        `/api/admin/verification-requests/${selectedRequest.id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reject");
      }

      setMessage({
        type: "success",
        text: "Provider rejected and notified successfully!",
      });
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason("");
      fetchRequests();
    } catch (error: unknown) {
      const err = error as Error;
      setMessage({ type: "error", text: err.message });
    } finally {
      setProcessing(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "REJECTED":
        return <XCircle className="h-3.5 w-3.5" />;
      case "PENDING":
        return <Clock className="h-3.5 w-3.5" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5" />;
    }
  };

  if (loading) {
    return (
      <section className="flex h-72 flex-col items-center justify-center gap-3 sm:h-96">
        <Loader2 className="animate-spin text-[var(--admin-green)]" size={40} />
        <p className="text-sm font-medium text-[var(--admin-green)]/70 animate-admin-fade-in-up">
          Loading verification requests…
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5 md:space-y-7">
      {/* Header */}
      <div className="animate-admin-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="hidden rounded-2xl bg-[var(--admin-green)] p-3 text-white shadow-lg sm:block">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--admin-green-dark)] sm:text-3xl">
              Provider Verification
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-green)]/75 sm:text-base">
              Review and approve or reject provider identity verification requests
            </p>
          </div>
        </div>
        <div className="animate-admin-scale-in self-start rounded-xl border border-[var(--admin-beige)]/60 bg-white/80 px-4 py-2.5 text-sm shadow-sm">
          <span className="font-bold text-[var(--admin-green-dark)]">{stats.total}</span>
          <span className="ml-1 text-[var(--admin-green)]/70">requests</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          { label: "Total Requests", value: stats.total, icon: FileCheck, stagger: "admin-stagger-1" },
          { label: "Pending", value: stats.pending, icon: Clock, stagger: "admin-stagger-2" },
          {
            label: "Ready to Review",
            value: stats.readyForReview,
            icon: ShieldCheck,
            stagger: "admin-stagger-3",
          },
          { label: "Documents", value: stats.totalDocs, icon: FileText, stagger: "admin-stagger-4" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`admin-card animate-admin-fade-in-up ${stat.stagger} flex items-center gap-3 rounded-2xl p-4`}
          >
            <div className="rounded-xl bg-[var(--admin-green-muted)] p-2.5 text-[var(--admin-green)]">
              <stat.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[var(--admin-green)]/70">{stat.label}</p>
              <p className="text-xl font-bold text-[var(--admin-green-dark)]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`animate-admin-fade-in-up rounded-2xl border px-4 py-3.5 text-sm font-medium sm:px-5 ${
            message.type === "success"
              ? "border-[var(--admin-beige)] bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)]"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Empty state */}
      {requests.length === 0 ? (
        <div className="admin-card animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl p-12 text-center sm:p-16">
          <div className="mb-4 rounded-2xl bg-[var(--admin-green-muted)] p-5 text-[var(--admin-green)]">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-lg font-bold text-[var(--admin-green-dark)]">No Pending Requests</h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--admin-green)]/65">
            All verification requests have been processed. New submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5 md:space-y-6">
          {requests.map((request, index) => (
            <article
              key={request.id}
              className="admin-card animate-admin-fade-in-up overflow-hidden rounded-2xl border-2 border-transparent transition-all duration-300 hover:border-[var(--admin-green)]/25"
              style={{ animationDelay: `${Math.min(index, 6) * 0.06}s` }}
            >
              {/* Provider header */}
              <div className="border-b border-[var(--admin-beige)]/40 bg-gradient-to-r from-[var(--admin-green-muted)]/50 to-transparent p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                  {request.user.profileImage ? (
                    <img
                      src={request.user.profileImage}
                      alt={`${request.user.firstName} ${request.user.lastName}`}
                      className="mx-auto h-20 w-20 shrink-0 rounded-2xl object-cover ring-4 ring-[var(--admin-beige)]/80 sm:mx-0"
                    />
                  ) : (
                    <div className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--admin-green)] to-[var(--admin-green-dark)] text-2xl font-bold text-white shadow-lg ring-4 ring-[var(--admin-beige)]/60 sm:mx-0">
                      {request.user.firstName[0]}
                      {request.user.lastName[0]}
                    </div>
                  )}

                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--admin-green-dark)]">
                          {request.user.firstName} {request.user.lastName}
                        </h3>
                        {request.businessName && (
                          <p className="mt-0.5 font-medium text-[var(--admin-green)]/80">
                            {request.businessName}
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${statusBadge[request.verificationStatus] || "bg-gray-100 text-gray-700"}`}
                      >
                        {getStatusIcon(request.verificationStatus)}
                        {request.verificationStatus}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2 sm:gap-3">
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-[var(--admin-green-dark)]/80 sm:justify-start">
                        <Mail className="h-4 w-4 shrink-0 text-[var(--admin-green)]" />
                        <span className="truncate">{request.user.email}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-[var(--admin-green-dark)]/80 sm:justify-start">
                        <Phone className="h-4 w-4 shrink-0 text-[var(--admin-green)]" />
                        <span>{request.user.phone}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-[var(--admin-green-dark)]/80 sm:justify-start">
                        <User className="h-4 w-4 shrink-0 text-[var(--admin-green)]" />
                        <span>CNIC: {request.cnic}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-[var(--admin-green-dark)]/80 sm:justify-start">
                        <Briefcase className="h-4 w-4 shrink-0 text-[var(--admin-green)]" />
                        <span>{request.yearsOfExperience} years experience</span>
                      </div>
                    </div>

                    {request.supportingDocumentsReady && (
                      <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-800">
                        {request.pendingSupportingDocumentCount} supporting document
                        {request.pendingSupportingDocumentCount === 1 ? "" : "s"} waiting for
                        review.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="p-4 sm:p-6">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-[var(--admin-green-dark)]">
                  <FileText size={18} className="text-[var(--admin-green)]" />
                  Uploaded Documents
                  <span className="rounded-lg bg-[var(--admin-green-muted)] px-2 py-0.5 text-xs font-bold text-[var(--admin-green)]">
                    {request.documents.length}
                  </span>
                </h4>

                {request.documents.length === 0 ? (
                  <p className="text-sm text-[var(--admin-green)]/50">No documents uploaded</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {request.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="group flex flex-col gap-3 rounded-xl border border-[var(--admin-beige)]/50 bg-white/80 p-4 transition-all duration-200 hover:border-[var(--admin-green)]/40 hover:shadow-md sm:flex-row sm:items-start"
                      >
                        <div className="flex shrink-0 items-center justify-center rounded-xl bg-[var(--admin-green-muted)] p-3 text-[var(--admin-green)]">
                          {doc.mimeType.startsWith("image/") ? (
                            <ImageIcon className="h-7 w-7" />
                          ) : (
                            <FileText className="h-7 w-7" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm font-semibold text-[var(--admin-green-dark)]">
                            {doc.documentType.replace(/_/g, " ")}
                          </h5>
                          <p className="mt-0.5 truncate text-xs text-[var(--admin-green)]/65">
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-[var(--admin-green)]/50">
                            {formatFileSize(doc.fileSize)}
                          </p>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--admin-green)] transition-colors hover:text-[var(--admin-green-dark)]"
                          >
                            View Document
                            <ExternalLink size={12} />
                          </a>
                        </div>
                        <span
                          className={`inline-flex w-fit items-center gap-1 self-start rounded-lg px-2.5 py-1 text-xs font-semibold sm:self-auto ${statusBadge[doc.status] || "bg-gray-100 text-gray-700"}`}
                        >
                          {getStatusIcon(doc.status)}
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              {(request.cnicRequestReady || request.supportingDocumentsReady) && (
                <div className="border-t border-[var(--admin-beige)]/40 bg-[var(--admin-cream)]/50 p-4 sm:p-6">
                  {request.supportingDocumentsReady ? (
                    <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                      Provider verification is already approved. Review and approve supporting
                      documents separately.
                    </div>
                  ) : (
                    <div className="mb-4 rounded-xl border border-[var(--admin-beige)] bg-[var(--admin-green-muted)] px-4 py-3 text-sm text-[var(--admin-green-dark)]">
                      CNIC front and back are ready for verification review.
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <button
                      type="button"
                      onClick={() => handleApprove(request.id)}
                      disabled={
                        processing === request.id ||
                        (!request.cnicRequestReady && !request.supportingDocumentsReady)
                      }
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--admin-green)] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[var(--admin-green-dark)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processing === request.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      {request.supportingDocumentsReady && !request.cnicRequestReady
                        ? "Approve Documents"
                        : "Approve Verification"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectClick(request)}
                      disabled={processing === request.id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-6 py-3.5 text-sm font-semibold text-red-700 transition-all duration-200 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle className="h-5 w-5" />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--admin-green-dark)]/50 p-4 backdrop-blur-sm animate-admin-fade-in-up">
          <div
            className="admin-card w-full max-w-md animate-admin-scale-in space-y-4 rounded-2xl p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-verification-title"
          >
            <h3
              id="reject-verification-title"
              className="text-lg font-bold text-[var(--admin-green-dark)]"
            >
              Reject Verification Request
            </h3>
            <p className="text-sm text-[var(--admin-green-dark)]/75">
              Please provide a reason for rejecting{" "}
              <strong>
                {selectedRequest.user.firstName} {selectedRequest.user.lastName}
              </strong>
              &apos;s verification request:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-[var(--admin-beige)] bg-white px-4 py-3 text-sm text-[var(--admin-green-dark)] transition-all focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Enter detailed reason for rejection..."
              required
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason("");
                }}
                disabled={processing !== null}
                className="rounded-xl border border-[var(--admin-beige)] px-4 py-2.5 text-sm font-medium text-[var(--admin-green-dark)] transition-colors hover:bg-[var(--admin-green-muted)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={processing !== null || !rejectionReason.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {processing === selectedRequest.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rejecting…
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Reject
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
