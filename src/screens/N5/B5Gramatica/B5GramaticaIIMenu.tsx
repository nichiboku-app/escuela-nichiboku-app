// src/screens/N5/B5Gramatica/B5GramaticaIIMenu.tsx
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
export default function B5GramaticaIIMenu() {
  return (
    <ScrollView contentContainerStyle={s.c}>
      <Text style={s.h}>Bloque 5: Gramática II</Text>
      <View style={s.box}><Text>👉 Contadores, tiempo, frecuencia…</Text></View>
    </ScrollView>
  );
}
const s = StyleSheet.create({ c:{padding:16,gap:12}, h:{fontSize:20,fontWeight:"900"}, box:{backgroundColor:"#fff",padding:16,borderRadius:14,borderWidth:1,borderColor:"#eee"}});