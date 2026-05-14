import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  specialty: string;
  institution: string;
  avatar_initials: string;
  created_at: string;
}

export interface DoctorPost {
  id: string;
  author_id: string;
  type: 'finding' | 'research' | 'article' | 'connection';
  content: string;
  attachments: { title: string; description?: string }[] | null;
  likes_count: number;
  shares_count: number;
  reposts_count: number;
  created_at: string;
  profiles?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  from_user_id: string;
  type: 'comment' | 'like' | 'repost';
  post_id: string;
  comment_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
  from_profile?: Profile;
}
