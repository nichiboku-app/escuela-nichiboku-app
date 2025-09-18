// src/screens/N5/HiraganaM/HiraganaMMenu.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "../../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HiraganaMMenu() {
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Hiragana grupo M (ま・み・む・め・も)</Text>
      <Text style={s.subtitle}>Actividades: dictado + práctica con voz</Text>

      <Pressable style={s.card} onPress={() => navigation.navigate("M_Dictado")}>
        <Text style={s.cardTitle}>📜 Dictado (M)</Text>
        <Text style={s.cardDesc}>Escucha y escribe las sílabas del grupo M.</Text>
      </Pressable>

      <Pressable style={s.card} onPress={() => navigation.navigate("M_PracticaVoz")}>
        <Text style={s.cardTitle}>🎤 Práctica con voz</Text>
        <Text style={s.cardDesc}>Pronuncia y recibe retroalimentación básica.</Text>
      </Pressable>

      {/* Botón para saltar a la siguiente unidad Y–R */}
      <Pressable style={s.nextBtn} onPress={() => navigation.navigate("HiraganaYRMenu")}>
        <Text style={s.nextTxt}>Ir a Y–R (やゆよ・らりるれろ)</Text>
      </Pressable>

      {/* Botón a W–N (わ・を・ん, contracciones) */}
      {/* Asegúrate de tener la ruta "HiraganaWNMenu" en tu RootStackParamList */}
      <Pressable style={[s.nextBtn, s.nextBtnAlt]} onPress={() => navigation.navigate("HiraganaWNMenu")}>
        <View style={{ alignItems: "center" }}>
          <Text style={s.nextTxt}>Ir a W–N (わ・を・ん / contracciones)</Text>
          <Text style={s.nextSmall}>Lectura de frases cortas y cierre con ん</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { fontSize: 14, opacity: 0.7, marginBottom: 8 },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardDesc: { fontSize: 13, opacity: 0.8, marginTop: 4 },

  nextBtn: {
    backgroundColor: "#000",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  nextTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  nextSmall: { color: "#fff", opacity: 0.8, fontSize: 12, marginTop: 4, fontWeight: "700" },

  // opcional: una ligera variación visual para el segundo botón
  nextBtnAlt: {
    borderWidth: 2,
    borderColor: "#111",
  },
});
