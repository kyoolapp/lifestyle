import React from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle, TextStyle } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  ...props
}: InputProps) {
  const getInputStyle = (): TextStyle => ({
    borderWidth: 1,
    borderColor: error ? '#ef4444' : '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
    color: '#0f172a',
    minHeight: 40,
    ...inputStyle,
  });

  const getLabelStyle = (): TextStyle => ({
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 6,
    ...labelStyle,
  });

  const getErrorStyle = (): TextStyle => ({
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    ...errorStyle,
  });

  return (
    <View style={containerStyle}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}
      <TextInput
        style={getInputStyle()}
        placeholderTextColor="#64748b"
        {...props}
      />
      {error && <Text style={getErrorStyle()}>{error}</Text>}
    </View>
  );
}