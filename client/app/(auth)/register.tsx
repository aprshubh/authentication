import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { AuthAlert, AuthButton, AuthCard, AuthInput } from '@/features/auth/components';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { registerSchema } from '@/features/auth/schemas/auth.schema';
import { theme } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error: authError, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    field: 'name' | 'email' | 'password' | 'confirmPassword',
    value: string
  ) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
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
  };

  const handleRegister = async () => {
    const result = registerSchema.safeParse({
      name,
      email,
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
      await register({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      });
      router.replace('/(app)/(tabs)' as any);
    } catch {
      // Handled by auth context
    }
  };

  // Micro password strength indicator
  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 8) return { label: 'Too short', color: '#555555', width: '30%' };
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (hasNumber && hasSpecial && password.length >= 10) {
      return { label: 'Strong', color: '#FFFFFF', width: '100%' };
    }
    if (hasNumber || hasSpecial) {
      return { label: 'Medium', color: '#AAAAAA', width: '65%' };
    }
    return { label: 'Fair', color: '#666666', width: '45%' };
  };

  const strength = getPasswordStrength();

  return (
    <AuthCard
      title="Create Account"
      subtitle="Join with a secure account"
      iconName="person-add-outline"
      badgeText="NEW ACCOUNT"
    >
      <AuthAlert type="error" message={authError} />

      <AuthInput
        label="Full Name"
        placeholder="Alexander Wright"
        value={name}
        onChangeText={(text) => handleInputChange('name', text)}
        autoCapitalize="words"
        autoComplete="name"
        leftIcon="person-outline"
        error={formErrors.name}
        editable={!isLoading}
      />

      <AuthInput
        label="Email Address"
        placeholder="alexander@company.com"
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
        placeholder="Minimum 8 characters"
        value={password}
        onChangeText={(text) => handleInputChange('password', text)}
        isPassword
        autoCapitalize="none"
        autoComplete="new-password"
        leftIcon="key-outline"
        error={formErrors.password}
        editable={!isLoading}
      />

      {strength && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBarBg}>
            <View
              style={[
                styles.strengthBarFill,
                { width: strength.width as any, backgroundColor: strength.color },
              ]}
            />
          </View>
          <Text style={[styles.strengthText, { color: strength.color }]}>
            {strength.label}
          </Text>
        </View>
      )}

      <AuthInput
        label="Confirm Password"
        placeholder="Re-enter your password"
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
        title="Complete Registration"
        onPress={handleRegister}
        isLoading={isLoading}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
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
  strengthContainer: {
    marginBottom: 14,
    marginTop: -8,
  },
  strengthBarBg: {
    height: 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 4,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 1,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'right',
    color: '#666666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
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
