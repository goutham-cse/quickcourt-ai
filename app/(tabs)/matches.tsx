import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../services/supabase';

interface PublicMatchItem {
  id: string | number;
  title: string;
  sport: string;
  venue_name: string;
  distance_km: number;
  spots_total: number;
  spots_filled: number;
  skill_level: string;
  match_time: string;
}

const MOCK_INITIAL_MATCHES: PublicMatchItem[] = [
  { id: 'mock-1', title: '5v5 Friday Night Futsal', sport: 'Soccer', venue_name: 'Champions Grand Turf Arena', distance_km: 1.2, spots_total: 10, spots_filled: 8, skill_level: 'Intermediate', match_time: 'Tonight, 08:00 PM' },
  { id: 'mock-2', title: '3v3 Half-Court Crew Linkup', sport: 'Basketball', venue_name: 'Skyline Basketball Court', distance_km: 2.5, spots_total: 6, spots_filled: 3, skill_level: 'All Skills', match_time: 'Tomorrow, 06:00 PM' },
  { id: 'mock-3', title: 'Casual Mixed Doubles Session', sport: 'Tennis', venue_name: 'Grand Slam Tennis Greens', distance_km: 3.1, spots_total: 4, spots_filled: 3, skill_level: 'Advanced', match_time: 'Sunday, 04:00 PM' }
];

