// src/screens/N5/MatchingGrupoK.tsx
import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import React, { useMemo, useState } from "react";
import {
  GestureResponderEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds"; // 🔊 verifica la ruta

/** ===== Dataset base (K/G) ===== */
type Item = { id: string; jp: string; es: string };

const BANK: Item[] = [
  // K
  { id: "k1", jp: "かさ", es: "paraguas" },
  { id: "k2", jp: "かぎ", es: "llave" },
  { id: "k3", jp: "き", es: "árbol" },
  { id: "k4", jp: "くち", es: "boca" },
  { id: "k5", jp: "くるま", es: "auto" },
  { id: "k6", jp: "けいさつ", es: "policía" },
  { id: "k7", jp: "こども", es: "niño/niña" },
  { id: "k8", jp: "ことば", es: "palabra/idioma" },
  // G
  { id: "g1", jp: "がくせい", es: "estudiante" },
  { id: "g2", jp: "ぎんこう", es: "banco" },
  { id: "g3", jp: "ごはん", es: "arroz/comida" },
  { id: "g4", jp: "ごご", es: "p.m. (tarde)" },
  { id: "g5", jp: "げんき", es: "animado/sano" },
  { id: "g6", jp: "ぐんて", es: "guantes (trabajo)" },
];

/** ===== Utils ===== */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickN<T>(data: T[], n: number) {
  return shuffle(data).slice(0, n);
}

type SideKey = "left" | "right";

/** ===== Pantalla ===== */
export default function MatchingGrupoK() {
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });

  // 🔊 Sonidos de feedback
  const { playCorrect, playWrong } = useFeedbackSounds();

  const [roundSeed, setRoundSeed] = useState(0); // para rebarajar por ronda
  const roundPairs = useMemo(() => pickN(BANK, 6), [roundSeed]);
  const leftCards = useMemo(
    () => shuffle(roundPairs.map(p => ({ key: p.id, label: p.jp }))),
    [roundPairs]
  );
  const rightCards = useMemo(
    () => shuffle(roundPairs.map(p => ({ key: p.id, label: p.es }))),
    [roundPairs]
  );

  const [selected, setSelected] = useState<{ side: SideKey; key: string } | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const isDone = matched.length === roundPairs.length;

  const handlePress = async (side: SideKey, key: string, _e?: GestureResponderEvent) => {
    if (matched.includes(key)) return; // ya resuelto

    if (!selected) {
      setSelected({ side, key });
      return;
    }

    // Si vuelve a tocar el mismo lado, solo cambia la selección
    if (selected.side === side) {
      setSelected({ side, key });
      return;
    }

    // Comparar con el opuesto
    const a = selected.key;
    const b = key;
    const ok = a === b; // comparten id
    setAttempts(x => x + 1);

    if (ok) {
      setMatched(prev => [...prev, a]);
      setScore(x => x + 1);
      setSelected(null);
      await playCorrect();   // ✅ sonido acierto
      Vibration.vibrate(12); // ✅ vibración sutil en acierto
    } else {
      await playWrong();     // ❌ sonido error
      Vibration.vibrate(30); // ❌ vibración un poco más fuerte
      // Deja seleccionado el lado recién tocado para probar otra combinación
      setSelected({ side, key });
    }
  };

  const resetRound = () => {
    setRoundSeed(s => s + 1);
    setSelected(null);
    setMatched([]);
    setScore(0);
    setAttempts(0);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled" // 👈 evita que el Scroll “trague” los taps
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Matching — Grupo K</Text>
        <Text style={styles.subtitle}>Empareja el japonés con su significado</Text>
      </View>

      {/* Marcadores */}
      <View style={styles.hud}>
        <View style={styles.hudPill}><Text style={styles.hudText}>Aciertos: {score}</Text></View>
        <View style={styles.hudPill}><Text style={styles.hudText}>Intentos: {attempts}</Text></View>
        {isDone && (
          <View style={[styles.hudPill, styles.hudWin]}>
            <Text style={styles.hudTextWin}>¡Completado! 🎉</Text>
          </View>
        )}
      </View>

      {/* Tablero */}
      <View style={styles.board}>
        {/* Columna Izquierda (Japonés) */}
        <View style={styles.col}>
          <Text style={styles.colTitle}>Japonés</Text>

          {leftCards.map(c => {
            const locked = matched.includes(c.key);
            const active = selected?.side === "left" && selected.key === c.key;

            return (
              <TouchableOpacity
                key={`L-${c.key}`}
                activeOpacity={0.65}
                delayPressIn={0}
                delayPressOut={0}
                onPress={(e) => handlePress("left", c.key, e)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={[
                  styles.card,
                  locked && styles.cardLocked,
                  active && styles.cardActive,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active, disabled: locked }}
              >
                {/* 👇 Al tener pointerEvents="none", tocar el texto también dispara el contenedor */}
                <Text
                  pointerEvents="none"
                  style={[styles.cardTextJP, fontsLoaded && { fontFamily: "NotoSansJP_700Bold" }]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Columna Derecha (Español) */}
        <View style={styles.col}>
          <Text style={styles.colTitle}>Español</Text>

          {rightCards.map(c => {
            const locked = matched.includes(c.key);
            const active = selected?.side === "right" && selected.key === c.key;

            return (
              <TouchableOpacity
                key={`R-${c.key}`}
                activeOpacity={0.65}
                delayPressIn={0}
                delayPressOut={0}
                onPress={(e) => handlePress("right", c.key, e)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={[
                  styles.card,
                  locked && styles.cardLocked,
                  active && styles.cardActive,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active, disabled: locked }}
              >
                <Text pointerEvents="none" style={styles.cardTextES}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.8}
          delayPressIn={0}
          delayPressOut={0}
          onPress={() => { resetRound(); Vibration.vibrate(15); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text pointerEvents="none" style={styles.primaryBtnText}>
            {isDone ? "Nueva ronda" : "Rebarajar"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/** ===== Estilos ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: { padding: 20, backgroundColor: "#a41034" },
  title: { color: "#fff", fontWeight: "900", fontSize: 22 },
  subtitle: { color: "#FBE8E8", marginTop: 6 },

  hud: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    flexWrap: "wrap",
  },
  hudPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  hudText: { color: "#fff", fontWeight: "800" },
  hudWin: { backgroundColor: "#059669" },
  hudTextWin: { color: "#fff", fontWeight: "900" },

  board: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  col: { flex: 1 },
  colTitle: { fontWeight: "900", marginBottom: 8, color: "#111827" },

  card: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  cardActive: { borderColor: "#6366F1", backgroundColor: "#EEF2FF" },
  cardLocked: { borderColor: "#10B981", backgroundColor: "#ECFDF5" },

  cardTextJP: { fontSize: 20, color: "#111827", textAlign: "center" },
  cardTextES: { fontSize: 16, color: "#111827", textAlign: "center", fontWeight: "700" },

  controls: { alignItems: "center", marginTop: 8 },
  primaryBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },
});
