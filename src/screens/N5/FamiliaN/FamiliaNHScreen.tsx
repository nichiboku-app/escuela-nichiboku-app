import { Ionicons } from "@expo/vector-icons";
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
  variant = "gold",
  icon,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: "red" | "gold";
  icon?: React.ReactNode;
}) {
  const bg = variant === "red" ? styles.cardRed : styles.cardGold;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, bg, pressed && styles.pressed]}
      hitSlop={12}
    >
      <View style={styles.cardRow}>
        {!!icon && <View style={styles.iconBubble}>{icon}</View>}
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </Pressable>
  );
}

export default function FamiliaNHScreen() {
  const navigation = useNavigation<Nav>();
  const go = (route: string) => (navigation as any).navigate(route as never);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
      <Text style={styles.h1}>Hiragana — Familias N y H</Text>

      {/* ======= Grupo N ======= */}
      <Text style={styles.sectionTitle}>Grupo N（な・に・ぬ・ね・の）</Text>
      <View style={[styles.infoBox, { backgroundColor: "#FFF8DC" }]}>
        <Text style={styles.infoText}>
          Harás <Text style={styles.bold}>lectura guiada</Text> asociando{" "}
          <Text style={styles.bold}>imágenes</Text> con palabras de な・に・ぬ・ね・の — refuerza
          tu <Text style={styles.bold}>comprensión</Text> y{" "}
          <Text style={styles.bold}>pronunciación</Text>.
        </Text>
      </View>

      <Text style={styles.h2}>Actividades</Text>
      <View style={styles.grid}>
        <OptionButton
          title="Lectura guiada con imágenes (N)"
          subtitle="📖🎴 Asocia imágenes y lee en voz alta"
          onPress={() => go("NLecturaGuiada")}
          variant="gold"
          icon={<Ionicons name="book" size={22} color="#111827" />}
        />
      </View>

      {/* ======= Grupo H ======= */}
      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
        Grupo H（は・ひ・ふ・へ・ほ）
      </Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Practicarás un <Text style={styles.bold}>roleplay</Text> para presentarte:
          “hola, me llamo …” usando la partícula <Text style={styles.bold}>は</Text> (wa).
        </Text>
      </View>

      <Text style={styles.h2}>Actividades</Text>
      <View style={styles.grid}>
        <OptionButton
          title='Roleplay: "Hola, me llamo..." (H)'
          subtitle="🎤 Usa は para presentarte correctamente"
          onPress={() => go("HRoleplaySaludo")}
          variant="gold"
          icon={<Ionicons name="mic" size={22} color="#111827" />}
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBubble: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: FRAME,
  },
  cardRed: { backgroundColor: RED },
  cardGold: { backgroundColor: GOLD },

  cardTitle: { color: "#fff", fontWeight: "900", fontSize: 18 },
  cardSubtitle: { color: "rgba(255,255,255,0.95)", fontWeight: "700", marginTop: 2 },

  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
});
