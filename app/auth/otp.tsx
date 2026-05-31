import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../services/supabase';

export default function OtpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  async function handleVerify() {
    setStatusText('');
    if (!email || !token) {
      Alert.alert('Error', 'Please enter both your email address and the 6-digit code.');
      return;
    }

    try {
      setLoading(true);
      setStatusText('Validating with cloud database...');
      
      // Submit the live code token directly to the Supabase authorization engine
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: 'email'
      });

      if (error) throw error;

      // If this is a brand new user signup, initialize their metadata profile row safely
      if (data?.user) {
        setStatusText('Syncing new profile credentials...');
        const userDisplayName = email.split('@')[0].toUpperCase();
        
        await supabase.auth.updateUser({
          data: { full_name: userDisplayName }
        });
      }

      setStatusText('Session Authorized! Entering Hub...');
      
      // Instantly clear layout tree stack and advance directly to the home screen dashboard tabs
      router.replace('/(tabs)/venues');

    } catch (error: any) {
      console.error(error);
      Alert.alert('Verification Failed', error.message || 'Invalid or expired passcode.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Verify Credentials</Text>
      <Text style={styles.subHeader}>Type the 6-digit passcode sent to your email inbox</Text>

      <TextInput
        style={styles.input}
        placeholder="Confirm your email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter 6-Digit Pin Code"
        value={token}
        onChangeText={setToken}
        keyboardType="number-pad"
        maxLength={6}
        editable={!loading}
      />

      {statusText ? <Text style={styles.statusText}>{statusText}</Text> : null}

      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Authorize Identity</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  subHeader: { fontSize: 14, color: '#6b7280', marginBottom: 32, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#d1d5db', padding: 16, borderRadius: 8, fontSize: 16, marginBottom: 16, backgroundColor: '#f9fafb' },
  statusText: { color: '#2563eb', fontSize: 14, textAlign: 'center', marginBottom: 12, fontWeight: '500' },
  button: { backgroundColor: '#10b981', padding: 16, borderRadius: 8, alignItems: 'center' },
  disabledButton: { backgroundColor: '#a7f3d0' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});