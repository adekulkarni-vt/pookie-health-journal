export type UserProfile = {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export const MOOD_VALUES = [
  'happy', 'good', 'neutral', 'anxious', 'stressed', 'sad', 'frustrated', 'tired',
] as const;

export type Mood = (typeof MOOD_VALUES)[number];

export type JournalEntry = {
  id: string;
  user_id: string | null;
  created_at: string;
  journal_text: string;
  sleep_hours: number | null;
  weight: number | null;
  stress_level: number | null;
  day_rating: number | null;
  mood: Mood | null;
  ai_title: string | null;
  ai_summary: string | null;
  severity: number | null;
  photos?: EntryPhoto[];
};

export type EntryPhoto = {
  id: string;
  entry_id: string;
  url: string;
  created_at: string;
};

export type SymptomEntry = {
  id: string;
  user_id: string;
  date: string;
  symptom: string;
  severity: number;
  created_at: string;
  updated_at: string;
};

export type GastritisFlareEntry = {
  id: string;
  user_id: string;
  date: string;
  severity: number;
  triggers?: string[];
  relief_measures?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
