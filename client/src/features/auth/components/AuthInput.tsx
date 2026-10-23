import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string | null;
  isPassword?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  isPassword = false,
  leftIcon,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword);

  const iconColor = error
    ? colors.error
    : isFocused
    ? colors.textPrimary
    : colors.textMuted;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.inputBackground },
          isFocused && { backgroundColor: colors.surface },
          Boolean(error) && styles.inputError,
        ]}
      >
        {leftIcon && (
          <Ionicons name={leftIcon} size={17} color={iconColor} style={styles.leftIcon} />
        )}

        <TextInput
          style={[styles.input, { color: colors.textPrimary }, style]}
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={isPassword ? isSecure : false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCorrect={false}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsSecure((p) => !p)}
            accessibilityRole="button"
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
            activeOpacity={0.7}
            style={styles.eyeButton}
          >
            <Ionicons
              name={isSecure ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={isFocused ? colors.textPrimary : colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {Boolean(error) && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputError: {
    // subtle ring handled via text only — keep borderless
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
    fontWeight: '400',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '400',
  },
});
