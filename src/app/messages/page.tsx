'use client';

import { Suspense } from 'react';
import ChatLayout from '@/components/chat/ChatLayout';
import Header from '@/components/layout/Header';

function ChatContent() {
  return <ChatLayout />;
}

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <Header />
      <div className="py-4 sm:py-6">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="mb-4 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-4 shadow-[0_10px_28px_-24px_rgba(31,41,55,0.6)] sm:px-5 sm:py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#009966]">Messages</p>
            <h1 className="mt-1 text-xl font-bold text-[#1F2937] sm:text-2xl">Conversations</h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Stay connected with providers and track updates for each booking.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="mx-auto flex h-[76vh] items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_20px_45px_-30px_rgba(31,41,55,0.55)]">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#009966]" />
                  <p className="text-sm text-[#6B7280]">Loading...</p>
                </div>
              </div>
            }
          >
            <ChatContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
