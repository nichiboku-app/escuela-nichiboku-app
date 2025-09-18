// src/screens/N5/ExamenFinal/ExamenFinalMapacheN5.tsx
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
export default function ExamenFinalMapacheN5() {
  return (
    <ScrollView contentContainerStyle={s.c}>
      <Text style={s.h}>Examen final 🦝 “Maestro Mapache N5”</Text>
      <View style={s.box}><Text>👉 Aquí armamos la evaluación integral.</Text></View>
    </ScrollView>
  );
}
const s = StyleSheet.create({ c:{padding:16,gap:12}, h:{fontSize:20,fontWeight:"900"}, box:{backgroundColor:"#fff",padding:16,borderRadius:14,borderWidth:1,borderColor:"#eee"}});