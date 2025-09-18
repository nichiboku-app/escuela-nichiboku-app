import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RowKey = "A" | "K" | "S" | "T" | "N" | "H" | "M" | "Y" | "R" | "W";

/** Muestras de letras (solo visual en tarjetas) */
const A = ["ア","イ","ウ","エ","オ"];
const K = ["カ","キ","ク","ケ","コ"];
const S = ["サ","シ","ス","セ","ソ"];
const T = ["タ","チ","ツ","テ","ト"];
const N = ["ナ","ニ","ヌ","ネ","ノ"];
const H = ["ハ","ヒ","フ","ヘ","ホ"];
const M = ["マ","ミ","ム","メ","モ"];
const Y = ["ヤ","ユ","ヨ"];
const R = ["ラ","リ","ル","レ","ロ"];
const W = ["ワ","ヲ","ン"];

export default function KatakanaMenu() {
  const navigation = useNavigation<Nav>();

  const goRow = (row: RowKey) => {
    // push => fuerza nueva instancia de KatakanaRow y refresca la fila
    navigation.push("KatakanaRow", { row });
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Bloque 2: Katakana（カタカナ）</Text>
      <Text style={s.subtitle}>10 temas con práctica visual de trazos y lectura.</Text>

      <Pressable style={s.card} onPress={() => goRow("A")}>
        <Text style={s.cardTitle}>ア行 — tarjetas y audio</Text>
        <Text style={s.cardDesc}>{A.join("・")}</Text>
      </Pressable>

      <Pressable style={s.card} onPress={() => goRow("K")}>
        <Text style={s.cardTitle}>カ行 — matching</Text>
        <Text style={s.cardDesc}>{K.join("・")}</Text>
      </Pressable>

      <Pressable style={s.card} onPress={() => goRow("S")}>
        <Text style={s.cardTitle}>サ行 — drag & drop</Text>
        <Text style={s.cardDesc}>{S.join("・")}</Text>
      </Pressable>

      <Pressable style={s.card} onPress={() => goRow("T")}>
        <Text style={s.cardTitle}>タ行 — roleplay cafetería</Text>
        <Text style={s.cardDesc}>{T.join("・")}</Text>
      </Pressable>

      <Pressable style={s.card} onPress={() => goRow("N")}>
        <Text style={s.cardTitle}>ナ行 — canciones cortas</Text>
        <Text style={s.cardDesc}>{N.join("・")}</Text>
      </Pressable>

      <Pressable style={s.card} onPress={() => goRow("H")}>
        <Text style={s.cardTitle}>ハ行 — deportes</Text>
        <Text style={s.cardDesc}>{H.join("・")}</Text>
      </Pressable>

      <Pressable style={s.card} onPress={() => goRow("M")}>
        <Text style={s.cardTitle}>マ行 — nombres propios</Text>
        <Text style={s.cardDesc}>{M.join("・")}</Text>
      </Pressable>

      {/* Separados para que KatakanaRow reciba una sola fila */}
      <Pressable style={s.card} onPress={() => goRow("Y")}>
        <Text style={s.cardTitle}>ヤ行 — carteles</Text>
        <Text style={s.cardDesc}>{Y.join("・")}</Text>
      </Pressable>

      <Pressable style={s.card} onPress={() => goRow("R")}>
        <Text style={s.cardTitle}>ラ行 — carteles</Text>
        <Text style={s.cardDesc}>{R.join("・")}</Text>
      </Pressable>

      <Pressable style={[s.card, s.cardAccent]} onPress={() => goRow("W")}>
        <Text style={s.cardTitle}>ワ・ヲ・ン — préstamos</Text>
        <Text style={s.cardDesc}>{W.join("・")}</Text>
      </Pressable>

      <Pressable style={[s.card, s.cardAccent]} onPress={() => navigation.navigate("KatakanaChallenge")}>
        <Text style={s.cardTitle}>⚡ Katakana challenge</Text>
        <Text style={s.cardDesc}>Quiz cronometrado de palabras</Text>
      </Pressable>

      <View style={s.tipCard}>
        <Text style={s.tipTitle}>Consejo</Text>
        <Text style={s.tipItem}>
          Todas las pantallas incluyen los marcos de trazos con cuadrícula, números opcionales y botón de “Ampliar”.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { fontSize: 14, opacity: 0.7, marginBottom: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardAccent: { borderColor: "#B32133" },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardDesc: { fontSize: 13, opacity: 0.85, marginTop: 4 },
  tipCard: {
    backgroundColor: "#FFF8EF",
    borderColor: "#E7D8BF",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
  },
  tipTitle: { fontSize: 14, fontWeight: "900", color: "#111827", marginBottom: 6 },
  tipItem: { fontSize: 13, color: "#374151", marginTop: 2 },
});
