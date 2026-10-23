import React, { useEffect, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { theme } from '@/constants/theme';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                Hello, <Text style={styles.highlightName}>{user?.name || 'Member'}</Text>
              </Text>
              <Text style={styles.userEmail}>{user?.email || 'authenticated.user'}</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusCardHeader}>
              <View style={styles.statusTag}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#AAAAAA" />
                <Text style={styles.statusTagText}>AUTHENTICATED</Text>
              </View>
              <View style={styles.activeDot} />
            </View>
            <Text style={styles.statusTitle}>Session Active</Text>
            <Text style={styles.statusSubtitle}>
              Your session is protected by server-validated access tokens and email verification.
            </Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>STATUS</Text>
                <Text style={styles.metricValue}>Active</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>SESSION</Text>
                <Text style={styles.metricValue}>1 device</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>VERIFIED</Text>
                <Text style={styles.metricValue}>
                  {user?.isEmailVerified ? 'Yes' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.grid}>
            <View style={styles.gridCard}>
              <Ionicons name="finger-print" size={20} color="#AAAAAA" style={styles.gridIcon} />
              <Text style={styles.cardValue}>15 min</Text>
              <Text style={styles.cardLabel}>Access Token Lifetime</Text>
            </View>
            <View style={styles.gridCard}>
              <Ionicons name="phone-portrait-outline" size={20} color="#AAAAAA" style={styles.gridIcon} />
              <Text style={styles.cardValue}>Single</Text>
              <Text style={styles.cardLabel}>Session Policy</Text>
            </View>
          </View>

          {/* Recent Events */}
          <Text style={styles.sectionTitle}>Recent Events</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIconCircle}>
                <Ionicons name="key-outline" size={16} color="#888888" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Session Established</Text>
                <Text style={styles.activityDesc}>Token verified with server</Text>
              </View>
              <Text style={styles.activityTime}>Now</Text>
            </View>
            <View style={styles.activitySep} />
            <View style={styles.activityItem}>
              <View style={styles.activityIconCircle}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#888888" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Device Verified</Text>
                <Text style={styles.activityDesc}>Known platform matched</Text>
              </View>
              <Text style={styles.activityTime}>2m ago</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  highlightName: {
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 3,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusCard: {
    backgroundColor: '#111111',
    borderRadius: theme.borderRadius.xl,
    padding: 22,
    marginBottom: 28,
  },
  statusCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 1,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
  },
  statusTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  statusSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 6,
    lineHeight: 19,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: '#0A0A0A',
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#444444',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metricDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#1E1E1E',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: theme.borderRadius.lg,
    padding: 18,
  },
  gridIcon: {
    marginBottom: 14,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 3,
  },
  activityList: {
    backgroundColor: '#111111',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  activitySep: {
    height: 1,
    backgroundColor: '#1A1A1A',
  },
  activityIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  activityDesc: {
    fontSize: 11.5,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#444444',
  },
});
