import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const MapPreviewComponent = ({ latitude, longitude, areaName }: { latitude: number; longitude: number; areaName: string }) => {
  if (typeof window === 'undefined') return <View style={styles.mapMockBox}><Text style={styles.mapMockText}>Loading Map View...</Text></View>;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.015}%2C${latitude-0.015}%2C${longitude+0.015}%2C${latitude+0.015}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  return (
    <View style={styles.mapContainerBox}>
      <iframe title="Live Location Field Map View" src={mapUrl} style={{ border: 0, borderRadius: 12, width: '100%', height: '100%', display: 'block' }} allowFullScreen loading="lazy" />
      <View style={styles.mapLabelFloating}><Text style={styles.mapFloatingText}>📍 Scanning Center: {areaName}</Text></View>
    </View>
  );
};

interface SimulatedVenue {
  id: string;
  name: string;
  category: string;
  address: string;
  rating: number;
  price_per_hour: number;
  distance_km: number;
  image_url: string;
}

const SPORT_CATEGORIES = ['All', 'Soccer', 'Badminton', 'Basketball', 'Tennis'];

export default function VenuesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Indiranagar'); 
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [generatedVenues, setGeneratedVenues] = useState<SimulatedVenue[]>([]);
  const [mapCoords, setMapCoords] = useState({ lat: 12.9716, lng: 77.5946 });

  const buildRealtimeTurfsForArea = (area: string) => {
    const targetArea = area.trim() || 'Central Zone';
    const seed = targetArea.length;
    const baseLat = 12.9716 + (seed % 5) * 0.015 - 0.02;
    const baseLng = 77.5946 + (seed % 3) * 0.012 - 0.01;
    setMapCoords({ lat: baseLat, lng: baseLng });

    return [
      { id: `turf-1-${seed}`, name: `${targetArea} Champions Arena`, category: 'Soccer', address: `Main Ring Road, ${targetArea} Cross Sector`, rating: 4.8, price_per_hour: 650, distance_km: parseFloat((1.2 + (seed % 3) * 0.4).toFixed(1)), image_url: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop' },
      { id: `turf-2-${seed}`, name: `Smash Pro Hub ${targetArea}`, category: 'Badminton', address: `4th Phase Avenue, Behind Metro, ${targetArea}`, rating: 4.6, price_per_hour: 400, distance_km: parseFloat((0.6 + (seed % 2) * 0.5).toFixed(1)), image_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop' },
      { id: `turf-3-${seed}`, name: `The ${targetArea} Court Skyline`, category: 'Basketball', address: `Sports Elite Complex, North Side, ${targetArea}`, rating: 4.7, price_per_hour: 750, distance_km: parseFloat((2.5 + (seed % 4) * 0.3).toFixed(1)), image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop' },
      { id: `turf-4-${seed}`, name: `Grand Slam Tennis Greens`, category: 'Tennis', address: `Clubhouse Parkway, Link Street, ${targetArea}`, rating: 4.5, price_per_hour: 900, distance_km: parseFloat((3.1 + (seed % 2) * 0.7).toFixed(1)), image_url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop' }
    ];
  };

  useEffect(() => {
    setLoading(true);
    const delayDebounceTimer = setTimeout(() => {
      setGeneratedVenues(buildRealtimeTurfsForArea(searchQuery));
      setLoading(false);
    }, 400);
    return () => clearTimeout(delayDebounceTimer);
  }, [searchQuery]);

  const displayVenues = selectedCategory === 'All' ? generatedVenues : generatedVenues.filter(v => v.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerBlockCard}>
        <Text style={styles.appTitle}>⚡ QuickCourt Discovery</Text>
        <Text style={styles.subText}>Type any neighborhood location area to scan immediate surrounding turfs</Text>
        <TextInput style={styles.searchInputField} placeholder="Type an area..." value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <MapPreviewComponent latitude={mapCoords.lat} longitude={mapCoords.lng} areaName={searchQuery || 'Current Area'} />

      <View style={styles.categoryPillsRowContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPillsScroll}>
          {SPORT_CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.sportPillButton, selectedCategory === cat && styles.activeSportPillButton]} onPress={() => setSelectedCategory(cat)}>
              <Text style={[styles.sportPillText, selectedCategory === cat && styles.activeSportPillText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loaderArea}><ActivityIndicator size="large" color="#1e3a8a" /><Text style={styles.loaderText}>Geocoding area turfs...</Text></View>
      ) : (
        <View style={styles.venuesListWrapper}>
          {displayVenues.map((item) => (
            <TouchableOpacity key={item.id} style={styles.venueCardItem} onPress={() => router.push({ pathname: '/venue/[id]', params: { id: item.id } })}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image_url }} style={styles.cardImageHeader} resizeMode="cover" />
                <View style={styles.textOverlayStrip}>
                  <View style={styles.titleBadgeRow}>
                    <Text style={styles.venueTitleText}>{item.name}</Text>
                    <View style={styles.ratingBadgeCircle}><Text style={styles.ratingBadgeText}>⭐ {item.rating}</Text></View>
                  </View>
                  <Text style={styles.addressSubtext}>📍 {item.address}</Text>
                  <View style={styles.bottomMetaRow}>
                    <Text style={styles.sportTagBadge}>{item.category}</Text>
                    <Text style={styles.distanceText}>🚗 {item.distance_km} km</Text>
                    <Text style={styles.priceText}>₹{item.price_per_hour}/hr</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  headerBlockCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  appTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 2 },
  subText: { fontSize: 12, color: '#64748b', marginBottom: 14 },
  searchInputField: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 8, fontSize: 14, color: '#1e293b', fontWeight: '500' },
  mapContainerBox: { height: 180, width: '100%', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 14, position: 'relative', backgroundColor: '#e2e8f0' },
  mapMockBox: { height: 180, backgroundColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  mapMockText: { color: '#475569', fontSize: 14, fontWeight: '500' },
  mapLabelFloating: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  mapFloatingText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  categoryPillsRowContainer: { marginBottom: 16, height: 38 },
  categoryPillsScroll: { gap: 8 },
  sportPillButton: { backgroundColor: '#fff', paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center' },
  activeSportPillButton: { backgroundColor: '#1e3a8a', borderColor: '#1e3a8a' },
  sportPillText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  activeSportPillText: { color: '#fff' },
  venuesListWrapper: { width: '100%' },
  venueCardItem: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 16 },
  imageContainer: { width: '100%', aspectRatio: 16 / 10, position: 'relative' },
  cardImageHeader: { width: '100%', height: '100%' },
  textOverlayStrip: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15, 23, 42, 0.82)', padding: 14, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  titleBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  venueTitleText: { fontSize: 15, fontWeight: 'bold', color: '#fff', flex: 1, paddingRight: 6 },
  ratingBadgeCircle: { backgroundColor: '#fef08a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#854d0e' },
  addressSubtext: { fontSize: 12, color: '#cbd5e1', marginBottom: 8 },
  bottomMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 8 },
  sportTagBadge: { fontSize: 10, fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  distanceText: { fontSize: 12, fontWeight: '600', color: '#e2e8f0' },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#4ade80' },
  loaderArea: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  loaderText: { color: '#475569', fontSize: 13, marginTop: 8, fontWeight: '500' }
});