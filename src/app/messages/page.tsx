'use client';

import { Suspense } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatLayout from '@/components/chat/ChatLayout';
import Header from '@/components/layout/Header';

function ChatContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatLayout />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden bg-[#F5F7F8] max-md:bg-white">
      <div className="hidden shrink-0 md:block">
        <Header />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden max-md:h-[100dvh] md:py-6">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden max-md:h-full md:mx-auto md:max-w-5xl md:px-4">
          <div className="mb-4 hidden rounded-2xl border border-[#E5E7EB] bg-white p-5 md:block">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/60 text-[#059669]">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#059669]">Messages</p>
                <h1 className="mt-1 text-2xl font-bold text-[#1E3A5F]">Conversations</h1>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Stay connected with providers and track updates for each booking.
                </p>
              </div>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="flex min-h-0 flex-1 items-center justify-center bg-white md:rounded-2xl md:border md:border-[#E5E7EB] md:h-[76dvh] md:flex-none">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#10B981]" />
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
