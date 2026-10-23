import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { theme } from '@/constants/theme';

export default function SettingsScreen() {
  const { user, logout, isLoading } = useAuth();
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

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
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Member'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'authenticated.user'}</Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>ACTIVE</Text>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <Text style={styles.sectionHeader}>Security</Text>
        <View style={styles.groupContainer}>
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconCircle}>
                <Ionicons name="finger-print" size={18} color="#888888" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Biometric Auth</Text>
                <Text style={styles.rowSubtitle}>FaceID or Fingerprint</Text>
              </View>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#1A1A1A', true: '#FFFFFF' }}
              thumbColor={biometricsEnabled ? '#000000' : '#555555'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconCircle}>
                <Ionicons name="notifications-outline" size={18} color="#888888" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Security Alerts</Text>
                <Text style={styles.rowSubtitle}>Push notification on logins</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#1A1A1A', true: '#FFFFFF' }}
              thumbColor={notificationsEnabled ? '#000000' : '#555555'}
            />
          </View>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.groupContainer}>
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconCircle}>
                <Ionicons name="shield-outline" size={18} color="#888888" />
              </View>
              <Text style={styles.rowTitle}>Active Authorizations</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#444444" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconCircle}>
                <Ionicons name="key-outline" size={18} color="#888888" />
              </View>
              <Text style={styles.rowTitle}>API Access Keys</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#444444" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color="#888888" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>Build 2026.10</Text>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    marginBottom: 28,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
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
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
    marginRight: 5,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 1,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 2,
  },
  groupContainer: {
    backgroundColor: '#111111',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  rowSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1A1A1A',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: theme.borderRadius.md,
    height: 48,
    marginTop: 4,
    marginBottom: 20,
    gap: 8,
  },
  logoutText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#333333',
    letterSpacing: 0.5,
  },
});
