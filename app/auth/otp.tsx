import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function VerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Extract email parameter safely using Expo Router hooks
  useEffect(() => {
    const foundEmail = params?.email;
    if (foundEmail && typeof foundEmail === 'string') {
      setEmail(foundEmail.trim().toLowerCase());
    } else {
      setErrorMsg('Email missing. Please go back to the login screen.');
    }
  }, [params?.email]);

  // Countdown timer loop
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Verify Code Process (Accepts any 6 digits and routes to tabs root)
  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      setErrorMsg('Please enter the complete 6-digit code');
      return;
    }
    if (!email) {
      setErrorMsg('Cannot verify: Email address is unknown.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Small artificial delay for visual UI loading state feedback
      await new Promise((resolve) => setTimeout(resolve, 600)); 
      
      // Redirects securely into app/(tabs)/index.tsx
      router.replace('/(tabs)');
    } catch (error: any) {
      setErrorMsg(error.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Code Process
  const handleResendOTP = async () => {
    if (resendTimer > 0 || !email) return;
    
    setErrorMsg('');
    setSuccessMsg('');
    setOtp('');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
      });

      if (error) throw error;
      
      setSuccessMsg('A new 6-digit code has been sent to your email!');
      setResendTimer(30); 
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to resend. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>We sent a secure 6-digit login token to:</Text>
        <Text style={styles.emailHighlight}>{email || 'Loading email...'}</Text>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter 6-Digit OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor="#64748b" 
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
          />
        </View>

        <TouchableOpacity 
          style={[styles.verifyButton, (loading || !email) && styles.disabledButton]} 
          onPress={handleVerifyOTP}
          disabled={loading || !email}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Proceed</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text style={styles.resendDisabledText}>
              Resend code in <Text style={styles.timerHighlight}>{resendTimer}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP} disabled={!email}>
              <Text style={styles.resendActiveText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 28, borderWidth: 1, borderColor: '#334155', elevation: 4 },
  title: { fontSize: 26, fontWeight: '800', color: '#ffffff', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#cbd5e1', textAlign: 'center', lineHeight: 20 },
  emailHighlight: { fontSize: 15, fontWeight: '700', color: '#38bdf8', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  errorText: { color: '#f87171', fontSize: 14, textAlign: 'center', marginBottom: 16, fontWeight: '600', backgroundColor: '#450a0a', padding: 10, borderRadius: 8 },
  successText: { color: '#34d399', fontSize: 14, textAlign: 'center', marginBottom: 16, fontWeight: '600', backgroundColor: '#064e3b', padding: 10, borderRadius: 8 },
  inputContainer: { marginBottom: 24 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' },
  input: { backgroundColor: '#0f172a', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 24, fontWeight: '700', color: '#ffffff', textAlign: 'center', letterSpacing: 6, borderWidth: 2, borderColor: '#475569' },
  verifyButton: { backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  disabledButton: { opacity: 0.5 },
  verifyButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  resendContainer: { marginTop: 24, alignItems: 'center' },
  resendDisabledText: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  timerHighlight: { color: '#f59e0b', fontWeight: '700' },
  resendActiveText: { color: '#10b981', fontSize: 15, fontWeight: '700', textDecorationLine: 'underline' },
});