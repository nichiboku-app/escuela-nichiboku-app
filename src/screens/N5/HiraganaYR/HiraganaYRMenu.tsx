// src/screens/N5/HiraganaYR/HiraganaYRMenu.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import type { RootStackParamList } from "../../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HiraganaYRMenu() {
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Hiragana grupo Y–R (やゆよ・らりるれろ)</Text>
      <Text style={s.subtitle}>Actividades: audio interactivo, completar palabras</Text>

      <Pressable style={s.card} onPress={() => navigation.navigate("YR_AudioInteractivo")}>
        <Text style={s.cardTitle}>🔊 Audio interactivo</Text>
        <Text style={s.cardDesc}>Escucha, toca y repite las sílabas.</Text>
      </Pressable>

      <Pressable style={s.card} onPress={() => navigation.navigate("YR_CompletarPalabras")}>
        <Text style={s.cardTitle}>🧩 Completar palabras</Text>
        <Text style={s.cardDesc}>Arrastra/selecciona sílabas para formar palabras.</Text>
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
});
