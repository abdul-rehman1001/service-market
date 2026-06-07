"use client";

import { useState } from "react";
import { FileText, HelpCircle, Shield, Info } from "lucide-react";
import ContentEditor from "./ContentEditor";
import FAQManager from "./FAQManager";

const contentPages = [
  { key: "about-us", label: "About Us", icon: Info },
  { key: "terms", label: "Terms & Conditions", icon: FileText },
  { key: "privacy", label: "Privacy Policy", icon: Shield },
  { key: "faq", label: "FAQ", icon: HelpCircle },
];

export default function ContentTabs() {
  const [activeTab, setActiveTab] = useState(contentPages[0].key);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)]">
      <div className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
        <div className="flex gap-2 overflow-x-auto p-3 sm:flex-wrap sm:gap-1 sm:overflow-visible sm:px-4 sm:py-3">
          {contentPages.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-[#10B981] text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)]"
                    : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#10B981]/35 hover:bg-[#F5F7F8] hover:text-[#1E3A5F]"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="animate-admin-fade-in-up p-4 sm:p-6 lg:p-8">
        {activeTab === "faq" ? <FAQManager /> : <ContentEditor pageKey={activeTab} />}
      </div>
    </div>
  );
}
