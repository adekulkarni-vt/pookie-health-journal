/**
 * Database type definitions
 * These types represent the structure of Supabase database tables
 * Placeholder - to be expanded with actual schema
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          username: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          avatar_url?: string | null;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          date: string;
          content: string | null;
          mood: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          date: string;
          content?: string | null;
          mood?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          date?: string;
          content?: string | null;
          mood?: string | null;
        };
      };
      symptom_entries: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          date: string;
          symptom: string;
          severity: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          date: string;
          symptom: string;
          severity: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          date?: string;
          symptom?: string;
          severity?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
