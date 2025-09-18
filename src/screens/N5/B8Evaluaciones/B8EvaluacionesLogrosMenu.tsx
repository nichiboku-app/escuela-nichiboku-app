// src/screens/N5/B8Evaluaciones/B8EvaluacionesLogrosMenu.tsx
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
export default function B8EvaluacionesLogrosMenu() {
  return (
    <ScrollView contentContainerStyle={s.c}>
      <Text style={s.h}>Bloque 8: Evaluaciones y logros</Text>
      <View style={s.box}><Text>👉 Checkpoints, retos, medallas.</Text></View>
    </ScrollView>
  );
}
const s = StyleSheet.create({ c:{padding:16,gap:12}, h:{fontSize:20,fontWeight:"900"}, box:{backgroundColor:"#fff",padding:16,borderRadius:14,borderWidth:1,borderColor:"#eee"}});