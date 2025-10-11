import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  children,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
      minHeight: 40,
    };

    const sizeStyles = {
      default: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 40 },
      sm: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 36 },
      lg: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 44 },
      icon: { paddingHorizontal: 8, paddingVertical: 8, minHeight: 40, width: 40 },
    };

    const variantStyles = {
      default: { backgroundColor: '#3b82f6', borderWidth: 0 },
      destructive: { backgroundColor: '#ef4444', borderWidth: 0 },
      outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e2e8f0' },
      secondary: { backgroundColor: '#f1f5f9', borderWidth: 0 },
      ghost: { backgroundColor: 'transparent', borderWidth: 0 },
      link: { backgroundColor: 'transparent', borderWidth: 0, paddingHorizontal: 0 },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    };

    const variantTextStyles = {
      default: { color: '#ffffff' },
      destructive: { color: '#ffffff' },
      outline: { color: '#0f172a' },
      secondary: { color: '#0f172a' },
      ghost: { color: '#0f172a' },
      link: { color: '#3b82f6', textDecorationLine: 'underline' as const },
    };

    return {
      ...baseStyle,
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading && <ActivityIndicator size="small" color={getTextStyle().color} style={{ marginRight: 8 }} />}
      {children || <Text style={getTextStyle()}>{title}</Text>}
    </TouchableOpacity>
  );
}