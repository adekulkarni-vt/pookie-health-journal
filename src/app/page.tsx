'use client';

import { Header } from '@/components/Header';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import { Heart, BarChart3, MessageSquare, Award } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <Header
        title="Welcome to Pookie Health Journal"
        description="Your personal health companion for tracking, insights, and wins"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PlaceholderCard
          title="Journal"
          description="Track your daily health journey with personalized journaling"
          icon={<Heart className="h-8 w-8 text-red-400" />}
          color="pink"
        />
        <PlaceholderCard
          title="Dashboard"
          description="Visualize your health patterns and trends over time"
          icon={<BarChart3 className="h-8 w-8 text-blue-400" />}
          color="blue"
        />
        <PlaceholderCard
          title="Ask Pookie"
          description="Chat with AI for personalized health insights"
          icon={<MessageSquare className="h-8 w-8 text-purple-400" />}
          color="purple"
        />
        <PlaceholderCard
          title="Celebrate Wins"
          description="Track your health victories and milestones"
          icon={<Award className="h-8 w-8 text-yellow-400" />}
          color="green"
        />
      </div>

      <div className="mt-12 rounded-lg bg-gradient-to-r from-pastel-pink to-pastel-purple p-8 text-center">
        <h2 className="mb-3 text-2xl font-bold text-gray-900">
          Coming Soon
        </h2>
        <p className="text-gray-700">
          Pookie Health Journal is being prepared with care. Features will be launched soon!
        </p>
      </div>
    </div>
  );
}
