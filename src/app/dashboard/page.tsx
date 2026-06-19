'use client';

import { Header } from '@/components/Header';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <Header
        title="Dashboard"
        description="Visualize your health patterns and trends"
      />

      <div className="grid gap-6">
        <PlaceholderCard
          title="Symptom Trends"
          description="View your symptom patterns over time"
          icon={<TrendingUp className="h-8 w-8 text-blue-400" />}
          color="blue"
        />

        <div className="grid gap-6 md:grid-cols-2">
          <PlaceholderCard
            title="Gastritis Flares"
            description="Track gastritis episodes and patterns"
            icon={<BarChart3 className="h-8 w-8 text-red-400" />}
            color="pink"
          />

          <PlaceholderCard
            title="Monthly Overview"
            description="See your health metrics at a glance"
            icon={<Calendar className="h-8 w-8 text-purple-400" />}
            color="purple"
          />
        </div>
      </div>

      <div className="mt-12 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-600">
          Dashboard visualizations will be implemented here
        </p>
      </div>
    </div>
  );
}
