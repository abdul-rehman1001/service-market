"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

const inputClass =
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] shadow-sm transition-all duration-200 focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20";

export default function FAQManager() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authenticatedFetch("/api/admin/faq", { cache: "no-store" });

      if (res.status === 401) {
        router.push("/login?next=/admin/content");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs);
      } else {
        setError("Failed to load FAQs");
      }
    } catch {
      setError("Failed to load FAQs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const showStatus = (type: "success" | "error", message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  };

  const authFetchOrRedirect = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await authenticatedFetch(input, init);
    if (res.status === 401) {
      router.push("/login?next=/admin/content");
    }
    return res;
  };

  const handleAdd = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setSaving(true);
    try {
      const res = await authFetchOrRedirect("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion.trim(), answer: newAnswer.trim() }),
      });
      if (res.status === 401) return;
      if (res.ok) {
        setNewQuestion("");
        setNewAnswer("");
        setShowAddForm(false);
        showStatus("success", "FAQ added successfully");
        await fetchFAQs();
      } else {
        showStatus("error", "Failed to add FAQ");
      }
    } catch {
      showStatus("error", "Failed to add FAQ");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuestion("");
    setEditAnswer("");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editQuestion.trim() || !editAnswer.trim()) return;
    setSaving(true);
    try {
      const res = await authFetchOrRedirect(`/api/admin/faq/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editQuestion.trim(),
          answer: editAnswer.trim(),
        }),
      });
      if (res.status === 401) return;
      if (res.ok) {
        cancelEdit();
        showStatus("success", "FAQ updated successfully");
        await fetchFAQs();
      } else {
        showStatus("error", "Failed to update FAQ");
      }
    } catch {
      showStatus("error", "Failed to update FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    setDeletingId(id);
    try {
      const res = await authFetchOrRedirect(`/api/admin/faq/${id}`, { method: "DELETE" });
      if (res.status === 401) return;
      if (res.ok) {
        showStatus("success", "FAQ deleted successfully");
        await fetchFAQs();
      } else {
        showStatus("error", "Failed to delete FAQ");
      }
    } catch {
      showStatus("error", "Failed to delete FAQ");
    } finally {
      setDeletingId(null);
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const faq = faqs[index];
    const prev = faqs[index - 1];
    try {
      const [res1, res2] = await Promise.all([
        authFetchOrRedirect(`/api/admin/faq/${faq.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: prev.order }),
        }),
        authFetchOrRedirect(`/api/admin/faq/${prev.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: faq.order }),
        }),
      ]);
      if (res1.status === 401 || res2.status === 401) return;
      await fetchFAQs();
    } catch {
      showStatus("error", "Failed to reorder");
    }
  };

  const moveDown = async (index: number) => {
    if (index >= faqs.length - 1) return;
    const faq = faqs[index];
    const next = faqs[index + 1];
    try {
      const [res1, res2] = await Promise.all([
        authFetchOrRedirect(`/api/admin/faq/${faq.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: next.order }),
        }),
        authFetchOrRedirect(`/api/admin/faq/${next.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: faq.order }),
        }),
      ]);
      if (res1.status === 401 || res2.status === 401) return;
      await fetchFAQs();
    } catch {
      showStatus("error", "Failed to reorder");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB]">
        <Loader2 className="animate-spin text-[#10B981]" size={32} />
        <p className="text-sm text-[#6B7280]">Loading FAQs…</p>
      </div>
    );
  }

  return (
    <div className="animate-admin-fade-in-up space-y-5">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
          <p className="text-sm text-[#EF4444]">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1E3A5F]">FAQ Management</h3>
            <p className="text-sm text-[#6B7280]">
              {faqs.length} question{faqs.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className={`inline-flex items-center justify-center gap-2 self-start rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
            showAddForm
              ? "border border-[#E5E7EB] bg-white text-[#374151] shadow-sm hover:bg-[#F5F7F8]"
              : "bg-[#10B981] text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)]"
          }`}
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? "Cancel" : "Add FAQ"}
        </button>
      </div>

      {status && (
        <div
          className={`animate-admin-fade-in-up flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
            status.type === "success"
              ? "border-[#BBF7D0] bg-[#D1FAE5] text-[#059669]"
              : "border-[#FECACA] bg-[#FEF2F2] text-[#EF4444]"
          }`}
        >
          {status.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {status.message}
        </div>
      )}

      {showAddForm && (
        <div className="animate-admin-scale-in space-y-3 rounded-2xl border-2 border-[#10B981]/25 bg-white p-4 shadow-[0_4px_20px_rgba(16,185,129,0.08)] sm:p-5">
          <p className="text-sm font-bold text-[#1E3A5F]">New FAQ</p>
          <input
            type="text"
            placeholder="Question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className={inputClass}
          />
          <textarea
            placeholder="Answer"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            rows={3}
            className={`${inputClass} resize-y`}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving || !newQuestion.trim() || !newAnswer.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all hover:bg-[#059669] disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add FAQ
          </button>
        </div>
      )}

      {faqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white py-12 text-center shadow-sm">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
            <HelpCircle size={28} />
          </div>
          <p className="font-semibold text-[#1E3A5F]">No FAQs yet</p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Click &quot;Add FAQ&quot; to create your first question.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="animate-admin-fade-in-up rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:border-[#10B981]/30 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)] sm:p-5"
              style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
            >
              {editingId === faq.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    className={`${inputClass} font-medium`}
                  />
                  <textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-y`}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#10B981] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#059669] disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6]"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <div className="flex items-start gap-2 sm:flex-col sm:items-center">
                    <GripVertical size={14} className="hidden text-[#D1D5DB] sm:block" />
                    <div className="flex gap-1 sm:flex-col">
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#F5F7F8] disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(index)}
                        disabled={index === faqs.length - 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#F5F7F8] disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111827]">
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg border border-[#D1FAE5] bg-[#D1FAE5]/50 text-xs font-bold text-[#059669]">
                        {index + 1}
                      </span>
                      {faq.question}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap pl-0 text-sm text-[#6B7280] sm:pl-8">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 sm:items-start">
                    <button
                      type="button"
                      onClick={() => startEdit(faq)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#059669] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#D1FAE5]/40 hover:shadow-md"
                      title="Edit FAQ"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(faq.id)}
                      disabled={deletingId === faq.id}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-[#EF4444] transition-all hover:bg-[#FEE2E2] disabled:opacity-50"
                      title="Delete FAQ"
                    >
                      {deletingId === faq.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
