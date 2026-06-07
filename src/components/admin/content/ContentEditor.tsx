"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle, AlertCircle, Eye, FileEdit, Code2, Type } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

type EditMode = "visual" | "html" | "preview";

interface ContentEditorProps {
  pageKey: string;
}

const PAGE_TITLES: Record<string, string> = {
  "about-us": "About Us",
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
};

const inputClass =
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] shadow-sm transition-all duration-200 focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20";

export default function ContentEditor({ pageKey }: ContentEditorProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [originalBody, setOriginalBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>("visual");

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authenticatedFetch(`/api/admin/content?page=${pageKey}`, {
        cache: "no-store",
      });

      if (res.status === 401) {
        router.push("/login?next=/admin/content");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const text = data.content?.body || "";
        setBody(text);
        setOriginalBody(text);
      } else {
        setError("Failed to load content");
      }
    } catch {
      setError("Failed to load content. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pageKey, router]);

  useEffect(() => {
    fetchContent();
    setStatus("idle");
    setEditMode("visual");
  }, [fetchContent]);

  const modeButtonClass = (mode: EditMode) =>
    `inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
      editMode === mode
        ? "border-[#10B981] bg-[#D1FAE5]/60 text-[#059669] shadow-sm"
        : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#10B981]/35 hover:bg-[#F5F7F8] hover:text-[#1E3A5F]"
    }`;

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    setError(null);
    try {
      const res = await authenticatedFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pageKey, body }),
      });

      if (res.status === 401) {
        router.push("/login?next=/admin/content");
        return;
      }

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
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB]">
        <Loader2 className="animate-spin text-[#10B981]" size={32} />
        <p className="text-sm text-[#6B7280]">Loading content…</p>
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

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
            <FileEdit size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1E3A5F]">{title}</h3>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Write in plain language using the visual editor, or switch to HTML for advanced edits.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <button type="button" onClick={() => setEditMode("visual")} className={modeButtonClass("visual")}>
            <Type size={16} />
            Edit
          </button>
          <button type="button" onClick={() => setEditMode("html")} className={modeButtonClass("html")}>
            <Code2 size={16} />
            HTML
          </button>
          <button type="button" onClick={() => setEditMode("preview")} className={modeButtonClass("preview")}>
            <Eye size={16} />
            Preview
          </button>
        </div>
      </div>

      {editMode === "preview" ? (
        <div
          className="min-h-[280px] rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:min-h-[320px] sm:p-6 prose prose-sm max-w-none prose-headings:text-[#1E3A5F] prose-p:text-[#374151]"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      ) : editMode === "html" ? (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Enter ${title} HTML here...`}
          className={`${inputClass} min-h-[280px] resize-y font-mono sm:min-h-[320px]`}
        />
      ) : (
        <RichTextEditor
          value={body}
          onChange={setBody}
          placeholder={`Write ${title} content here — use the toolbar for headings, lists, and links.`}
        />
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:p-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all duration-200 hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save &amp; Publish
        </button>

        {status === "saved" && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#059669]">
            <CheckCircle size={16} />
            Saved successfully
          </span>
        )}

        {status === "error" && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#EF4444]">
            <AlertCircle size={16} />
            Failed to save. Please try again.
          </span>
        )}

        {hasChanges && status === "idle" && (
          <span className="inline-flex items-center rounded-full border border-[#FED7AA] bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#B45309]">
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
}
