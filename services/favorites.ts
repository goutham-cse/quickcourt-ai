import { supabase } from '../lib/supabase';

export type Favorite = {
  id: number;
  user_id: string;
  venue_name: string;
  created_at?: string;
};

export async function getFavorites(userId: string): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error.message);
    return [];
  }

  return data || [];
}

export async function addFavorite(
  userId: string,
  venueName: string
): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      venue_name: venueName,
    });

  if (error) {
    throw error;
  }
}

export async function removeFavorite(
  userId: string,
  venueName: string
): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('venue_name', venueName);

  if (error) {
    throw error;
  }
}

export async function isFavorite(
  userId: string,
  venueName: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('venue_name', venueName)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
