import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { theme } from '@/constants/theme';

export default function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href={'/(auth)/login' as any} />;
  }

  if (!user?.isEmailVerified) {
    return <Redirect href={'/(auth)/verify-email' as any} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    />
  );
}
