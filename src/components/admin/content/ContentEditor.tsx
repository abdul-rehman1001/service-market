"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, CheckCircle, AlertCircle, Eye } from "lucide-react";

interface ContentEditorProps {
  pageKey: string;
}

const PAGE_TITLES: Record<string, string> = {
  "about-us": "About Us",
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
};

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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-600" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">
            Edit the content below. HTML formatting is supported.
          </p>
        </div>
        <button
          onClick={() => setPreview(!preview)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition ${
            preview
              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
              : "border-slate-300 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Eye size={14} />
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div
          className="w-full min-h-[320px] p-4 border rounded-lg bg-slate-50 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      ) : (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Enter ${title} content here...`}
          className="w-full h-80 p-4 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono resize-y"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save &amp; Publish
        </button>

        {status === "saved" && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle size={16} />
            Saved successfully
          </span>
        )}

        {status === "error" && (
          <span className="flex items-center gap-1.5 text-sm text-red-500">
            <AlertCircle size={16} />
            Failed to save. Please try again.
          </span>
        )}

        {hasChanges && status === "idle" && (
          <span className="text-xs text-amber-600">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}
