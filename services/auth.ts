import { supabase } from './supabase';

export async function signUpUser(email: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'TemporaryPassword123!',
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    }
  });
  if (error) throw error;
  return data;
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  return data;
}