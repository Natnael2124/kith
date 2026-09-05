import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://edamsipnyjnbqhpysmsl.supabase.co';
const FALLBACK_KEY = 'sb_publishable_xB8NBcZA1DSj9CBiTEsaxA_7XcV1aes';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl =
  typeof rawUrl === 'string' && rawUrl.trim().startsWith('http')
    ? rawUrl.trim()
    : FALLBACK_URL;

const supabaseAnonKey =
  typeof rawKey === 'string' && rawKey.trim().length > 10
    ? rawKey.trim()
    : FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
