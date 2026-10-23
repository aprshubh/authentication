import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { AuthAlert, AuthButton, AuthCard, AuthInput } from '@/features/auth/components';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { forgotPasswordSchema } from '@/features/auth/schemas/auth.schema';
import { theme } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const { forgotPassword, isLoading, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    setEmail(value);

    if (formErrors.email) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated.email;
        return updated;
      });
    }
    if (authError) {
      clearError();
    }
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const handleSubmit = async () => {
    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && typeof fieldName === 'string') {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setFormErrors(fieldErrors);
      return;
    }

    setFormErrors({});

    try {
      const response = await forgotPassword({ email: result.data.email });
      setSuccessMessage(
        response?.message || 'If an account exists, a secure recovery code has been sent.'
      );
    } catch {
      // Handled by auth context
    }
  };

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter your email to receive a recovery link"
      iconName="mail-outline"
      badgeText="ACCOUNT RECOVERY"
    >
      <AuthAlert type="error" message={authError} />
      <AuthAlert type="success" message={successMessage} />

      <AuthInput
        label="Registered Email"
        placeholder="name@company.com"
        value={email}
        onChangeText={handleInputChange}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        leftIcon="mail-outline"
        error={formErrors.email}
        editable={!isLoading}
      />

      <AuthButton
        title="Send Recovery Link"
        onPress={handleSubmit}
        isLoading={isLoading}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Remembered your password?</Text>
        <Link href={'/(auth)/login' as any} asChild>
          <TouchableOpacity activeOpacity={0.7} disabled={isLoading}>
            <Text style={styles.footerLink}> Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textHighlight,
  },
});
