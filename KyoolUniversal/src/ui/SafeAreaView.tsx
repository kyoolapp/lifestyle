import React from 'react';
import { SafeAreaView as RNSafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

interface CustomSafeAreaViewProps extends SafeAreaViewProps {
  children: React.ReactNode;
}

export function SafeAreaView({ children, ...props }: CustomSafeAreaViewProps) {
  return (
    <RNSafeAreaView {...props}>
      {children}
    </RNSafeAreaView>
  );
}