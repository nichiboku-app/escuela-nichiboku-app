// src/components/ui/GoldCard.tsx
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

export default function GoldCard({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[s.wrap, style]} {...rest}>
      <View style={s.inner}>{children}</View>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#C8A046', // gold
    backgroundColor: '#C8A046',
    padding: 3,
  },
  inner: {
    borderRadius: 12,
    backgroundColor: '#FFF7F2', // cream
    padding: 14,
  },
});
