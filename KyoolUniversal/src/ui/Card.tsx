import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function Card({ children, style }: CardProps) {
  const cardStyle: ViewStyle = {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...style,
  };

  return <View style={cardStyle}>{children}</View>;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  const headerStyle: ViewStyle = {
    marginBottom: 12,
    ...style,
  };

  return <View style={headerStyle}>{children}</View>;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={style}>{children}</View>;
}

export function CardTitle({ children, style }: CardTitleProps) {
  const titleStyle: TextStyle = {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    ...style,
  };

  return <Text style={titleStyle}>{children}</Text>;
}