"use client";

import { useState } from "react";
import ContentEditor from "./ContentEditor";

const sections = ["About Us", "Terms & Conditions", "Privacy Policy", "FAQ"];

export default function ContentTabs() {
  const [active, setActive] = useState(sections[0]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex space-x-4 border-b mb-4">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActive(section)}
            className={`py-2 px-4 font-medium ${
              active === section
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      <ContentEditor section={active} />
    </div>
  );
}
