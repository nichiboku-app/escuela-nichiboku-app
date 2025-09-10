import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ICONS = {
  // Subtemas Grupo A
  A_trazos:        require("../../../assets/icons/hiragana/A_trazos.webp"),
  A_pronunciacion: require("../../../assets/icons/hiragana/A_pronunciacion.webp"),
  A_ejemplos:      require("../../../assets/icons/hiragana/A_ejemplos.webp"),
  // Actividades Grupo A
  A_tarjetas:      require("../../../assets/icons/hiragana/A_tarjetas.webp"),
  A_trazo_animado: require("../../../assets/icons/hiragana/A_trazo_animado.webp"),
  A_dictado:       require("../../../assets/icons/hiragana/A_dictado_visual.webp"),
  // Subtemas Grupo K
  K_trazo:         require("../../../assets/icons/hiragana/K_trazo.webp"),
  K_vocabulario:   require("../../../assets/icons/hiragana/K_vocabulario.webp"),
  // Actividades Grupo K
  K_matching:      require("../../../assets/icons/hiragana/K_matching.webp"),
  K_memoria:       require("../../../assets/icons/hiragana/K_memoria.webp"),
};

type TileProps = {
  title: string;
  icon?: any;
  variant?: "red" | "gold";
  onPress: () => void;
};

function Tile({ title, icon, variant = "red", onPress }: TileProps) {
  const base = variant === "red" ? styles.tileRed : styles.tileGold;

  return (
    <View style={styles.tileCol}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.tileBox, base, pressed && styles.pressed]}
        hitSlop={12}
      >
        <View style={styles.innerFrame}>
          {icon && (
            <ExpoImage
              source={icon}
              style={{ width: 74, height: 74 }}
              contentFit="contain"
            />
          )}
        </View>
      </Pressable>
      <Text style={styles.tileLabel}>{title}</Text>
    </View>
  );
}

export default function HiraganaScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
      {/* Grupo A */}
      <Text style={styles.h1}>Subtemas Grupo A</Text>
      <View style={styles.grid}>
        <Tile
          title="Trazos"
          icon={ICONS.A_trazos}
          onPress={() => navigation.navigate("TrazosGrupoA")}
        />
        <Tile
          title="Pronunciación"
          icon={ICONS.A_pronunciacion}
          onPress={() => navigation.navigate("PronunciacionGrupoA")}
        />
        <Tile
          title="Ejemplos"
          icon={ICONS.A_ejemplos}
          onPress={() => navigation.navigate("EjemplosGrupoA")}
        />
      </View>

      <Text style={styles.h1}>Actividades Grupo A</Text>
      <View style={styles.grid}>
        <Tile
          title="Tarjetas"
          icon={ICONS.A_tarjetas}
          variant="gold"
          onPress={() => navigation.navigate("ATarjetas")}
        />
        <Tile
          title="Trazo animado"
          icon={ICONS.A_trazo_animado}
          variant="gold"
          onPress={() => navigation.navigate("ATrazoAnimado")}
        />
        <Tile
          title="Dictado visual"
          icon={ICONS.A_dictado}
          variant="gold"
          onPress={() => navigation.navigate("ADictadoVisual")}
        />
      </View>

      {/* Grupo K */}
      <Text style={styles.h1}>Subtemas Grupo K</Text>
      <View style={styles.grid}>
        <Tile
          title="Trazo"
          icon={ICONS.K_trazo}
          onPress={() => navigation.navigate("TrazoGrupoK")}
        />
        <Tile
          title="Vocabulario"
          icon={ICONS.K_vocabulario}
          onPress={() => navigation.navigate("VocabularioGrupoK")}
        />
      </View>

      <Text style={styles.h1}>Actividades Grupo K</Text>
      <View style={styles.grid}>
        <Tile
          title="Matching"
          icon={ICONS.K_matching}
          variant="gold"
          onPress={() => navigation.navigate("MatchingGrupoK")}
        />
        <Tile
          title="Memoria"
          icon={ICONS.K_memoria}
          variant="gold"
          onPress={() => navigation.navigate("MemoriaGrupoK")}
        />
      </View>

      {/* Nota inferior */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Aprende hiragana paso a paso. Practica trazos, pronunciación y vocabulario
          con actividades interactivas para que tu aprendizaje sea más dinámico y divertido.
        </Text>
      </View>

      {/* Botón para siguiente sección */}
      <View style={{ marginTop: 28, alignItems: "center" }}>
<Pressable
  style={({ pressed }) => [
    styles.nextButton,
    pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
  ]}
  onPress={() => navigation.navigate("FamiliaS")} // ✅ ruta corregida
>
  <Text style={styles.nextButtonText}>Ir a Familias S y T ➝</Text>
</Pressable>
      </View>
    </ScrollView>
  );
}

const RED = "#B32133";
const GOLD = "#E7A725";
const FRAME = "#0C0C0C";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 16 },

  h1: { fontSize: 22, fontWeight: "900", marginTop: 18, marginBottom: 12 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
    marginBottom: 10,
  },

  tileCol: { width: "31%", alignItems: "center" },

  tileBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 18,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  tileRed: { backgroundColor: RED },
  tileGold: { backgroundColor: GOLD },

  innerFrame: {
    width: "86%",
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: FRAME,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
  },

  tileLabel: { marginTop: 8, fontWeight: "800", color: "#1F2937" },

  infoCard: { marginTop: 18, borderRadius: 12, backgroundColor: "#F0F2F4", padding: 16 },
  infoText: { color: "#374151", textAlign: "center", fontWeight: "700" },

  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },

  nextButton: {
    backgroundColor: RED,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },
});
