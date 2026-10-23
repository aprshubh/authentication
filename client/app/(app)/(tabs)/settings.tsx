import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { theme } from '@/constants/theme';

export default function SettingsScreen() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Settings</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Member'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'Signed-in account'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account security</Text>
        <View style={styles.group}>
          <View style={styles.statusRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.statusText}>
              <Text style={styles.rowTitle}>Email verification</Text>
              <Text style={styles.rowSubtitle}>
                {user?.isEmailVerified ? 'Your email is verified' : 'Verification is still required'}
              </Text>
            </View>
            <Ionicons
              name={user?.isEmailVerified ? 'checkmark-circle' : 'alert-circle-outline'}
              size={20}
              color={user?.isEmailVerified ? theme.colors.success : theme.colors.warning}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.statusRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="phone-portrait-outline" size={18} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.statusText}>
              <Text style={styles.rowTitle}>Active session policy</Text>
              <Text style={styles.rowSubtitle}>Only one device can be signed in at a time</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, isLoading && styles.disabled]}
          onPress={handleLogout}
          disabled={isLoading}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
          <Text style={styles.logoutText}>{isLoading ? 'Signing out…' : 'Sign out'}</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>AURA · Authentication</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  heading: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    marginBottom: 28,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  profileEmail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  sectionTitle: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  group: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  rowSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.md,
    height: 48,
    gap: 8,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 24,
  },
});
