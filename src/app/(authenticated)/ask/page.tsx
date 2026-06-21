'use client';

import { Header } from '@/components/Header';
import { ChatBox } from '@/components/ChatBox';

export default function AskPage() {
  return (
    <div>
      <Header
        title="Ask Pookie"
        description="Chat with AI for personalized health insights"
      />

      <div className="mx-auto max-w-2xl">
        <ChatBox />
      </div>
    </div>
  );
}
