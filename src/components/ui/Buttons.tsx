// src/components/ui/Buttons.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

export function PrimaryButton({ title, onPress, style }: { title: string; onPress: () => void; style?: ViewStyle }) {
  return (
    <Pressable onPress={onPress} style={({pressed})=>[s.primary, style, pressed && { transform:[{ scale:0.98 }] }]}>
      <Text style={s.primaryTxt}>{title}</Text>
    </Pressable>
  );
}
export function GhostButton({ title, onPress, style }: { title: string; onPress: () => void; style?: ViewStyle }) {
  return (
    <Pressable onPress={onPress} style={({pressed})=>[s.ghost, style, pressed && { opacity: 0.9 }]}>
      <Text style={s.ghostTxt}>{title}</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  primary: {
    backgroundColor: '#B71C1C', borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', borderWidth: 2, borderColor: '#C8A046',
  },
  primaryTxt: { color:'#fff', fontWeight:'800', fontSize:16 },
  ghost: {
    borderWidth:2, borderColor:'#C8A046', backgroundColor:'#FFEFE6',
    borderRadius:14, paddingVertical:12, alignItems:'center',
  },
  ghostTxt: { color:'#1A1A1A', fontWeight:'700' },
});
