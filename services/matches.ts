import { supabase } from '../lib/supabase';

export type Match = {
  id: number;
  title: string;
  players: string;
  venue: string;
  created_at?: string;
};

// Premium fallback match data
const FALLBACK_MATCHES: Match[] = [
  {
    id: 1,
    title: 'Football Evening Match',
    players: '8/10',
    venue: 'Elite Football Arena',
  },
  {
    id: 2,
    title: 'Weekend Cricket League',
    players: '16/22',
    venue: 'Champion Cricket Nets',
  },
  {
    id: 3,
    title: 'Badminton Doubles',
    players: '2/4',
    venue: 'Smash Badminton Club',
  },
  {
    id: 4,
    title: 'Sunday Football Friendly',
    players: '6/10',
    venue: 'Elite Football Arena',
  },
];

export async function getMatches(): Promise<Match[]> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error.message);
      return FALLBACK_MATCHES;
    }

    return data && data.length > 0 ? data : FALLBACK_MATCHES;
  } catch (err) {
    console.error('Matches fetch exception:', err);
    return FALLBACK_MATCHES;
  }
}

export async function createMatch(
  title: string,
  venue: string,
  maxPlayers: number
): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .insert({
      title,
      venue,
      players: `0/${maxPlayers}`,
    });

  if (error) {
    throw error;
  }
}

export async function joinMatch(
  matchId: number,
  currentPlayers: string
): Promise<void> {
  // Parse "8/10" format and increment
  const parts = currentPlayers.split('/');
  const current = parseInt(parts[0], 10);
  const max = parseInt(parts[1], 10);

  if (current >= max) {
    throw new Error('This match is already full.');
  }

  const newPlayers = `${current + 1}/${max}`;

  const { error } = await supabase
    .from('matches')
    .update({ players: newPlayers })
    .eq('id', matchId);

  if (error) {
    throw error;
  }
}

export function getFallbackMatches(): Match[] {
  return FALLBACK_MATCHES;
}
