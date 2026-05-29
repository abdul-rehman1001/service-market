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
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--admin-green-dark)]/70 transition-colors hover:border-[var(--admin-beige)] hover:bg-white hover:text-[var(--admin-green-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20 disabled:opacity-40";

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
    <div className="admin-card overflow-hidden rounded-2xl border border-[var(--admin-beige)]/60">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--admin-beige)]/50 bg-[var(--admin-green-muted)]/30 px-2 py-2">
        <button type="button" className={toolbarBtn} title="Bold" onClick={() => runCommand("bold")}>
          <Bold size={16} />
        </button>
        <button type="button" className={toolbarBtn} title="Italic" onClick={() => runCommand("italic")}>
          <Italic size={16} />
        </button>
        <button type="button" className={toolbarBtn} title="Underline" onClick={() => runCommand("underline")}>
          <Underline size={16} />
        </button>
        <span className="mx-1 h-5 w-px bg-[var(--admin-beige)]/80" aria-hidden />
        <button type="button" className={toolbarBtn} title="Heading 2" onClick={() => runCommand("formatBlock", "h2")}>
          <Heading2 size={16} />
        </button>
        <button type="button" className={toolbarBtn} title="Heading 3" onClick={() => runCommand("formatBlock", "h3")}>
          <Heading3 size={16} />
        </button>
        <button type="button" className={toolbarBtn} title="Paragraph" onClick={() => runCommand("formatBlock", "p")}>
          <Pilcrow size={16} />
        </button>
        <span className="mx-1 h-5 w-px bg-[var(--admin-beige)]/80" aria-hidden />
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
        className={`rich-text-editor prose prose-sm max-w-none px-4 py-4 text-[var(--admin-green-dark)]/90 focus:outline-none prose-headings:text-[var(--admin-green-dark)] prose-p:text-[var(--admin-green-dark)]/80 sm:px-6 sm:py-5 ${minHeightClass}`}
      />
    </div>
  );
}
