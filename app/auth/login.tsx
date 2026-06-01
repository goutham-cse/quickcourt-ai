import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function UnifiedLoginScreen() {
  const router = useRouter();
  
  // App States
  const [step, setStep] = useState<'email' | 'otp'>('email'); // Handles view toggle locally
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer loop for Resend button
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer, step]);

  // Step 1: Send the One-Time Password via Supabase
  const handleSendOTP = async () => {
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setSuccessMsg('Verification code sent successfully!');
      setResendTimer(30);
      
      // Instantly advance the interface state without changing pages
      setStep('otp');
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to send verification code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Handle App Entry
  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      setErrorMsg('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      router.replace('/(tabs)');
    } catch (error: any) {
      setErrorMsg(error.message || 'Invalid or expired code. Please try again.');
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
          <Text style={styles.brandTitle}>QuickCourt AI</Text>
          
          {step === 'email' ? (
            <>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Enter your email to receive a secure 6-digit login code</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>We sent a secure 6-digit login token to:</Text>
              <Text style={styles.emailHighlight}>{email.trim().toLowerCase()}</Text>
            </>
          )}

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

          {/* DYNAMIC RENDERING BLOCK */}
          {step === 'email' ? (
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
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.otpInputLabel}>Enter 6-Digit OTP</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="123456"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleVerifyOTP}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Verify & Proceed</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                {resendTimer > 0 ? (
                  <Text style={styles.resendDisabledText}>
                    Resend code in <Text style={styles.timerHighlight}>{resendTimer}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOTP}>
                    <Text style={styles.resendActiveText}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity 
                onPress={() => { setStep('email'); setErrorMsg(''); setSuccessMsg(''); }} 
                style={{ marginTop: 20 }}
              >
                <Text style={{ color: '#94a3b8', textAlign: 'center', fontSize: 14, textDecorationLine: 'underline' }}>
                  ← Change Email Address
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 28, borderWidth: 1, borderColor: '#334155', elevation: 4 },
  brandTitle: { fontSize: 14, fontWeight: '700', color: '#10b981', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#ffffff', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#cbd5e1', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emailHighlight: { fontSize: 15, fontWeight: '700', color: '#38bdf8', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  errorText: { color: '#f87171', fontSize: 14, textAlign: 'center', marginBottom: 20, fontWeight: '600', backgroundColor: '#450a0a', padding: 12, borderRadius: 8 },
  successText: { color: '#34d399', fontSize: 14, textAlign: 'center', marginBottom: 20, fontWeight: '600', backgroundColor: '#064e3b', padding: 12, borderRadius: 8 },
  inputContainer: { marginBottom: 8 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#ffffff', borderWidth: 2, borderColor: '#475569', marginBottom: 16 },
  otpInputLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' },
  otpInput: { backgroundColor: '#0f172a', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 24, fontWeight: '700', color: '#ffffff', textAlign: 'center', letterSpacing: 6, borderWidth: 2, borderColor: '#475569', marginBottom: 20 },
  loginButton: { backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  disabledButton: { opacity: 0.5 },
  loginButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  resendContainer: { marginTop: 24, alignItems: 'center' },
  resendDisabledText: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  timerHighlight: { color: '#f59e0b', fontWeight: '700' },
  resendActiveText: { color: '#10b981', fontSize: 15, fontWeight: '700', textDecorationLine: 'underline' }
});
