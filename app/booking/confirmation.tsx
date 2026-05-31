import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

export default function ConfirmationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✅</Text>

      <Text style={styles.title}>
        Booking Confirmed
      </Text>

      <Text style={styles.subtitle}>
        Your venue has been successfully booked.
      </Text>

      <View style={styles.card}>
        <Text>Booking saved successfully.</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/booking/history')}
      >
        <Text style={styles.buttonText}>
          View Booking History
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },

  emoji: {
    fontSize: 70,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 15,
  },

  subtitle: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginTop: 25,
  },

  button: {
    marginTop: 25,
    backgroundColor: '#22C55E',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});