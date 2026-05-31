import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../services/supabase';

interface NextBooking {
  venue_name: string;
  time_slot: string;
  booking_date: string;
  status: string;
}

export default function AdvancedHomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nextMatch, setNextMatch] = useState<NextBooking | null>(null);

  const weatherMetrics = {
    temp: "29°C",
    condition: "Partly Cloudy ⛅",
    playability: "Excellent for Outdoor Sports"
  };

  useEffect(() => {
    fetchUpcomingDashboardActivity();
  }, []);

  async function fetchUpcomingDashboardActivity() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('venue_name, time_slot, booking_date, status')
        .order('id', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setNextMatch(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      <View style={styles.welcomeHeaderBox}>
        <Text style={styles.greetingText}>⚡ QuickCourt Command Center</Text>
        <Text style={styles.subGreeting}>Your centralized hub for match discovery, court reservations, and squad lineups.</Text>
      </View>

      <View style={styles.weatherRadarCard}>
        <View style={styles.weatherTopRow}>
          <Text style={styles.weatherTitle}>📍 Indiranagar Climate Radar</Text>
          <Text style={styles.weatherTemp}>{weatherMetrics.temp}</Text>
        </View>
        <Text style={styles.weatherCondition}>Condition: <Text style={{fontWeight: '700'}}>{weatherMetrics.condition}</Text></Text>
        <View style={styles.playabilityStatusBadge}>
          <Text style={styles.playabilityText}>🟢 Status: {weatherMetrics.playability}</Text>
        </View>
      </View>

      <Text style={styles.sectionHeadingTitle}>📅 Your Next Immediate Match</Text>
      {loading ? (
        <View style={styles.nestedLoader}><ActivityIndicator size="small" color="#1e3a8a" /></View>
      ) : nextMatch ? (
        <View style={styles.upcomingScheduleCard}>
          <View style={styles.scheduleHeaderRow}>
            <Text style={styles.scheduleVenueName}>{nextMatch.venue_name}</Text>
            <View style={styles.statusBadgeInline}>
              <Text style={styles.statusBadgeText}>{nextMatch.status}</Text>
            </View>
          </View>
          <Text style={styles.scheduleMetaText}>📅 Schedule Date: {nextMatch.booking_date}</Text>
          <Text style={styles.scheduleMetaText}>⏰ Allocated Hours: {nextMatch.time_slot}</Text>
          
          <TouchableOpacity style={styles.actionShortcutLink} onPress={() => router.push('/profile')}>
            <Text style={styles.actionShortcutLinkText}>Manage Complete Pass Ledger →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyActivityCard}>
          <Text style={styles.emptyActivityText}>No active upcoming sessions locked on your calendar dashboard rows.</Text>
          <TouchableOpacity style={styles.inlineBookBtn} onPress={() => router.push('/venues')}>
            <Text style={styles.inlineBookBtnText}>Book a Turf Now 🏟️</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionHeadingTitle}>⚡ Quick Sport Discovery Pipelines</Text>
      <Text style={styles.sectionCaptionText}>Tap any discipline to navigate directly to optimized local court search listings:</Text>
      
      <View style={styles.shortcutsFlexGrid}>
        <TouchableOpacity style={styles.shortcutTileButton} onPress={() => router.push('/venues')}>
          <Text style={styles.tileIcon}>⚽</Text>
          <Text style={styles.tileLabel}>Soccer Turfs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shortcutTileButton} onPress={() => router.push('/venues')}>
          <Text style={styles.tileIcon}>🏸</Text>
          <Text style={styles.tileLabel}>Badminton Guilds</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shortcutTileButton} onPress={() => router.push('/venues')}>
          <Text style={styles.tileIcon}>🏀</Text>
          <Text style={styles.tileLabel}>Basketball Rings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shortcutTileButton} onPress={() => router.push('/venues')}>
          <Text style={styles.tileIcon}>🎾</Text>
          <Text style={styles.tileLabel}>Tennis Courts</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeadingTitle}>🤖 Platform Feature Directories</Text>
      <View style={styles.featureDirectoryBlock}>
        <TouchableOpacity style={styles.directoryRowItem} onPress={() => router.push('/matches')}>
          <View style={styles.directoryLeftGroup}>
            <Text style={styles.directoryIcon}>🎯</Text>
            <View style={styles.textContainer}>
              <Text style={styles.directoryTitle}>Match Discovery Board</Text>
              <Text style={styles.directoryDesc} numberOfLines={1}>Join public games and view open team invites</Text>
            </View>
          </View>
          <Text style={styles.directoryArrow}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.directoryRowItem, { borderBottomWidth: 0 }]} onPress={() => router.push('/ai')}>
          <View style={styles.directoryLeftGroup}>
            <Text style={styles.directoryIcon}>🤖</Text>
            <View style={styles.textContainer}>
              <Text style={styles.directoryTitle}>AI Concierge Booking Chat</Text>
              <Text style={styles.directoryDesc} numberOfLines={1}>Instruct our bot agent to book and query data</Text>
            </View>
          </View>
          <Text style={styles.directoryArrow}>➔</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingTop: 45, paddingBottom: 60 },
  welcomeHeaderBox: { backgroundColor: '#1e3a8a', borderRadius: 16, padding: 20, marginBottom: 16 },
  greetingText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  subGreeting: { fontSize: 12, color: '#bfdbfe', marginTop: 4, lineHeight: 16 },
  weatherRadarCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  weatherTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  weatherTitle: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
  weatherTemp: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  weatherCondition: { fontSize: 13, color: '#334155' },
  playabilityStatusBadge: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', padding: 8, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  playabilityText: { fontSize: 11, fontWeight: '700', color: '#166534' },
  sectionHeadingTitle: { fontSize: 14, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, paddingLeft: 2 },
  sectionCaptionText: { fontSize: 11, color: '#64748b', marginBottom: 12, paddingLeft: 2 },
  upcomingScheduleCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  scheduleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  scheduleVenueName: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', flex: 1, paddingRight: 8 },
  statusBadgeInline: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  statusBadgeText: { fontSize: 10, fontWeight: '800', color: '#1e40af' },
  scheduleMetaText: { fontSize: 12, color: '#475569', marginTop: 3 },
  actionShortcutLink: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10, marginTop: 12 },
  actionShortcutLinkText: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  emptyActivityCard: { backgroundColor: '#fff', borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  emptyActivityText: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 12 },
  inlineBookBtn: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  inlineBookBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  nestedLoader: { padding: 30, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
  shortcutsFlexGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24, width: '100%' },
  shortcutTileButton: { flexGrow: 1, flexShrink: 0, flexBasis: '45%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  tileIcon: { fontSize: 22, marginBottom: 6 },
  tileLabel: { fontSize: 12, fontWeight: '600', color: '#334155' },
  featureDirectoryBlock: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  directoryRowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  directoryLeftGroup: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  textContainer: { flex: 1, paddingRight: 8 },
  directoryIcon: { fontSize: 18 },
  directoryTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  directoryDesc: { fontSize: 11, color: '#64748b', marginTop: 1 },
  directoryArrow: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold' }
});