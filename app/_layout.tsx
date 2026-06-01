import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootLayoutProtectedState() {
  const { session, user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Convert segments array to dynamic strings to bypass strict TypeScript assignment limits
    const currentPathString = segments.join('/');
    const isInsideAuthScreens = currentPathString.includes('auth');

    if (!session && !isInsideAuthScreens) {
      // Force direct route execution to the login portal screen if unauthenticated
      router.replace('/auth/login');
    } else if (user && isInsideAuthScreens) {
      // Clear the login screen from history and land on the tabs home screen.
      router.replace('/(tabs)');
    }
  }, [user, session, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutProtectedState />
    </AuthProvider>
  );
}
