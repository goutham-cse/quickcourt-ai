import { supabase } from '../lib/supabase';

export async function createBooking(
  userId: string,
  venueId: number,
  venueName: string,
  bookingDate: string,
  slot: string
) {
  const { error } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      venue_id: venueId,
      venue_name: venueName,
      booking_date: bookingDate,
      slot,
    });

  if (error) {
    throw error;
  }
}

export async function getBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}