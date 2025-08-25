// src/components/ui/ChipTag.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function ChipTag({ icon, label }: { icon?: React.ReactNode, label: string }) {
  return (
    <View style={s.chip}>
      {icon}
      <Text style={s.txt}>{label}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#FDE7E7',
    borderWidth: 1, borderColor: '#C8A046',
  },
  txt: { color: '#A93226', fontWeight: '700' },
});
