"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Heading2,
  Heading3,
  Pilcrow,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeightClass?: string;
}

const toolbarBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[#6B7280] transition-all hover:border-[#E5E7EB] hover:bg-white hover:text-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 disabled:opacity-40";

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing your content here…",
  minHeightClass = "min-h-[280px] sm:min-h-[320px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const skipExternalSync = useRef(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || skipExternalSync.current) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const syncFromEditor = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    skipExternalSync.current = true;
    onChange(el.innerHTML);
    requestAnimationFrame(() => {
      skipExternalSync.current = false;
    });
  }, [onChange]);

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    syncFromEditor();
  };

  const handleLink = () => {
    const url = window.prompt("Enter the link URL:");
    if (!url?.trim()) return;
    runCommand("createLink", url.trim());
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)]">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#E5E7EB] bg-[#F9FAFB] px-2 py-2 sm:px-3">
        <button type="button" className={toolbarBtn} title="Bold" onClick={() => runCommand("bold")}>
          <Bold size={16} />
        </button>
        <button type="button" className={toolbarBtn} title="Italic" onClick={() => runCommand("italic")}>
          <Italic size={16} />
        </button>
        <button type="button" className={toolbarBtn} title="Underline" onClick={() => runCommand("underline")}>
          <Underline size={16} />
        </button>
        <span className="mx-1 h-5 w-px bg-[#E5E7EB]" aria-hidden />
        <button type="button" className={toolbarBtn} title="Heading 2" onClick={() => runCommand("formatBlock", "h2")}>
          <Heading2 size={16} />
        </button>
        <button type="button" className={toolbarBtn} title="Heading 3" onClick={() => runCommand("formatBlock", "h3")}>
          <Heading3 size={16} />
        </button>
        <button type="button" className={toolbarBtn} title="Paragraph" onClick={() => runCommand("formatBlock", "p")}>
          <Pilcrow size={16} />
        </button>
        <span className="mx-1 h-5 w-px bg-[#E5E7EB]" aria-hidden />
        <button
          type="button"
          className={toolbarBtn}
          title="Bullet list"
          onClick={() => runCommand("insertUnorderedList")}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          title="Numbered list"
          onClick={() => runCommand("insertOrderedList")}
        >
          <ListOrdered size={16} />
        </button>
        <button type="button" className={toolbarBtn} title="Insert link" onClick={handleLink}>
          <Link2 size={16} />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline
        aria-label={placeholder}
        onInput={syncFromEditor}
        onBlur={syncFromEditor}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={`rich-text-editor prose prose-sm max-w-none px-4 py-4 text-[#374151] focus:outline-none prose-headings:text-[#1E3A5F] prose-p:text-[#374151] sm:px-6 sm:py-5 ${minHeightClass}`}
      />
    </div>
  );
}
