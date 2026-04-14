'use client';

import { Suspense } from 'react';
import ChatLayout from '@/components/chat/ChatLayout';
import Header from '@/components/layout/Header';

function ChatContent() {
  return <ChatLayout />;
}

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4">
         
          <Suspense
            fallback={
              <div className="max-w-7xl mx-auto h-[80vh] flex items-center justify-center bg-white rounded-2xl shadow-lg">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 text-sm">Loading...</p>
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
