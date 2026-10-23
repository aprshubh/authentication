import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { theme } from '@/constants/theme';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [pulseAnim] = useState(() => new Animated.Value(0.6));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.glowOrb, { opacity: pulseAnim }]} />
        <LinearGradient
          colors={theme.colors.gradientPrimary}
          style={styles.logoCircle}
        >
          <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.brandTitle}>AURA</Text>
        <Text style={styles.brandSubtitle}>ENTERPRISE AUTHENTICATION</Text>
        <ActivityIndicator
          size="small"
          color={theme.colors.primaryLight}
          style={styles.spinner}
        />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={'/(app)/(tabs)' as any} />;
  }

  return <Redirect href={'/(auth)/login' as any} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  glowOrb: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.glowPrimary,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginTop: 20,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 2,
    marginTop: 6,
  },
  spinner: {
    marginTop: 28,
  },
});
