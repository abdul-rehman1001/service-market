"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  HelpCircle,
  MapPin,
} from "lucide-react";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

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
  OPEN: "bg-amber-50 text-amber-800 border border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border border-blue-200",
  RESOLVED:
    "bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)] border border-[var(--admin-beige)]",
  CLOSED: "bg-slate-100 text-slate-600 border border-slate-200",
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

const inputClass =
  "w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-4 py-3 text-sm text-[var(--admin-green-dark)] shadow-sm transition-all duration-200 focus:border-[var(--admin-green)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20 resize-y";

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
      const res = await authenticatedFetch(`/api/admin/queries/${id}`);
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
      const res = await authenticatedFetch(`/api/admin/queries/${id}`, {
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
      const res = await authenticatedFetch(`/api/admin/queries/${id}`, {
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
      <section className="flex h-72 flex-col items-center justify-center gap-3 sm:h-96">
        <Loader2 className="animate-spin text-[var(--admin-green)]" size={40} />
        <p className="text-sm font-medium text-[var(--admin-green)]/70 animate-admin-fade-in-up">
          Loading query details…
        </p>
      </section>
    );
  }

  if (!query) {
    return (
      <section className="admin-card animate-admin-scale-in rounded-2xl p-8 text-center">
        <p className="font-semibold text-red-600">Query not found.</p>
        <Link
          href="/admin/queries"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--admin-green)] hover:text-[var(--admin-green-dark)]"
        >
          <ArrowLeft size={16} />
          Back to queries
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-5 md:space-y-7">
      {/* Header */}
      <div className="animate-admin-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          <Link
            href="/admin/queries"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-beige)] bg-white text-[var(--admin-green-dark)] shadow-sm transition-all hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)]"
            aria-label="Back to queries"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <HelpCircle size={20} className="hidden text-[var(--admin-green)] sm:block" />
              <h2 className="truncate font-mono text-xl font-bold text-[var(--admin-green-dark)] sm:text-2xl">
                {query.queryNumber}
              </h2>
            </div>
            <p className="mt-1 text-sm text-[var(--admin-green)]/70">
              Submitted{" "}
              {new Date(query.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              at {new Date(query.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-xl px-4 py-2 text-sm font-semibold ${STATUS_COLORS[query.status] || "bg-gray-100 text-gray-700"}`}
        >
          {STATUS_LABELS[query.status] || query.status}
        </span>
      </div>

      {status && (
        <div
          className={`animate-admin-fade-in-up flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            status.type === "success"
              ? "border-[var(--admin-beige)] bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)]"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {status.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2 lg:space-y-6">
          {/* Query details */}
          <div className="admin-card animate-admin-fade-in-up admin-stagger-1 rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-[var(--admin-green-muted)] p-2 text-[var(--admin-green)]">
                <MessageSquare size={18} />
              </div>
              <h3 className="text-lg font-bold text-[var(--admin-green-dark)]">Query Details</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[var(--admin-green-muted)]/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-green)]/70">
                  Subject
                </p>
                <p className="mt-1 font-semibold text-[var(--admin-green-dark)]">{query.subject}</p>
              </div>
              <div className="rounded-xl bg-[var(--admin-green-muted)]/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-green)]/70">
                  Type
                </p>
                <div className="mt-1 flex items-center gap-1.5 font-semibold text-[var(--admin-green-dark)]">
                  <Tag size={14} className="text-[var(--admin-green)]" />
                  {TYPE_LABELS[query.queryType] || query.queryType}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-green)]/70">
                Message
              </p>
              <div className="rounded-xl border border-[var(--admin-beige)]/50 bg-white/80 p-4 text-sm leading-relaxed text-[var(--admin-green-dark)]/90 whitespace-pre-wrap">
                {query.message}
              </div>
            </div>

            {query.bookingId && booking && (
              <div className="mt-5 border-t border-[var(--admin-beige)]/40 pt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-green)]/70">
                  Related Booking
                </p>
                <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-blue-900">{booking.bookingNumber}</p>
                    <p className="text-sm text-blue-700">{booking.service.name}</p>
                  </div>
                  <span className="inline-flex w-fit rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                    {booking.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Previous reply */}
          {query.adminReply && (
            <div className="admin-card animate-admin-fade-in-up admin-stagger-2 rounded-2xl p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-[var(--admin-green-muted)] p-2 text-[var(--admin-green)]">
                  <FileText size={18} />
                </div>
                <h3 className="text-lg font-bold text-[var(--admin-green-dark)]">Admin Reply</h3>
              </div>
              <div className="rounded-xl border-l-4 border-[var(--admin-green)] bg-[var(--admin-green-muted)]/50 p-4 text-sm leading-relaxed text-[var(--admin-green-dark)]/90 whitespace-pre-wrap">
                {query.adminReply}
              </div>
              {query.repliedAt && (
                <p className="mt-2 text-xs text-[var(--admin-green)]/60">
                  Replied on {new Date(query.repliedAt).toLocaleDateString()} at{" "}
                  {new Date(query.repliedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}

          {/* Reply form */}
          <div className="admin-card animate-admin-fade-in-up admin-stagger-3 rounded-2xl p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-[var(--admin-green-muted)] p-2 text-[var(--admin-green)]">
                <Send size={18} />
              </div>
              <h3 className="text-lg font-bold text-[var(--admin-green-dark)]">
                {query.adminReply ? "Send Another Reply" : "Reply to User"}
              </h3>
            </div>
            <p className="mb-4 text-sm text-[var(--admin-green)]/70">
              Your reply will be sent to the user&apos;s email address.
            </p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply here..."
              rows={5}
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleReply}
              disabled={sending || !replyText.trim()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--admin-green)] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[var(--admin-green-dark)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
        <div className="space-y-5 lg:space-y-6">
          {/* User info */}
          <div className="admin-card animate-admin-fade-in-up admin-stagger-2 rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-[var(--admin-green-muted)] p-2 text-[var(--admin-green)]">
                <User size={18} />
              </div>
              <h3 className="font-bold text-[var(--admin-green-dark)]">User Information</h3>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                {query.user.profileImage ? (
                  <img
                    src={query.user.profileImage}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover ring-2 ring-[var(--admin-beige)]"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--admin-green)] to-[var(--admin-green-dark)] text-sm font-bold text-white">
                    {query.user.firstName[0]}
                    {query.user.lastName[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-[var(--admin-green-dark)]">
                    {query.user.firstName} {query.user.lastName}
                  </p>
                  <span className="mt-1 inline-block rounded-lg bg-[var(--admin-green-muted)] px-2 py-0.5 text-xs font-medium text-[var(--admin-green-dark)]">
                    {query.user.role}
                  </span>
                </div>
              </div>

              <a
                href={`mailto:${query.user.email}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[var(--admin-green-dark)]/80 transition-colors hover:bg-[var(--admin-green-muted)] hover:text-[var(--admin-green)]"
              >
                <Mail size={16} className="shrink-0 text-[var(--admin-green)]" />
                <span className="truncate">{query.user.email}</span>
              </a>
              <div className="flex items-center gap-2 text-[var(--admin-green-dark)]/80">
                <Phone size={16} className="shrink-0 text-[var(--admin-green)]" />
                <span>{query.user.phone}</span>
              </div>
              {query.user.city && (
                <div className="flex items-center gap-2 text-[var(--admin-green-dark)]/80">
                  <MapPin size={16} className="shrink-0 text-[var(--admin-green)]" />
                  <span>{query.user.city}</span>
                </div>
              )}
              <div className="flex items-center gap-2 border-t border-[var(--admin-beige)]/40 pt-3 text-xs text-[var(--admin-green)]/60">
                <Calendar size={14} />
                Member since {new Date(query.user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Status management */}
          <div className="admin-card animate-admin-fade-in-up admin-stagger-3 rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-[var(--admin-green-muted)] p-2 text-[var(--admin-green)]">
                <Clock size={18} />
              </div>
              <h3 className="font-bold text-[var(--admin-green-dark)]">Status Management</h3>
            </div>
            <div className="space-y-2">
              {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus || query.status === s}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                    query.status === s
                      ? "bg-[var(--admin-green)] text-white shadow-md"
                      : "border border-[var(--admin-beige)]/60 bg-white text-[var(--admin-green-dark)] hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)]"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {STATUS_LABELS[s]}
                  {query.status === s && (
                    <span className="ml-1 text-xs opacity-90">(Current)</span>
                  )}
                </button>
              ))}
            </div>
            {query.resolvedAt && (
              <p className="mt-3 text-xs text-[var(--admin-green)]/60">
                Resolved on {new Date(query.resolvedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="admin-card animate-admin-fade-in-up admin-stagger-4 rounded-2xl p-5 sm:p-6">
            <h3 className="mb-4 font-bold text-[var(--admin-green-dark)]">Timeline</h3>
            <div className="relative space-y-5 pl-2">
              <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-[var(--admin-beige)]" />
              <div className="relative flex gap-4">
                <div className="relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full bg-[var(--admin-green)] ring-4 ring-[var(--admin-green-muted)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--admin-green-dark)]">Query submitted</p>
                  <p className="text-xs text-[var(--admin-green)]/60">
                    {new Date(query.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {query.repliedAt && (
                <div className="relative flex gap-4 animate-admin-fade-in-up">
                  <div className="relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                  <div>
                    <p className="text-sm font-medium text-[var(--admin-green-dark)]">Admin replied</p>
                    <p className="text-xs text-[var(--admin-green)]/60">
                      {new Date(query.repliedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {query.resolvedAt && (
                <div className="relative flex gap-4 animate-admin-fade-in-up">
                  <div className="relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full bg-[var(--admin-beige)] ring-4 ring-[var(--admin-green-muted)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--admin-green-dark)]">
                      Marked as resolved
                    </p>
                    <p className="text-xs text-[var(--admin-green)]/60">
                      {new Date(query.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
