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
      entries: {
        Row: {
          id: string;
          user_id: string | null;
          created_at: string;
          entry_date: string;
          journal_text: string;
          sleep_hours: number | null;
          weight: number | null;
          stress_level: number | null;
          day_rating: number | null;
          mood: string | null;
          ai_title: string | null;
          ai_summary: string | null;
          severity: number | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          created_at?: string;
          entry_date?: string;
          journal_text: string;
          sleep_hours?: number | null;
          weight?: number | null;
          stress_level?: number | null;
          day_rating?: number | null;
          mood?: string | null;
          ai_title?: string | null;
          ai_summary?: string | null;
          severity?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          created_at?: string;
          entry_date?: string;
          journal_text?: string;
          sleep_hours?: number | null;
          weight?: number | null;
          stress_level?: number | null;
          day_rating?: number | null;
          mood?: string | null;
          ai_title?: string | null;
          ai_summary?: string | null;
          severity?: number | null;
        };
      };
      photos: {
        Row: {
          id: string;
          entry_id: string;
          user_id: string | null;
          storage_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          user_id?: string | null;
          storage_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          entry_id?: string;
          user_id?: string | null;
          storage_path?: string;
          created_at?: string;
        };
      };
      weekly_reflections: {
        Row: {
          id: string;
          user_id: string | null;
          week_start: string;
          reflection_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          week_start: string;
          reflection_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          week_start?: string;
          reflection_text?: string;
          created_at?: string;
        };
      };
      dashboard_insights: {
        Row: {
          id: string;
          user_id: string | null;
          insight: string;
          source_entry_date: string | null;
          generated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          insight: string;
          source_entry_date?: string | null;
          generated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          insight?: string;
          source_entry_date?: string | null;
          generated_at?: string;
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
