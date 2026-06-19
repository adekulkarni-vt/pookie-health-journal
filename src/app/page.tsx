'use client';

import { Header } from '@/components/Header';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import { Heart, BarChart3, MessageSquare, Award, LogOut } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md text-center">
        <Header
          title="Welcome to Pookie Health Journal"
          description="Sign in to start tracking your health"
        />
        <div className="rounded-lg bg-pastel-pink p-6">
          <p className="mb-4 text-gray-700">You need to sign in to access Pookie.</p>
          <a
            href="/login"
            className="inline-block rounded-lg bg-gradient-to-r from-pastel-pink to-pastel-purple px-6 py-2 font-medium text-gray-900 transition-all hover:shadow-md"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between rounded-lg bg-pastel-blue p-4">
        <div>
          <p className="text-sm text-gray-600">Signed in as</p>
          <p className="font-semibold text-gray-900">
            {user.email || user.user_metadata?.name || 'User'}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

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
