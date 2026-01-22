"use client";

import { useState } from "react";

interface ContentEditorProps {
  section: string;
}

export default function ContentEditor({ section }: ContentEditorProps) {
  const [content, setContent] = useState(
    `This is the editable content for ${section}.`
  );

  const handleSave = () => {
    alert(`Content for "${section}" saved successfully!`);
    // Here you can connect to your backend API
  };

  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-64 p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <button
        onClick={handleSave}
        className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700"
      >
        Save & Publish
      </button>
    </div>
  );
}
