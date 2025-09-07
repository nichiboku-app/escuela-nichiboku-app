// src/screens/N5/MemoriaGrupoK.tsx
import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    Vibration,
    View,
} from "react-native";
import type { RootStackParamList } from "../../../types";

// 🔊 Sonidos de acierto/error (tu hook)
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Card = {
  id: string;       // único
  value: string;    // か / き / く / け / こ
  flipped: boolean;
  matched: boolean;
};

const KANA = ["か", "き", "く", "け", "こ"] as const;
// ✅ 3 pares por letra = 6 cartas por kana
const PAIRS_PER_KANA = 3;

function makeDeck(): Card[] {
  const base: Card[] = [];
  for (const k of KANA) {
    for (let p = 0; p < PAIRS_PER_KANA; p++) {
      base.push({ id: `${k}_${p}_A`, value: k, flipped: false, matched: false });
      base.push({ id: `${k}_${p}_B`, value: k, flipped: false, matched: false });
    }
  }
  // Fisher–Yates
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base;
}

export default function MemoriaGrupoK() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });

  const [deck, setDeck] = useState<Card[]>(() => makeDeck());
  const [selected, setSelected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(5);
  const [best, setBest] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 🔊 Sonidos
  const { playCorrect, playWrong } = useFeedbackSounds?.() ?? {};

  // Más columnas para cartas pequeñas
  const columns = useMemo(() => {
    if (width >= 1000) return 8;
    if (width >= 800) return 7;
    return 6; // teléfonos
  }, [width]);

  const PADDING_H = 12;
  const GUTTER = 6;
  const cardWidth = useMemo(() => {
    return (width - PADDING_H * 2 - GUTTER * (columns - 1)) / columns;
  }, [width, columns]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("memoria_k_best_moves");
      if (raw) setBest(Number(raw));
    })();
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDeck(makeDeck());
    setSelected([]);
    setMoves(0);
    setDisabled(false);
    setWon(false);
    setGameOver(false);
    setLives(5);
  }, []);

  const allMatched = useMemo(() => deck.every((c) => c.matched), [deck]);

  useEffect(() => {
    if (allMatched && deck.length > 0) {
      setWon(true);
      (async () => {
        if (best === null || moves < best) {
          await AsyncStorage.setItem("memoria_k_best_moves", String(moves));
          setBest(moves);
        }
      })();
    }
  }, [allMatched, deck, best, moves]);

  const onCardPress = useCallback(
    (id: string) => {
      if (disabled || won || gameOver) return;

      // Voltear la carta pulsada
      setDeck((prev) =>
        prev.map((c) => (c.id === id && !c.flipped && !c.matched ? { ...c, flipped: true } : c))
      );

      // Gestión de selección
      setSelected((prevSel) => {
        const nextSel = [...prevSel, id];

        if (nextSel.length === 2) {
          setDisabled(true);
          setMoves((m) => m + 1);

          const [a, b] = nextSel;

          // ⚠️ Buscar en el estado "más reciente posible" (después de voltear 'id')
          const afterFlip = (d: Card[]) => d.find((c) => c.id === a)!;
          const afterFlipB = (d: Card[]) => d.find((c) => c.id === b)!;

          setDeck((current) => {
            const cardA = afterFlip(current);
            const cardB = afterFlipB(current);

            if (cardA && cardB) {
              if (cardA.value === cardB.value) {
                // ✅ Match por letra (NO requiere mismo par)
                Vibration.vibrate(18);
                playCorrect?.();
                const updated = current.map((c) =>
                  c.id === cardA.id || c.id === cardB.id ? { ...c, matched: true } : c
                );
                setDisabled(false);
                return updated;
              } else {
                // ❌ No match: restar vida y voltear de regreso solo esas dos
                Vibration.vibrate(45);
                playWrong?.();

                setLives((v) => {
                  const nextLives = v - 1;

                  timerRef.current = setTimeout(() => {
                    setDeck((flipBack) =>
                      flipBack.map((c) =>
                        c.id === cardA.id || c.id === cardB.id ? { ...c, flipped: false } : c
                      )
                    );
                    setDisabled(false);
                  }, 600);

                  if (nextLives <= 0) {
                    timerRef.current = setTimeout(() => setGameOver(true), 650);
                  }
                  return nextLives;
                });

                return current;
              }
            }
            setDisabled(false);
            return current;
          });

          return [];
        }

        return nextSel;
      });
    },
    [disabled, won, gameOver, playCorrect, playWrong]
  );

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Cargando…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header compacto */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnText}>← Atrás</Text>
        </Pressable>

        <Text style={styles.title}>Memoria — Grupo K</Text>

        <Pressable
          onPress={reset}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnText}>Reiniciar</Text>
        </Pressable>
      </View>

      {/* Info */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          Movimientos: <Text style={styles.infoStrong}>{moves}</Text>
        </Text>
        <Text style={styles.infoText}>
          Vidas: <Text style={[styles.infoStrong, lives <= 2 ? styles.danger : null]}>{lives}</Text>
        </Text>
        <Text style={styles.infoText}>
          Mejor: <Text style={styles.infoStrong}>{best ?? "—"}</Text>
        </Text>
      </View>

      {/* 🔽 Scroll vertical para “bajar más la pantalla” y que quepan muchas filas */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: PADDING_H,
          paddingBottom: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.grid,
            {
              gap: GUTTER,
            },
          ]}
        >
          {deck.map((card) => {
            const isFaceUp = card.flipped || card.matched;
            return (
              <Pressable
                key={card.id}
                onPress={() => onCardPress(card.id)}
                disabled={card.flipped || card.matched || disabled || gameOver || won}
                style={({ pressed }) => [
                  {
                    width: cardWidth,
                    aspectRatio: 0.68, // un poco más “bajitas”
                  },
                  styles.cardBase,
                  isFaceUp ? styles.cardUp : styles.cardDown,
                  pressed && !isFaceUp && styles.cardPressed,
                  card.matched && styles.cardMatched,
                ]}
              >
                <Text
                  style={[
                    styles.kana,
                    isFaceUp ? styles.kanaUp : styles.kanaHidden,
                  ]}
                >
                  {isFaceUp ? card.value : "?"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Modal de victoria */}
      <Modal transparent visible={won} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>¡Muy bien! 🎉</Text>
            <Text style={styles.modalText}>Completaste el juego en {moves} movimientos.</Text>
            <Pressable
              onPress={reset}
              style={({ pressed }) => [styles.modalBtn, pressed && styles.modalBtnPressed]}
            >
              <Text style={styles.modalBtnText}>Jugar otra vez</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Game Over */}
      <Modal transparent visible={gameOver && !won} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Game Over 💔</Text>
            <Text style={styles.modalText}>Te quedaste sin vidas. ¿Intentamos de nuevo?</Text>
            <Pressable
              onPress={reset}
              style={({ pressed }) => [styles.modalBtn, pressed && styles.modalBtnPressed]}
            >
              <Text style={styles.modalBtnText}>Reintentar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// src/screens/N5/MemoriaGrupoK.tsx
// ...todo tu código igual...

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FAF6EE",
    paddingTop: 90,   // 🔥 nuevo padding arriba de toda la pantalla
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 16, fontWeight: "700" },
  btn: {
    backgroundColor: "#E6D5A7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  btnPressed: { opacity: 0.85 },
  btnText: { fontWeight: "700" },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 6,
    gap: 8,
  },
  infoText: { fontSize: 13 },
  infoStrong: { fontWeight: "700" },
  danger: { color: "#C62828" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignContent: "flex-start",
  },

  cardBase: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  cardDown: { backgroundColor: "#FFF", borderColor: "#E7E0C9" },
  cardUp: { backgroundColor: "#FCEFC7", borderColor: "#E3C77A" },
  cardMatched: { backgroundColor: "#EAF7E6", borderColor: "#8BC34A" },
  cardPressed: { transform: [{ scale: 0.98 }] },
  kana: {
    fontSize: 20,
    fontFamily: "NotoSansJP_700Bold",
  },
  kanaHidden: { opacity: 0.15 },
  kanaUp: { opacity: 1 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "82%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: "#E3C77A",
  },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  modalText: { fontSize: 14, marginBottom: 12 },
  modalBtn: {
    alignSelf: "center",
    backgroundColor: "#E6D5A7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalBtnPressed: { opacity: 0.85 },
  modalBtnText: { fontWeight: "800" },
});
