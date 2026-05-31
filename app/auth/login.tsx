import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOTP = async () => {
    // Basic validation
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Request the One-Time Password / Magic Token from Supabase
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanedEmail,
      });

      if (error) throw error;

      // 2. CRITICAL: Save the exact email to local device memory
      await AsyncStorage.setItem('user_testing_email', cleanedEmail);

      setSuccessMsg('Verification code sent successfully!');
      
      // 3. Move forward to the OTP validation screen immediately
      setTimeout(() => {
        navigation.navigate('otp', { email: cleanedEmail });
      }, 800);

    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to send verification code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        <View style={styles.card}>
          {/* Brand/App Title */}
          <Text style={styles.brandTitle}>QuickCourt AI</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your email to receive a secure 6-digit login code</Text>

          {/* Feedback Messages */}
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

          {/* Email Input Field Box */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => setEmail(text)}
              editable={!loading}
            />
          </View>

          {/* Action Trigger Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleSendOTP}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Send Verification Code</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Deep midnight background
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1e293b', // Lighter container gray box layer
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981', // Emerald identity accent
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff', // Clean white primary text
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#cbd5e1', // High contrast body font styling
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
    backgroundColor: '#450a0a',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  successText: {
    color: '#34d399',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
    backgroundColor: '#064e3b',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0f172a', // Clean slate embedded block
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff', // Ensures user input is perfectly legible
    borderWidth: 2,
    borderColor: '#475569',
  },
  loginButton: {
    backgroundColor: '#10b981', // Crisp Emerald Green CTA button
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});