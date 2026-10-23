import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { theme } from '@/constants/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const {
    user,
    isLoading,
    sendVerificationEmail,
    verifyEmail,
    logout,
    error: authError,
    clearError,
  } = useAuth();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(true);
  const [screenError, setScreenError] = useState('');

  useEffect(() => {
    let active = true;
    sendVerificationEmail()
      .then((response) => {
        if (active) setMessage(response.message || 'A verification code has been sent.');
      })
      .catch((error: unknown) => {
        if (active) {
          setScreenError(error instanceof Error ? error.message : 'Could not send the verification code.');
        }
      })
      .finally(() => {
        if (active) setIsSending(false);
      });
    return () => {
      active = false;
    };
  }, [sendVerificationEmail]);

  const handleVerify = async () => {
    clearError();
    setScreenError('');
    setMessage('');
    if (!/^\d{6}$/.test(code.trim())) {
      setScreenError('Enter the 6-digit code sent to your email.');
      return;
    }

    try {
      await verifyEmail({ code: code.trim() });
      router.replace('/(app)/(tabs)' as any);
    } catch (error) {
      setScreenError(error instanceof Error ? error.message : 'Email verification failed.');
    }
  };

  const handleResend = async () => {
    clearError();
    setScreenError('');
    setMessage('');
    setIsSending(true);
    try {
      const response = await sendVerificationEmail();
      setMessage(response.message || 'A new verification code has been sent.');
    } catch (error) {
      setScreenError(error instanceof Error ? error.message : 'Could not send the verification code.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>ACCOUNT SECURITY</Text>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.description}>
          Enter the 6-digit code we sent to {user?.email || 'your email address'}.
          The code expires after 15 minutes.
        </Text>

        <TextInput
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.codeInput}
          accessibilityLabel="Six digit email verification code"
        />

        {(screenError || authError) ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {screenError || authError}
          </Text>
        ) : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}

        <TouchableOpacity
          accessibilityRole="button"
          onPress={handleVerify}
          disabled={isLoading}
          style={[styles.primaryButton, isLoading && styles.disabled]}
        >
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Verify email</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={handleResend}
          disabled={isSending}
          style={styles.secondaryButton}
        >
          {isSending ? <ActivityIndicator color={theme.colors.textPrimary} /> : <Text style={styles.secondaryText}>Resend code</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => void logout().then(() => router.replace('/(auth)/login' as any))}
          style={styles.signOutButton}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    padding: 24,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  eyebrow: {
    color: theme.colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 10,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
    paddingVertical: 14,
    marginBottom: 12,
  },
  error: {
    color: theme.colors.error,
    fontSize: 13,
    marginBottom: 10,
  },
  success: {
    color: theme.colors.success,
    fontSize: 13,
    marginBottom: 10,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
  },
  primaryText: {
    color: theme.colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 8,
  },
  secondaryText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    alignItems: 'center',
    marginTop: 14,
    padding: 8,
  },
  signOutText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
});
