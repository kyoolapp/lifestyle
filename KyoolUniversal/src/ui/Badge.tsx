import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ children, variant = 'default', style, textStyle }: BadgeProps) {
  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
    };

    const variantStyles = {
      default: { backgroundColor: '#3b82f6', borderWidth: 0 },
      secondary: { backgroundColor: '#f1f5f9', borderWidth: 0 },
      destructive: { backgroundColor: '#ef4444', borderWidth: 0 },
      outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e2e8f0' },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 12,
      fontWeight: '500',
    };

    const variantTextStyles = {
      default: { color: '#ffffff' },
      secondary: { color: '#64748b' },
      destructive: { color: '#ffffff' },
      outline: { color: '#0f172a' },
    };

    return {
      ...baseStyle,
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  return (
    <View style={getBadgeStyle()}>
      <Text style={getTextStyle()}>{children}</Text>
    </View>
  );
}