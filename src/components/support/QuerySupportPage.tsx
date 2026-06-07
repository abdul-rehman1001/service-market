"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MessageSquare,
  PhoneCall,
  Send,
  ShieldCheck,
  Ticket,
} from "lucide-react";
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

const INPUT_CLASS =
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] hover:border-[#10B981]/30 focus:border-[#10B981] focus:ring-4 focus:ring-[#D1FAE5]";

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
    <section className="min-h-[60vh] bg-[#F5F7F8] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-[0_4px_24px_rgba(17,24,39,0.06)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D1FAE5] bg-[#D1FAE5]/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#059669]">
              <MessageSquare className="h-3.5 w-3.5" />
              Contact Support
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#1E3A5F] md:text-4xl">
              Ask a question, report an issue, or send a complaint.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B7280]">
              Use this form to submit a support query from your account. The admin team will review it from the Query & Complaint Management panel and reply through email when needed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Ticket,
                title: "What you can submit",
                text: "Booking issues, service complaints, payment questions, account support, verification concerns, or general help.",
              },
              {
                icon: Clock3,
                title: "How it works",
                text: "Send the details once and the support team can track it from the admin dashboard using the query number.",
              },
              {
                icon: ShieldCheck,
                title: "Main purpose",
                text: "This is the official support intake point for users. It keeps questions organized and visible to admins.",
              },
              {
                icon: Mail,
                title: "Need help fast?",
                text: "If your issue is booking-related, include the booking ID to help the team find it faster.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_12px_rgba(17,24,39,0.04)] transition-all duration-200 hover:border-[#10B981]/25 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)]"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/40 text-[#059669]">
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-[#111827]">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_4px_24px_rgba(17,24,39,0.06)] lg:sticky lg:top-24 lg:self-start lg:p-8">
          <h2 className="text-2xl font-bold text-[#1E3A5F]">Submit a query</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Signed-in users can submit requests here. If you are not logged in, the form will ask you to sign in before submission.
          </p>

          {status && (
            <div
              className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                status.type === "success"
                  ? "border-[#D1FAE5] bg-[#D1FAE5]/40 text-[#059669]"
                  : "border-[#FECACA] bg-[#FEF2F2] text-[#EF4444]"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">Query Type</label>
              <select
                value={queryType}
                onChange={(event) => setQueryType(event.target.value as QueryType)}
                className={INPUT_CLASS}
              >
                {QUERY_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-[#6B7280]">
                {QUERY_TYPES.find((option) => option.value === queryType)?.description}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">Subject</label>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Briefly describe your issue"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">Booking ID (optional)</label>
              <input
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                placeholder="Paste a booking ID if your query is about a booking"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111827]">Message</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Add all relevant details so the admin team can understand your issue"
                rows={7}
                className={INPUT_CLASS}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-[#059669] hover:shadow-[0_6px_24px_rgba(16,185,129,0.4)] focus:outline-none focus:ring-4 focus:ring-[#D1FAE5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting..." : "Submit Query"}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-sm leading-6 text-[#6B7280]">
            <p className="font-semibold text-[#111827]">Before you submit</p>
            <p className="mt-1">
              Queries are stored in the admin panel and reviewed by the support team. Replies may be sent to your registered email address.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-[#6B7280]">
              <span className="inline-flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-[#10B981]" /> Support via email
              </span>
              <span className="inline-flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#10B981]" /> Admin-managed inbox
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
