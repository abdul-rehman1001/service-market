"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, CheckCircle, AlertCircle, Eye, FileEdit } from "lucide-react";

interface ContentEditorProps {
  pageKey: string;
}

const PAGE_TITLES: Record<string, string> = {
  "about-us": "About Us",
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
};

const inputClass =
  "w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-4 py-3 text-sm text-[var(--admin-green-dark)] shadow-sm transition-all duration-200 focus:border-[var(--admin-green)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20";

export default function ContentEditor({ pageKey }: ContentEditorProps) {
  const [body, setBody] = useState("");
  const [originalBody, setOriginalBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [preview, setPreview] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content?page=${pageKey}`);
      if (res.ok) {
        const data = await res.json();
        const text = data.content?.body || "";
        setBody(text);
        setOriginalBody(text);
      }
    } catch (err) {
      console.error("Failed to fetch content:", err);
    } finally {
      setLoading(false);
    }
  }, [pageKey]);

  useEffect(() => {
    fetchContent();
    setStatus("idle");
    setPreview(false);
  }, [fetchContent]);

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pageKey, body }),
      });

      if (res.ok) {
        setOriginalBody(body);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = body !== originalBody;
  const title = PAGE_TITLES[pageKey] || pageKey;

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[var(--admin-green)]" size={32} />
        <p className="text-sm text-[var(--admin-green)]/70">Loading content…</p>
      </div>
    );
  }

  return (
    <div className="animate-admin-fade-in-up space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[var(--admin-green-muted)] p-2.5 text-[var(--admin-green)]">
            <FileEdit size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--admin-green-dark)]">{title}</h3>
            <p className="mt-0.5 text-sm text-[var(--admin-green)]/70">
              Edit the content below. HTML formatting is supported.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className={`inline-flex items-center justify-center gap-1.5 self-start rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
            preview
              ? "border-[var(--admin-green)] bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)]"
              : "border-[var(--admin-beige)] bg-white text-[var(--admin-green-dark)] hover:border-[var(--admin-green)]/40 hover:shadow-sm"
          }`}
        >
          <Eye size={16} />
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <div
          className="admin-card min-h-[280px] rounded-2xl p-4 sm:min-h-[320px] sm:p-6 prose prose-sm max-w-none prose-headings:text-[var(--admin-green-dark)] prose-p:text-[var(--admin-green-dark)]/80"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      ) : (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Enter ${title} content here...`}
          className={`${inputClass} min-h-[280px] resize-y font-mono sm:min-h-[320px]`}
        />
      )}

      <div className="flex flex-col gap-3 border-t border-[var(--admin-beige)]/40 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--admin-green)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[var(--admin-green-dark)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save &amp; Publish
        </button>

        {status === "saved" && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--admin-green)]">
            <CheckCircle size={16} />
            Saved successfully
          </span>
        )}

        {status === "error" && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
            <AlertCircle size={16} />
            Failed to save. Please try again.
          </span>
        )}

        {hasChanges && status === "idle" && (
          <span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 border border-amber-200">
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
}
