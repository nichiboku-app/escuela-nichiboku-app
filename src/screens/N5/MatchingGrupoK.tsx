// src/screens/N5/MatchingGrupoK.tsx
import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import React, { useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import {
  State as RNGHState,
  TapGestureHandler,
} from "react-native-gesture-handler";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

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

/** ===== Botón basado en gesto (a prueba de A55) ===== */
function CardTap({
  children,
  onTap,
  active,
  locked,
  simultaneousHandlers,
}: {
  children: React.ReactNode;
  onTap: () => void;
  active?: boolean;
  locked?: boolean;
  simultaneousHandlers?: any;
}) {
  const tapRef = useRef<any>(null);

  return (
    <TapGestureHandler
      ref={tapRef}
      enabled={!locked}
      maxDeltaX={10}        // tolerancia de desplazamiento horizontal
      maxDeltaY={10}        // tolerancia de desplazamiento vertical
      maxDist={12}          // tolerancia de distancia total
      numberOfTaps={1}
      shouldCancelWhenOutside={false}
      simultaneousHandlers={simultaneousHandlers}
      onHandlerStateChange={(e) => {
        if (e.nativeEvent.state === RNGHState.ACTIVE) {
          onTap();
        }
      }}
    >
      <View
        // estilo de "botón" visual
        style={[
          styles.card,
          locked && styles.cardLocked,
          active && styles.cardActive,
        ]}
      >
        {/* pointerEvents="none" para que texto no intercepte */}
        <View pointerEvents="none">{children}</View>
      </View>
    </TapGestureHandler>
  );
}

/** ===== Pantalla ===== */
export default function MatchingGrupoK() {
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });

  const { playCorrect, playWrong } = useFeedbackSounds();

  const [roundSeed, setRoundSeed] = useState(0);
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

  // ref para permitir gestos simultáneos con el ScrollView
  const scrollSimultaneousRef = useRef<any>(null);

  const handleTap = async (side: SideKey, key: string) => {
    if (matched.includes(key)) return;

    if (!selected) {
      setSelected({ side, key });
      return;
    }
    if (selected.side === side) {
      setSelected({ side, key });
      return;
    }

    const a = selected.key;
    const b = key;
    const ok = a === b;
    setAttempts(x => x + 1);

    if (ok) {
      setMatched(prev => [...prev, a]);
      setScore(x => x + 1);
      setSelected(null);
      await playCorrect();
      Vibration.vibrate(12);
    } else {
      await playWrong();
      Vibration.vibrate(30);
      setSelected({ side, key });
    }
  };

  const resetRound = () => {
    setRoundSeed(s => s + 1);
    setSelected(null);
    setMatched([]);
    setScore(0);
    setAttempts(0);
    Vibration.vibrate(15);
  };

  return (
    <ScrollView
      ref={scrollSimultaneousRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
      keyboardShouldPersistTaps="always"  // más agresivo que "handled"
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
              <CardTap
                key={`L-${c.key}`}
                onTap={() => handleTap("left", c.key)}
                active={active}
                locked={locked}
                simultaneousHandlers={scrollSimultaneousRef}
              >
                <Text
                  style={[
                    styles.cardTextJP,
                    fontsLoaded && { fontFamily: "NotoSansJP_700Bold" },
                  ]}
                >
                  {c.label}
                </Text>
              </CardTap>
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
              <CardTap
                key={`R-${c.key}`}
                onTap={() => handleTap("right", c.key)}
                active={active}
                locked={locked}
                simultaneousHandlers={scrollSimultaneousRef}
              >
                <Text style={styles.cardTextES}>{c.label}</Text>
              </CardTap>
            );
          })}
        </View>
      </View>

      {/* Controles */}
      <TapGestureHandler
        maxDeltaX={10}
        maxDeltaY={10}
        maxDist={12}
        simultaneousHandlers={scrollSimultaneousRef}
        onHandlerStateChange={(e) => {
          if (e.nativeEvent.state === RNGHState.ACTIVE) resetRound();
        }}
      >
        <View style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>{isDone ? "Nueva ronda" : "Rebarajar"}</Text>
        </View>
      </TapGestureHandler>
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

  primaryBtn: {
    alignSelf: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },
});
