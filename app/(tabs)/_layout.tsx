import { Slot } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function RootLayout() {
  // We completely strip out any useEffect redirect rules or context watchers here 
  // to ensure Expo Router simply displays whatever component is called.
  return (
    <View style={styles.container}>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});