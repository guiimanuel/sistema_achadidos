import React from 'react';
import { Text as RNText } from 'react-native';
import { theme } from '../styles/theme';

export default function Text({ variant = 'body', style, children, ...props }) {
  const variantStyle = theme.typography[variant] || theme.typography.body;

  return (
    <RNText style={[variantStyle, style]} {...props}>
      {children}
    </RNText>
  );
}
