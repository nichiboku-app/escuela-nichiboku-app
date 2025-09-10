// src/screens/N5/FamiliaS/FamiliaSScreen.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "../../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function OptionButton({
  title,
  subtitle,
  onPress,
  variant = "red",
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: "red" | "gold";
}) {
  const bg = variant === "red" ? styles.cardRed : styles.cardGold;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, bg, pressed && styles.pressed]}
      hitSlop={12}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </Pressable>
  );
}

export default function FamiliaSScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
      <Text style={styles.h1}>Hiragana — Familias S y T</Text>

      {/* ======= Grupo S ======= */}
      <Text style={styles.sectionTitle}>Grupo S（さ・し・す・せ・そ）</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Trabaja la <Text style={styles.bold}>escritura</Text> y{" "}
          <Text style={styles.bold}>ejemplos</Text>; luego practica con{" "}
          <Text style={styles.bold}>caligrafía digital</Text> y{" "}
          <Text style={styles.bold}>lectura de sílabas</Text>.
        </Text>
      </View>

      <Text style={styles.h2}>Subtemas</Text>
      <View style={styles.grid}>
        <OptionButton
          title="Escritura (S)"
          subtitle="Orden de trazos y forma correcta"
          onPress={() => navigation.navigate("SEscrituraGrupoS")}
          variant="red"
        />
        <OptionButton
          title="Ejemplos (S)"
          subtitle="Palabras con さ・し・す・せ・そ"
          onPress={() => navigation.navigate("SEjemplosGrupoS")}
          variant="red"
        />
      </View>

      <Text style={styles.h2}>Actividades</Text>
      <View style={styles.grid}>
        <OptionButton
          title="Caligrafía digital (S)"
          subtitle="Práctica guiada en pantalla"
          onPress={() => navigation.navigate("SCaligrafiaDigital")}
          variant="gold"
        />
        <OptionButton
          title="Lectura de sílabas (S)"
          subtitle="Reconoce y pronuncia correctamente"
          onPress={() => navigation.navigate("SLecturaSilabas")}
          variant="gold"
        />
      </View>

      {/* ======= Grupo T ======= */}
      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
        Grupo T（た・ち・つ・て・と）
      </Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Aquí trabajarás actividades enfocadas en el{" "}
          <Text style={styles.bold}>trazo</Text> y la{" "}
          <Text style={styles.bold}>escucha</Text>.
        </Text>
      </View>

      <Text style={styles.h2}>Actividades</Text>
      <View style={styles.grid}>
        <OptionButton
          title="Gif interactivo del trazo (T)"
          subtitle="Visualiza y repite el trazo"
          onPress={() => navigation.navigate("TTrazoGif")}
          variant="gold"
        />
        <OptionButton
          title="Quiz de escucha (T)"
          subtitle="Identifica た・ち・つ・て・と por audio"
          onPress={() => navigation.navigate("TQuizEscucha")}
          variant="gold"
        />
      </View>
    </ScrollView>
  );
}

const RED = "#B32133";
const GOLD = "#E7A725";
const FRAME = "#0C0C0C";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 16 },

  h1: { fontSize: 24, fontWeight: "900", marginTop: 18, marginBottom: 8, color: "#111827" },

  sectionTitle: { fontSize: 20, fontWeight: "900", color: "#111827", marginTop: 8, marginBottom: 8 },

  infoBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: FRAME,
    marginBottom: 10,
  },
  infoText: { color: "#374151", fontWeight: "700" },
  bold: { fontWeight: "900" },

  h2: { fontSize: 18, fontWeight: "900", marginTop: 14, marginBottom: 8, color: "#111827" },

  grid: { gap: 12 },

  card: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: FRAME,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardRed: { backgroundColor: RED },
  cardGold: { backgroundColor: GOLD },

  cardTitle: { color: "#fff", fontWeight: "900", fontSize: 18 },
  cardSubtitle: { color: "rgba(255,255,255,0.95)", fontWeight: "700", marginTop: 4 },

  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
});