export default function MatchDiscoveryScreen() {
  const [loading, setLoading] = useState(true);
  const [availableMatches, setAvailableMatches] = useState<PublicMatchItem[]>(MOCK_INITIAL_MATCHES);
  const [myHostedMatches, setMyHostedMatches] = useState<PublicMatchItem[]>([]);
  const [myJoinedMatches, setMyJoinedMatches] = useState<PublicMatchItem[]>([]);
  const [joinedMatchIds, setJoinedMatchIds] = useState<Record<string | number, boolean>>({});

  const [newTitle, setNewTitle] = useState('');
  const [newSport, setNewSport] = useState('Soccer');
  const [newVenue, setNewVenue] = useState('Champions Grand Turf Arena');
  const [newMaxSpots, setNewMaxSpots] = useState('10');
  const [newSkill, setNewSkill] = useState('All Skills');

  useEffect(() => { fetchActiveLobbies(); }, []);

  async function fetchActiveLobbies() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('matches').select('*').order('id', { ascending: false });
      setAvailableMatches(error || !data || data.length === 0 ? MOCK_INITIAL_MATCHES : [...data, ...MOCK_INITIAL_MATCHES]);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleJoinMatchSlot(matchItem: PublicMatchItem) {
    if (joinedMatchIds[matchItem.id]) return;
    if (matchItem.spots_filled >= matchItem.spots_total) return;

    const updated = { ...matchItem, spots_filled: matchItem.spots_filled + 1 };
    setJoinedMatchIds(prev => ({ ...prev, [matchItem.id]: true }));
    setMyJoinedMatches(prev => [updated, ...prev]);
    setAvailableMatches(prev => prev.map(m => m.id === matchItem.id ? updated : m));
    window.alert('👥 Squad Joined!');

    if (typeof matchItem.id === 'number') {
      try { await supabase.from('matches').update({ spots_filled: matchItem.spots_filled + 1 }).eq('id', matchItem.id); } catch (e) { console.error(e); }
    }
  }

  async function handleCreateNewMatchLobby() {
    if (!newTitle.trim()) return;
    const uniqueId = `user-hosted-${Date.now()}`;
    const hostedPayload = { id: uniqueId, title: newTitle.trim(), sport: newSport, venue_name: newVenue, distance_km: 0.0, spots_total: parseInt(newMaxSpots) || 10, spots_filled: 1, skill_level: newSkill, match_time: 'Today, Scheduled' };

    setMyHostedMatches(prev => [hostedPayload, ...prev]);
    setJoinedMatchIds(prev => ({ ...prev, [uniqueId]: true }));
    setNewTitle('');
    window.alert('🚀 Match Published!');

    try { await supabase.from('matches').insert([{ title: hostedPayload.title, sport: hostedPayload.sport, venue_name: hostedPayload.venue_name, distance_km: hostedPayload.distance_km, spots_total: hostedPayload.spots_total, spots_filled: hostedPayload.spots_filled, skill_level: hostedPayload.skill_level, match_time: hostedPayload.match_time }]); } catch (e) { console.error(e); }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerBannerCard}>
        <Text style={styles.titleText}>🎯 Match Discovery Center</Text>
        <Text style={styles.subTextText}>Join open games, locate players, and configure squad parameters live.</Text>
      </View>

      <View style={styles.lobbyBlockCard}>
        <Text style={styles.sectionHeaderTitle}>📣 Host / Create a Public Match</Text>
        <TextInput style={styles.textInputField} placeholder="Enter custom match title..." value={newTitle} onChangeText={setNewTitle} />
        <View style={styles.formSplitRow}>
          <View style={styles.splitInputBox}><Text style={styles.inputLabelField}>Sport:</Text><TextInput style={styles.textInputField} value={newSport} onChangeText={setNewSport} /></View>
          <View style={styles.splitInputBox}><Text style={styles.inputLabelField}>Slots:</Text><TextInput style={styles.textInputField} value={newMaxSpots} onChangeText={setNewMaxSpots} keyboardType="numeric" /></View>
        </View>
        <View style={styles.formSplitRow}>
          <View style={styles.splitInputBox}><Text style={styles.inputLabelField}>Venue:</Text><TextInput style={styles.textInputField} value={newVenue} onChangeText={setNewVenue} /></View>
          <View style={styles.splitInputBox}><Text style={styles.inputLabelField}>Skill:</Text><TextInput style={styles.textInputField} value={newSkill} onChangeText={setNewSkill} /></View>
        </View>
        <TouchableOpacity style={styles.publishLobbyBtn} onPress={handleCreateNewMatchLobby}><Text style={styles.btnMainTextText}>Publish Match Lobby Roster 🚀</Text></TouchableOpacity>
      </View>

      {myHostedMatches.length > 0 && (
        <View style={styles.listContainer}>
          <Text style={[styles.sectionTitle, { color: '#059669' }]}>👑 Matches Hosted by You</Text>
          {myHostedMatches.map((m) => (
            <View key={m.id} style={[styles.lobbyMatchCard, { borderColor: '#a7f3d0', backgroundColor: '#f0fdf4' }]}>
              <Text style={styles.matchTitleText}>{m.title}</Text>
              <Text style={styles.venueLocationText}>🏟️ {m.venue_name} (Slots: {m.spots_filled}/{m.spots_total})</Text>
            </View>
          ))}
        </View>
      )}

      {myJoinedMatches.length > 0 && (
        <View style={styles.listContainer}>
          <Text style={[styles.sectionTitle, { color: '#2563eb' }]}>🏃‍♂️ Matches You Have Joined</Text>
          {myJoinedMatches.map((m) => (
            <View key={m.id} style={[styles.lobbyMatchCard, { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }]}>
              <Text style={styles.matchTitleText}>{m.title}</Text>
              <Text style={styles.venueLocationText}>🏟️ {m.venue_name}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Open Public Matches Nearby</Text>
        {availableMatches.map((m) => {
          const hasJoined = joinedMatchIds[m.id];
          const isFull = m.spots_filled >= m.spots_total;
          return (
            <View key={m.id} style={styles.lobbyMatchCard}>
              <Text style={styles.matchTitleText}>{m.title}</Text>
              <Text style={styles.venueLocationText}>🏟️ {m.venue_name} • 🚗 {m.distance_km} km away</Text>
              <View style={styles.actionSectionRow}>
                <Text style={styles.spotsCountLabelText}>Roster: {m.spots_filled}/{m.spots_total}</Text>
                <TouchableOpacity style={[styles.joinSquadBtn, (isFull || hasJoined) && styles.disabledBtn]} onPress={() => handleJoinMatchSlot(m)} disabled={isFull || hasJoined}>
                  <Text style={styles.btnTextText}>{hasJoined ? 'Joined ✓' : isFull ? 'Full' : 'Join Squad 👥'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  headerBannerCard: { backgroundColor: '#fff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  titleText: { fontSize: 20, fontWeight: 'bold', color: '#1e3a8a' },
  subTextText: { fontSize: 12, color: '#64748b', marginTop: 4 },
  lobbyBlockCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  sectionHeaderTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 2 },
  textInputField: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', padding: 10, borderRadius: 8, fontSize: 13, color: '#1e293b', width: '100%', marginBottom: 10 },
  formSplitRow: { flexDirection: 'row', gap: 10, width: '100%' },
  splitInputBox: { flex: 1 },
  inputLabelField: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 3 },
  publishLobbyBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnMainTextText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  listContainer: { width: '100%', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
  lobbyMatchCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 14 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sportBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  sportBadgeText: { fontSize: 10, fontWeight: '800', color: '#1e40af' },
  distanceIndicatorText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  matchTitleText: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  venueLocationText: { fontSize: 13, color: '#475569', marginTop: 2, marginBottom: 10 },
  actionSectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  spotsTrackerBox: { flex: 1 },
  spotsCountLabelText: { fontSize: 13, color: '#1e293b', fontWeight: '700' },
  spotsRemainingSub: { fontSize: 11, color: '#059669', fontWeight: '700' },
  joinSquadBtn: { backgroundColor: '#1e3a8a', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  disabledBtn: { backgroundColor: '#cbd5e1' },
  btnTextText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});