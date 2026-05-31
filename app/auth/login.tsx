import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../services/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  async function handleLogin() {
    setErrorText('');
    if (!email || !email.includes('@')) {
      setErrorText('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      
      // Request 6-digit passcode directly from Supabase
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) throw error;

      // FIXED: No Alert block. Jump INSTANTLY to the OTP entry screen space!
      router.push('/auth/otp');

    } catch (error: any) {
      console.error(error);
      setErrorText(error.message || 'Could not dispatch OTP.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>⚡ QuickCourt</Text>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Enter your email to receive an instant database login token</Text>

      <TextInput
        style={styles.input}
        placeholder="name@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Verification Token</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#1e3a8a', textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32, paddingHorizontal: 10 },
  input: { borderWidth: 1, borderColor: '#d1d5db', padding: 16, borderRadius: 8, fontSize: 16, marginBottom: 16, backgroundColor: '#f9fafb' },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center', marginBottom: 12, fontWeight: '500' },
  button: { backgroundColor: '#1e3a8a', padding: 16, borderRadius: 8, alignItems: 'center' },
  disabledButton: { backgroundColor: '#93c5fd' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});