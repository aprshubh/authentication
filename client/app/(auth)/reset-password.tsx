import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { AuthAlert, AuthButton, AuthCard, AuthInput } from '@/features/auth/components';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { theme } from '@/constants/theme';
import { resetPasswordSchema } from '@/features/auth/schemas/auth.schema';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const { resetPassword, isLoading, error: authError, clearError } = useAuth();

  const [token, setToken] = useState(params.token || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (
    field: 'token' | 'password' | 'confirmPassword',
    value: string
  ) => {
    if (field === 'token') setToken(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
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

  const handleResetPassword = async () => {
    const result = resetPasswordSchema.safeParse({
      token,
      password,
      confirmPassword,
    });

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
      const response = await resetPassword({
        token: result.data.token,
        password: result.data.password,
      });
      setSuccessMessage(
        response?.message || 'Password has been updated. You can now access your account.'
      );
      setTimeout(() => {
        router.replace('/(auth)/login' as any);
      }, 1800);
    } catch {
      // Handled by auth context
    }
  };

  return (
    <AuthCard
      title="New Password"
      subtitle="Enter your token and set a new password"
    >
      <AuthAlert type="error" message={authError} />
      <AuthAlert type="success" message={successMessage} />

      <AuthInput
        label="Reset Token"
        placeholder="Enter security token"
        value={token}
        onChangeText={(text) => handleInputChange('token', text)}
        autoCapitalize="none"
        autoCorrect={false}
        leftIcon="key-outline"
        error={formErrors.token}
        editable={!isLoading}
      />

      <AuthInput
        label="New Password"
        placeholder="Minimum 8 characters"
        value={password}
        onChangeText={(text) => handleInputChange('password', text)}
        isPassword
        autoCapitalize="none"
        autoComplete="new-password"
        leftIcon="lock-closed-outline"
        error={formErrors.password}
        editable={!isLoading}
      />

      <AuthInput
        label="Confirm New Password"
        placeholder="Re-enter your new password"
        value={confirmPassword}
        onChangeText={(text) => handleInputChange('confirmPassword', text)}
        isPassword
        autoCapitalize="none"
        autoComplete="new-password"
        leftIcon="checkmark-done-outline"
        error={formErrors.confirmPassword}
        editable={!isLoading}
      />

      <AuthButton
        title="Update Credentials"
        onPress={handleResetPassword}
        isLoading={isLoading}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Remember your password?</Text>
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
