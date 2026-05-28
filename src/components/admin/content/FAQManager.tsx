"use client";

import { useState, useEffect, useCallback } from "react";
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

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

const inputClass =
  "w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-3 py-2.5 text-sm text-[var(--admin-green-dark)] shadow-sm transition-all duration-200 focus:border-[var(--admin-green)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20";

export default function FAQManager() {
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

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faq");
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs);
      }
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const showStatus = (type: "success" | "error", message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleAdd = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion.trim(), answer: newAnswer.trim() }),
      });
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
      const res = await fetch(`/api/admin/faq/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editQuestion.trim(),
          answer: editAnswer.trim(),
        }),
      });
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
      const res = await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
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
      await Promise.all([
        fetch(`/api/admin/faq/${faq.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: prev.order }),
        }),
        fetch(`/api/admin/faq/${prev.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: faq.order }),
        }),
      ]);
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
      await Promise.all([
        fetch(`/api/admin/faq/${faq.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: next.order }),
        }),
        fetch(`/api/admin/faq/${next.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: faq.order }),
        }),
      ]);
      await fetchFAQs();
    } catch {
      showStatus("error", "Failed to reorder");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[var(--admin-green)]" size={32} />
        <p className="text-sm text-[var(--admin-green)]/70">Loading FAQs…</p>
      </div>
    );
  }

  return (
    <div className="animate-admin-fade-in-up space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[var(--admin-green-muted)] p-2.5 text-[var(--admin-green)]">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--admin-green-dark)]">FAQ Management</h3>
            <p className="text-sm text-[var(--admin-green)]/70">
              {faqs.length} question{faqs.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[var(--admin-green)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--admin-green-dark)] hover:shadow-lg"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? "Cancel" : "Add FAQ"}
        </button>
      </div>

      {status && (
        <div
          className={`animate-admin-fade-in-up flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium ${
            status.type === "success"
              ? "border-[var(--admin-beige)] bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)]"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {status.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {status.message}
        </div>
      )}

      {showAddForm && (
        <div className="admin-card animate-admin-scale-in space-y-3 rounded-2xl border-2 border-[var(--admin-green)]/20 p-4 sm:p-5">
          <p className="text-sm font-semibold text-[var(--admin-green-dark)]">New FAQ</p>
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
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--admin-green)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--admin-green-dark)] disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add FAQ
          </button>
        </div>
      )}

      {faqs.length === 0 ? (
        <div className="admin-card flex flex-col items-center justify-center rounded-2xl py-12 text-center">
          <div className="mb-3 rounded-2xl bg-[var(--admin-green-muted)] p-4 text-[var(--admin-green)]">
            <HelpCircle size={28} />
          </div>
          <p className="font-semibold text-[var(--admin-green-dark)]">No FAQs yet</p>
          <p className="mt-1 text-sm text-[var(--admin-green)]/60">
            Click &quot;Add FAQ&quot; to create your first question.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="admin-card animate-admin-fade-in-up rounded-2xl p-4 transition-all duration-200 hover:shadow-md sm:p-5"
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
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--admin-green)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--admin-green-dark)] disabled:opacity-50"
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
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--admin-beige)] px-3 py-1.5 text-sm font-medium text-[var(--admin-green-dark)] hover:bg-[var(--admin-green-muted)]"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <div className="flex items-start gap-2 sm:flex-col sm:items-center">
                    <GripVertical size={14} className="hidden text-[var(--admin-green)]/30 sm:block" />
                    <div className="flex gap-1 sm:flex-col">
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-beige)] bg-white text-[var(--admin-green-dark)] transition-all hover:border-[var(--admin-green)] disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(index)}
                        disabled={index === faqs.length - 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-beige)] bg-white text-[var(--admin-green-dark)] transition-all hover:border-[var(--admin-green)] disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--admin-green-dark)]">
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--admin-green-muted)] text-xs font-bold text-[var(--admin-green)]">
                        {index + 1}
                      </span>
                      {faq.question}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--admin-green-dark)]/75 pl-0 sm:pl-8">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 sm:items-start">
                    <button
                      type="button"
                      onClick={() => startEdit(faq)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-beige)]/60 bg-white text-[var(--admin-green)] transition-all hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)]"
                      title="Edit FAQ"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(faq.id)}
                      disabled={deletingId === faq.id}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
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
