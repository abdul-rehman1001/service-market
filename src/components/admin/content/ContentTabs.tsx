"use client";

import { useState } from "react";
import { FileText, HelpCircle } from "lucide-react";
import ContentEditor from "./ContentEditor";
import FAQManager from "./FAQManager";

const contentPages = [
  { key: "about-us", label: "About Us", icon: FileText },
  { key: "terms", label: "Terms & Conditions", icon: FileText },
  { key: "privacy", label: "Privacy Policy", icon: FileText },
  { key: "faq", label: "FAQ", icon: HelpCircle },
];

export default function ContentTabs() {
  const [activeTab, setActiveTab] = useState(contentPages[0].key);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Tab Headers */}
      <div className="flex border-b overflow-x-auto">
        {contentPages.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                activeTab === tab.key
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-emerald-600 hover:border-slate-300"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "faq" ? (
          <FAQManager />
        ) : (
          <ContentEditor pageKey={activeTab} />
        )}
      </div>
    </div>
  );
}
