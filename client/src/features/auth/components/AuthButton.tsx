import React, { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacityProps,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'ghost';
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  isLoading = false,
  variant = 'primary',
  disabled,
  style,
  onPress,
  ...props
}) => {
  const { colors } = useTheme();
  const isDisabled = disabled || isLoading;
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    if (isDisabled) return;
    Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    if (isDisabled) return;
    Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();
  };

  const isPrimary = variant === 'primary';

  const containerStyle = isPrimary
    ? { backgroundColor: colors.primary }
    : { backgroundColor: 'transparent' };

  const textColor = isPrimary ? colors.background : colors.textSecondary;

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      {...props}
    >
      <Animated.View
        style={[
          styles.button,
          containerStyle,
          isDisabled && styles.disabled,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
