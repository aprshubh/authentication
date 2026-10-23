import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { AuthAlert, AuthButton, AuthCard, AuthInput } from '@/features/auth/components';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { loginSchema } from '@/features/auth/schemas/auth.schema';
import { theme } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);

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
  };

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ email, password });

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
      await login(result.data);
      router.replace('/(app)/(tabs)' as any);
    } catch {
      // Handled by auth context
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to your account"
      iconName="lock-closed-outline"
      badgeText="SECURE LOGIN"
    >
      <AuthAlert type="error" message={authError} />

      <AuthInput
        label="Email Address"
        placeholder="name@company.com"
        value={email}
        onChangeText={(text) => handleInputChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        leftIcon="mail-outline"
        error={formErrors.email}
        editable={!isLoading}
      />

      <AuthInput
        label="Password"
        placeholder="Enter your security password"
        value={password}
        onChangeText={(text) => handleInputChange('password', text)}
        isPassword
        autoCapitalize="none"
        autoComplete="password"
        leftIcon="shield-outline"
        error={formErrors.password}
        editable={!isLoading}
      />

      <View style={styles.forgotPasswordContainer}>
        <Link href={'/(auth)/forgot-password' as any} asChild>
          <TouchableOpacity activeOpacity={0.7} disabled={isLoading}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <AuthButton
        title="Sign In to Dashboard"
        onPress={handleLogin}
        isLoading={isLoading}
      />

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{"Don't have an account?"}</Text>
        <Link href={'/(auth)/register' as any} asChild>
          <TouchableOpacity activeOpacity={0.7} disabled={isLoading}>
            <Text style={styles.footerLink}> Create Account</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888888',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1A1A1A',
  },
  dividerText: {
    color: '#444444',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 12,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#555555',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
