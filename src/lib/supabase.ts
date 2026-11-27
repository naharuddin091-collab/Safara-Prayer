import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Public publishable Supabase config (env vars take priority when set on Vercel)
const DEFAULT_SUPABASE_URL = 'https://mqbywmwkmnxrfwffegti.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_7IVtvWGGBq17ETHdfwEF2A_7dRGXaEa';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;
