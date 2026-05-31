import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const notifications = [
  {
    title: 'Booking Confirmed',
    message: 'Elite Football Arena booked successfully.',
  },
  {
    title: 'Match Reminder',
    message: 'Your football match starts in 2 hours.',
  },
  {
    title: 'Payment Successful',
    message: '₹799 payment received.',
  },
];

export default function NotificationsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      {notifications.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>
            {item.title}
          </Text>

          <Text>
            {item.message}
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

  cardTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },
});