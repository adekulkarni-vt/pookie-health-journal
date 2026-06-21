'use client';

import { Header } from '@/components/Header';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import { Award, Trophy, Sparkles } from 'lucide-react';

export default function WinsPage() {
  return (
    <div>
      <Header
        title="Celebrate Wins"
        description="Track your health victories and milestones"
      />

      <div className="grid gap-6">
        <PlaceholderCard
          title="Your Achievements"
          description="View all your recorded health wins and milestones"
          icon={<Trophy className="h-8 w-8 text-yellow-400" />}
          color="yellow"
        />

        <div className="grid gap-6 md:grid-cols-2">
          <PlaceholderCard
            title="Record a Win"
            description="Celebrate your health victories"
            icon={<Award className="h-8 w-8 text-pink-400" />}
            color="pink"
          />

          <PlaceholderCard
            title="Streaks"
            description="Track your consistency and streaks"
            icon={<Sparkles className="h-8 w-8 text-purple-400" />}
            color="purple"
          />
        </div>
      </div>

      <div className="mt-12 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-600">
          Wins tracking features will be implemented here
        </p>
      </div>
    </div>
  );
}
