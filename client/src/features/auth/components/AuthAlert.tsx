import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export interface AuthAlertProps {
  type?: 'error' | 'success' | 'info';
  message: string | null;
}

export const AuthAlert: React.FC<AuthAlertProps> = ({
  type = 'error',
  message,
}) => {
  const { colors } = useTheme();
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (message) {
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } else {
      anim.setValue(0);
    }
  }, [message, anim]);

  if (!message) return null;

  const iconName: keyof typeof Ionicons.glyphMap =
    type === 'success'
      ? 'checkmark-circle-outline'
      : type === 'info'
      ? 'information-circle-outline'
      : 'alert-circle-outline';

  const accentColor =
    type === 'success' ? colors.success : type === 'info' ? colors.primary : colors.error;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.surface, opacity: anim },
      ]}
    >
      <Ionicons name={iconName} size={17} color={accentColor} style={styles.icon} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
});
