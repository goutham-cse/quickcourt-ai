import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

let supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.slice(0, -9);
} else if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.slice(0, -8);
} else if (supabaseUrl.endsWith('/')) {
  supabaseUrl = supabaseUrl.slice(0, -1);
}

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl) {
  console.error(
    'Missing EXPO_PUBLIC_SUPABASE_URL'
  );
}

if (!supabaseAnonKey) {
  console.error(
    'Missing EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);