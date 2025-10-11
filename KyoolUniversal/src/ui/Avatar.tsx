import React from 'react';
import { View, Image, Text, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface AvatarProps {
  source?: { uri: string } | number;
  size?: number;
  style?: ViewStyle;
  fallback?: string;
  onPress?: () => void;
}

interface AvatarImageProps {
  source: { uri: string } | number;
  style?: ImageStyle;
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Avatar({ source, size = 40, style, fallback }: AvatarProps) {
  const avatarStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...style,
  };

  const fallbackTextStyle: TextStyle = {
    fontSize: size * 0.4,
    fontWeight: '500',
    color: '#64748b',
  };

  return (
    <View style={avatarStyle}>
      {source ? (
        <Image
          source={source}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
        />
      ) : (
        <Text style={fallbackTextStyle}>
          {fallback || '?'}
        </Text>
      )}
    </View>
  );
}

export function AvatarImage({ source, style }: AvatarImageProps) {
  return (
    <Image
      source={source}
      style={[{ width: '100%', height: '100%' }, style]}
      resizeMode="cover"
    />
  );
}

export function AvatarFallback({ children, style }: AvatarFallbackProps) {
  const fallbackStyle: ViewStyle = {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    ...style,
  };

  return <View style={fallbackStyle}>{children}</View>;
}