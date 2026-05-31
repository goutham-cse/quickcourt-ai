import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signUpUser } from '../../services/auth';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email) {
      Alert.alert('Required', 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await signUpUser(email);
      Alert.alert(
        'Account Registered! 🎉',
        'Your profile has been generated. Let\'s proceed to verification.',
        [{ text: 'Continue', onPress: () => router.replace('/auth/login') }]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back to Login</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Create Account</Text>
      <Text style={styles.subHeader}>Join the QuickCourt community to book venues near you</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register Account</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  backButton: { position: 'absolute', top: 60, left: 24 },
  backText: { color: '#1e3a8a', fontWeight: '600', fontSize: 16 },
  header: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subHeader: { fontSize: 14, color: '#6b7280', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#d1d5db', padding: 16, borderRadius: 8, fontSize: 16, marginBottom: 16, backgroundColor: '#f9fafb' },
  button: { backgroundColor: '#10b981', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  disabledButton: { backgroundColor: '#a7f3d0' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});