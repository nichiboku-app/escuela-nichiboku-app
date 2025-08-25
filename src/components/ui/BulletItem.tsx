import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.row}>
      <Text style={s.dot}>{'\u2022'}</Text>
      <Text style={s.txt}>{children}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dot: { color: '#9E7C2F', fontSize: 18, lineHeight: 20, marginTop: -1 },
  txt: { color: '#1A1A1A', flex: 1, lineHeight: 20 },
});