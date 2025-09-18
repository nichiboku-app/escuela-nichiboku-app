// src/screens/N5/B7Lectura/B7LecturaPracticaMenu.tsx
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
export default function B7LecturaPracticaMenu() {
  return (
    <ScrollView contentContainerStyle={s.c}>
      <Text style={s.h}>Bloque 7: Lectura y práctica</Text>
      <View style={s.box}><Text>👉 Textos, dictados, comprensión.</Text></View>
    </ScrollView>
  );
}
const s = StyleSheet.create({ c:{padding:16,gap:12}, h:{fontSize:20,fontWeight:"900"}, box:{backgroundColor:"#fff",padding:16,borderRadius:14,borderWidth:1,borderColor:"#eee"}});