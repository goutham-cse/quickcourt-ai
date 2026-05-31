import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { getBookings } from '../../services/bookings';

export default function BookingHistoryScreen() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const data = await getBookings(user.id);
      setBookings(data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Booking History
      </Text>

      {bookings.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No bookings yet.
          </Text>
        </View>
      )}

      {bookings.map((booking) => (
        <View key={booking.id} style={styles.card}>
          <Text style={styles.name}>
            {booking.venue_name}
          </Text>

          <Text>
            📅 {booking.booking_date}
          </Text>

          <Text>
            🕒 {booking.slot}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
  },

  name: {
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 16,
  },

  emptyCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
  },

  emptyText: {
    color: '#666',
  },
});