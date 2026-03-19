"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Calendar,
  User,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Tag,
} from "lucide-react";

interface QueryDetail {
  id: string;
  queryNumber: string;
  subject: string;
  message: string;
  queryType: string;
  status: string;
  bookingId: string | null;
  adminReply: string | null;
  repliedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    profileImage: string | null;
    city: string | null;
    address: string | null;
    createdAt: string;
  };
}

interface BookingInfo {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  service: { name: string };
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-700",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const TYPE_LABELS: Record<string, string> = {
  GENERAL: "General",
  SERVICE_ISSUE: "Service Issue",
  PAYMENT: "Payment",
  BOOKING: "Booking",
  ACCOUNT: "Account",
  OTHER: "Other",
};

export default function QueryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [query, setQuery] = useState<QueryDetail | null>(null);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchQuery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/queries/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuery(data.query);
        setBooking(data.booking);
      }
    } catch (err) {
      console.error("Failed to fetch query:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchQuery();
  }, [id, fetchQuery]);

  const showMsg = (type: "success" | "error", msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 4000);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/queries/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      if (res.ok) {
        showMsg("success", "Reply sent to user via email successfully");
        setReplyText("");
        await fetchQuery();
      } else {
        showMsg("error", "Failed to send reply");
      }
    } catch {
      showMsg("error", "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/queries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showMsg("success", `Status updated to ${STATUS_LABELS[newStatus]}`);
        await fetchQuery();
      } else {
        showMsg("error", "Failed to update status");
      }
    } catch {
      showMsg("error", "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="p-6">
        <p className="text-red-500">Query not found.</p>
        <button
          onClick={() => router.push("/admin/queries")}
          className="mt-4 text-emerald-600 hover:underline"
        >
          Back to queries
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/queries")}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">{query.queryNumber}</h1>
            <p className="text-slate-500 text-sm">
              Submitted on {new Date(query.createdAt).toLocaleDateString()} at{" "}
              {new Date(query.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            STATUS_COLORS[query.status] || "bg-slate-100 text-slate-700"
          }`}
        >
          {STATUS_LABELS[query.status] || query.status}
        </span>
      </div>

      {/* Status message */}
      {status && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {status.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Query Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={18} className="text-emerald-600" />
              <h2 className="text-lg font-semibold">Query Details</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Subject</p>
                <p className="font-medium text-slate-800 mt-1">{query.subject}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Type</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Tag size={14} className="text-slate-400" />
                  <span className="font-medium text-slate-800">
                    {TYPE_LABELS[query.queryType] || query.queryType}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Message</p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {query.message}
              </div>
            </div>

            {query.bookingId && booking && (
              <div className="border-t pt-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                  Related Booking
                </p>
                <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">{booking.bookingNumber}</p>
                    <p className="text-sm text-blue-700">{booking.service.name}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {booking.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Previous Reply */}
          {query.adminReply && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={18} className="text-emerald-600" />
                <h2 className="text-lg font-semibold">Admin Reply</h2>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap border-l-4 border-emerald-500">
                {query.adminReply}
              </div>
              {query.repliedAt && (
                <p className="text-xs text-slate-400 mt-2">
                  Replied on {new Date(query.repliedAt).toLocaleDateString()} at{" "}
                  {new Date(query.repliedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}

          {/* Reply Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <Send size={18} className="text-emerald-600" />
              <h2 className="text-lg font-semibold">
                {query.adminReply ? "Send Another Reply" : "Reply to User"}
              </h2>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              Your reply will be sent to the user&apos;s email address.
            </p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply here..."
              rows={5}
              className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
            />
            <button
              onClick={handleReply}
              disabled={sending || !replyText.trim()}
              className="mt-3 flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Send Reply via Email
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-emerald-600" />
              <h2 className="font-semibold">User Information</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                {query.user.profileImage ? (
                  <img
                    src={query.user.profileImage}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                    {query.user.firstName[0]}
                    {query.user.lastName[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-800">
                    {query.user.firstName} {query.user.lastName}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {query.user.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={14} />
                <a href={`mailto:${query.user.email}`} className="hover:text-emerald-600">
                  {query.user.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={14} />
                <span>{query.user.phone}</span>
              </div>
              {query.user.city && (
                <div className="text-slate-600">
                  <span className="text-slate-400">City:</span> {query.user.city}
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Calendar size={12} />
                Member since {new Date(query.user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-emerald-600" />
              <h2 className="font-semibold">Status Management</h2>
            </div>
            <div className="space-y-2">
              {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus || query.status === s}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    query.status === s
                      ? "bg-emerald-100 text-emerald-700 font-medium"
                      : "hover:bg-slate-50 text-slate-600"
                  } disabled:opacity-50`}
                >
                  {STATUS_LABELS[s]}
                  {query.status === s && " (Current)"}
                </button>
              ))}
            </div>

            {query.resolvedAt && (
              <p className="text-xs text-slate-400 mt-3">
                Resolved on {new Date(query.resolvedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold mb-4">Timeline</h2>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-700">Query submitted</p>
                  <p className="text-xs text-slate-400">
                    {new Date(query.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {query.repliedAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-700">Admin replied</p>
                    <p className="text-xs text-slate-400">
                      {new Date(query.repliedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {query.resolvedAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-700">Marked as resolved</p>
                    <p className="text-xs text-slate-400">
                      {new Date(query.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
