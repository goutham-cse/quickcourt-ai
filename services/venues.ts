import { supabase } from '../lib/supabase';

export type Venue = {
  id: number;
  name: string;
  sport: string;
  rating: number;
  price: number;
  location: string;
  image_url: string | null;
  created_at?: string;
};

// Premium fallback venue data when the database is empty
const FALLBACK_VENUES: Venue[] = [
  {
    id: 1,
    name: 'Elite Football Arena',
    sport: 'Football',
    rating: 4.8,
    price: 799,
    location: 'Chennai',
    image_url: null,
  },
  {
    id: 2,
    name: 'Smash Badminton Club',
    sport: 'Badminton',
    rating: 4.7,
    price: 499,
    location: 'Chennai',
    image_url: null,
  },
  {
    id: 3,
    name: 'Champion Cricket Nets',
    sport: 'Cricket',
    rating: 4.9,
    price: 699,
    location: 'Chennai',
    image_url: null,
  },
  {
    id: 4,
    name: 'PowerPlay Gym & Fitness',
    sport: 'Gym',
    rating: 4.6,
    price: 399,
    location: 'Chennai',
    image_url: null,
  },
  {
    id: 5,
    name: 'Indoor Basketball Court',
    sport: 'Basketball',
    rating: 4.5,
    price: 599,
    location: 'Chennai',
    image_url: null,
  },
  {
    id: 6,
    name: 'Chennai Tennis Academy',
    sport: 'Tennis',
    rating: 4.8,
    price: 899,
    location: 'Chennai',
    image_url: null,
  },
];

export async function getVenues(): Promise<Venue[]> {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching venues:', error.message);
      return FALLBACK_VENUES;
    }

    return data && data.length > 0 ? data : FALLBACK_VENUES;
  } catch (err) {
    console.error('Venues fetch exception:', err);
    return FALLBACK_VENUES;
  }
}

export async function getVenueById(id: number): Promise<Venue | null> {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      // Try fallback
      return FALLBACK_VENUES.find(v => v.id === id) || null;
    }

    return data;
  } catch (err) {
    return FALLBACK_VENUES.find(v => v.id === id) || null;
  }
}

export function getFallbackVenues(): Venue[] {
  return FALLBACK_VENUES;
}
