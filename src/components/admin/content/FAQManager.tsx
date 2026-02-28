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
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

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
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

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

  // ── Add FAQ ──────────────────────────────────────────────────────
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

  // ── Edit FAQ ─────────────────────────────────────────────────────
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

  // ── Delete FAQ ───────────────────────────────────────────────────
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

  // ── Reorder FAQ ──────────────────────────────────────────────────
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-600" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            FAQ Management
          </h3>
          <p className="text-sm text-slate-500">
            {faqs.length} question{faqs.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? "Cancel" : "Add FAQ"}
        </button>
      </div>

      {/* Status message */}
      {status && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {status.message}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/50 space-y-3">
          <input
            type="text"
            placeholder="Question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <textarea
            placeholder="Answer"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newQuestion.trim() || !newAnswer.trim()}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Add FAQ
          </button>
        </div>
      )}

      {/* FAQ List */}
      {faqs.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg mb-1">No FAQs yet</p>
          <p className="text-sm">Click &quot;Add FAQ&quot; to create your first question.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="border rounded-lg p-4 bg-white hover:shadow-sm transition"
            >
              {editingId === faq.id ? (
                // Edit mode
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border hover:bg-slate-50"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex gap-3">
                  {/* Reorder buttons */}
                  <div className="flex flex-col items-center gap-0.5 pt-1">
                    <GripVertical size={14} className="text-slate-300 mb-1" />
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ChevronUp size={14} className="text-slate-500" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === faqs.length - 1}
                      className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ChevronDown size={14} className="text-slate-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm">
                      <span className="text-slate-400 mr-2">Q{index + 1}.</span>
                      {faq.question}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-1">
                    <button
                      onClick={() => startEdit(faq)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                      title="Edit FAQ"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      disabled={deletingId === faq.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition disabled:opacity-50"
                      title="Delete FAQ"
                    >
                      {deletingId === faq.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
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
