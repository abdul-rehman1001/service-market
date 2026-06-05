'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'services', label: 'Services' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'reviews', label: 'Reviews' },
];

export default function ProviderTabs({ activeTab, onTabChange }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="sticky top-16 z-30 -mx-4 border-b border-[#E2E8F0]/80 bg-[#EFFAF6]/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:top-[4.5rem] lg:px-8">
      <nav
        className="flex gap-1 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Provider profile sections"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative shrink-0 rounded-t-xl px-4 py-3 text-sm font-semibold transition-colors sm:px-5 sm:text-base ${
                isActive ? 'text-[#059669]' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId={reduceMotion ? undefined : 'provider-tab-indicator'}
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
