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
    <div className="admin-card overflow-hidden rounded-2xl">
      {/* Tab headers — scrollable pills on mobile, bar on desktop */}
      <div className="border-b border-[var(--admin-beige)]/50 bg-gradient-to-r from-[var(--admin-green-muted)]/40 to-transparent p-3 sm:p-0">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-0 sm:overflow-visible sm:border-b sm:border-[var(--admin-beige)]/50 sm:pb-0">
          {contentPages.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 sm:rounded-none sm:border-b-2 sm:px-5 sm:py-3.5 ${
                  isActive
                    ? "bg-[var(--admin-green)] text-white shadow-md sm:border-[var(--admin-green)] sm:bg-transparent sm:text-[var(--admin-green)] sm:shadow-none"
                    : "bg-white/80 text-[var(--admin-green-dark)]/70 hover:bg-white hover:text-[var(--admin-green)] sm:border-transparent sm:bg-transparent"
                }`}
              >
                <Icon size={16} className={isActive ? "sm:text-[var(--admin-green)]" : ""} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="animate-admin-fade-in-up p-4 sm:p-6">
        {activeTab === "faq" ? <FAQManager /> : <ContentEditor pageKey={activeTab} />}
      </div>
    </div>
  );
}
