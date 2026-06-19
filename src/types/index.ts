/**
 * Shared type definitions for the Pookie Health Journal application
 */

export type UserProfile = {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  date: string;
  content?: string;
  mood?: string;
  created_at: string;
  updated_at: string;
};

export type SymptomEntry = {
  id: string;
  user_id: string;
  date: string;
  symptom: string;
  severity: number; // 1-10
  created_at: string;
  updated_at: string;
};

export type GastritisFlareEntry = {
  id: string;
  user_id: string;
  date: string;
  severity: number; // 1-10
  triggers?: string[];
  relief_measures?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
};

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
