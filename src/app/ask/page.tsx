'use client';

import { Header } from '@/components/Header';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import { MessageSquare, Lightbulb, Zap } from 'lucide-react';

export default function AskPage() {
  return (
    <div>
      <Header
        title="Ask Pookie"
        description="Chat with AI for personalized health insights"
      />

      <div className="grid gap-6">
        <PlaceholderCard
          title="Health Insights"
          description="Get AI-powered insights based on your journal entries"
          icon={<Lightbulb className="h-8 w-8 text-yellow-400" />}
          color="yellow"
        />

        <div className="grid gap-6 md:grid-cols-2">
          <PlaceholderCard
            title="Ask Questions"
            description="Chat interface for personalized conversations"
            icon={<MessageSquare className="h-8 w-8 text-blue-400" />}
            color="blue"
          />

          <PlaceholderCard
            title="Quick Tips"
            description="Get wellness recommendations"
            icon={<Zap className="h-8 w-8 text-purple-400" />}
            color="purple"
          />
        </div>
      </div>

      <div className="mt-12 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-600">
          Chat interface will be implemented here
        </p>
      </div>
    </div>
  );
}
