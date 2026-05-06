"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, Loader2, Mail, MessageSquare, PhoneCall, Send, ShieldCheck, Ticket } from "lucide-react";
import { useSearchParams } from "next/navigation";

type QueryType = "GENERAL" | "SERVICE_ISSUE" | "PAYMENT" | "BOOKING" | "ACCOUNT" | "OTHER";

const QUERY_TYPES: Array<{ value: QueryType; label: string; description: string }> = [
  { value: "GENERAL", label: "General", description: "General support or account questions" },
  { value: "BOOKING", label: "Booking", description: "Questions about a booking or schedule" },
  { value: "SERVICE_ISSUE", label: "Service Issue", description: "Problems with a service or provider" },
  { value: "PAYMENT", label: "Payment", description: "Billing, pricing, or payment questions" },
  { value: "ACCOUNT", label: "Account", description: "Login, profile, or verification help" },
  { value: "OTHER", label: "Other", description: "Anything else you want to report" },
];

export default function QuerySupportPage() {
  const searchParams = useSearchParams();
  const initialBookingId = useMemo(() => searchParams.get("bookingId") || "", [searchParams]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [bookingId, setBookingId] = useState(initialBookingId);
  const [queryType, setQueryType] = useState<QueryType>("GENERAL");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setBookingId(initialBookingId);
  }, [initialBookingId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          queryType,
          bookingId: bookingId.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit query");
      }

      setStatus({
        type: "success",
        message: `Your query ${data?.query?.queryNumber || ""} has been submitted successfully.`,
      });
      setSubject("");
      setMessage("");
      setBookingId(initialBookingId);
      setQueryType("GENERAL");
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to submit query",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <MessageSquare className="h-3.5 w-3.5" />
              Contact Support
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Ask a question, report an issue, or send a complaint.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Use this form to submit a support query from your account. The admin team will review it from the Query & Complaint Management panel and reply through email when needed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Ticket className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">What you can submit</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Booking issues, service complaints, payment questions, account support, verification concerns, or general help.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Clock3 className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Send the details once and the support team can track it from the admin dashboard using the query number.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Main purpose</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This is the official support intake point for users. It keeps questions organized and visible to admins.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Need help fast?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                If your issue is booking-related, include the booking ID to help the team find it faster.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">Submit a query</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Signed-in users can submit requests here. If you are not logged in, the form will ask you to sign in before submission.
          </p>

          {status && (
            <div
              className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Query Type</label>
              <select
                value={queryType}
                onChange={(event) => setQueryType(event.target.value as QueryType)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {QUERY_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">
                {QUERY_TYPES.find((option) => option.value === queryType)?.description}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Briefly describe your issue"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Booking ID (optional)</label>
              <input
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                placeholder="Paste a booking ID if your query is about a booking"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Add all relevant details so the admin team can understand your issue"
                rows={7}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting..." : "Submit Query"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            <p className="font-medium text-slate-800">Before you submit</p>
            <p className="mt-1">
              Queries are stored in the admin panel and reviewed by the support team. Replies may be sent to your registered email address.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-slate-500">
              <span className="inline-flex items-center gap-2"><PhoneCall className="h-4 w-4" /> Support via email</span>
              <span className="inline-flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Admin-managed inbox</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
