import * as Speech from "expo-speech";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    Vibration,
    View,
} from "react-native";
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

type Item = {
  id: string;
  word: string;         // palabra en hiragana (ej: あめ)
  missingIndex: number; // índice donde falta la vocal
  romaji?: string;
  es?: string;          // pista
};

const VOWELS = ["あ", "い", "う", "え", "お"] as const;

const DECK_BASE: Item[] = [
  { id: "ame", word: "あめ", missingIndex: 0, romaji: "ame", es: "lluvia" },
  { id: "inu", word: "いぬ", missingIndex: 0, romaji: "inu", es: "perro" },
  { id: "umi", word: "うみ", missingIndex: 0, romaji: "umi", es: "mar" },
  { id: "eki", word: "えき", missingIndex: 0, romaji: "eki", es: "estación" },
  { id: "oni", word: "おに", missingIndex: 0, romaji: "oni", es: "ogro/demonio" },
];

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AVocalFill() {
  const [useShuffle, setUseShuffle] = useState(true);
  const deck = useMemo(() => (useShuffle ? shuffle(DECK_BASE) : DECK_BASE), [useShuffle]);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showRomaji, setShowRomaji] = useState(true);
  const [showHintES, setShowHintES] = useState(true);
  const [locked, setLocked] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const item = deck[index];
  const correctVowel = item?.word[item.missingIndex] ?? "";
  const gaps = useMemo(() => {
    if (!item) return { left: "", right: "" };
    const chars = Array.from(item.word);
    const left = chars.slice(0, item.missingIndex).join("");
    const right = chars.slice(item.missingIndex + 1).join("");
    return { left, right };
  }, [item]);

  // Sonidos (hook)
  const { playCorrect, playWrong } = useFeedbackSounds();

  // Flash
  const flash = useRef(new Animated.Value(0)).current;
  const flashColor = flash.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", "rgba(51,160,111,0.16)"],
  });

  const speak = useCallback(() => {
    if (!item) return;
    Speech.stop();
    Speech.speak(item.word, { language: "ja-JP", rate: 0.92, pitch: 1.0 });
  }, [item]);

  const vibrate = (ms = 10) => Vibration.vibrate(ms);

  // Toques ultrarrápidos
  const selectingRef = useRef(false);

  const choose = useCallback(
    (choice: string) => {
      if (!item || locked || selectingRef.current) return;
      selectingRef.current = true;
      setLocked(true);

      const ok = choice === correctVowel;
      setLastCorrect(ok);

      if (ok) {
        playCorrect();
        vibrate(8);
        setScore((s) => s + 1);
        Animated.sequence([
          Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: false }),
          Animated.timing(flash, { toValue: 0, duration: 120, useNativeDriver: false }),
        ]).start();
      } else {
        playWrong();
        vibrate(25);
      }

      requestAnimationFrame(() => (selectingRef.current = false));
    },
    [item, correctVowel, locked, playCorrect, playWrong, flash]
  );

  const next = () => {
    if (!item) return;
    setLocked(false);
    setLastCorrect(null);
    setIndex((i) => (i + 1 >= deck.length ? 0 : i + 1));
  };

  const retry = () => {
    setLocked(false);
    setLastCorrect(null);
  };

  const total = deck.length;
  const pct = Math.round((score / Math.max(total, 1)) * 100);

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text>No hay elementos en el deck.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pon la vocal</Text>
        <View style={styles.row}>
          <Text style={styles.meta}>Progreso: {index + 1}/{total}</Text>
          <Text style={styles.meta}>Aciertos: {score} ({pct}%)</Text>
        </View>
      </View>

      {/* Toggles */}
      <View style={styles.toggles}>
        <Toggle label="Barajar" value={useShuffle} onPress={() => setUseShuffle(v => !v)} />
        <Toggle label="Romaji" value={showRomaji} onPress={() => setShowRomaji(v => !v)} />
        <Toggle label="Pista ES" value={showHintES} onPress={() => setShowHintES(v => !v)} />
        <Pressable style={styles.ttsBtn} onPress={speak}>
          <Text style={styles.ttsBtnText}>▶︎ TTS</Text>
        </Pressable>
      </View>

      {/* Palabra con hueco */}
      <Animated.View
        pointerEvents="box-none"
        style={[styles.card, lastCorrect ? { backgroundColor: flashColor as any } : null]}
      >
        <Text style={styles.word}>
          {gaps.left}
          <Text style={styles.gap}>＿</Text>
          {gaps.right}
        </Text>
        {showRomaji && <Text style={styles.romaji}>{item.romaji}</Text>}
        {showHintES && !!item.es && <Text style={styles.hint}>Pista: {item.es}</Text>}
      </Animated.View>

      {/* Opciones */}
      <View style={styles.choices}>
        {VOWELS.map((v) => {
          const isCorrect = locked && v === correctVowel;
          const bg = !locked ? "#EDE5D7" : isCorrect ? "#33A06F" : "#C05746";
          const fg = !locked ? "#3B2F2F" : "#fff";
          return (
            <Pressable
              key={v}
              onPressIn={() => choose(v)} // instantáneo
              disabled={locked}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
              style={({ pressed }) => [
                styles.choice,
                { backgroundColor: bg },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={[styles.choiceText, { color: fg }]}>{v}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Acciones */}
      <View style={styles.actions}>
        <Button label="Reintentar" onPress={retry} disabled={!locked} />
        <Button label="Siguiente ▶︎" onPress={next} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Toca la vocal correcta para completar la palabra.</Text>
      </View>
    </SafeAreaView>
  );
}

/* ===== UI helpers ===== */
function Toggle({ label, value, onPress }: { label: string; value: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.knob, value && styles.knobOn]} />
      <Text style={styles.toggleText}>{label}</Text>
    </Pressable>
  );
}

function Button({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPressIn={onPress}
      disabled={!!disabled}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
      style={({ pressed }) => [
        styles.btn,
        disabled && { opacity: 0.45 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

/* ===== Estilos ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F3EA" },
  center: { alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  title: { fontSize: 22, fontWeight: "800", color: "#2F2A24" },
  row: { flexDirection: "row", gap: 16, marginTop: 4 },
  meta: { fontSize: 12, color: "#6B5F5A" },

  toggles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ttsBtn: {
    marginLeft: "auto",
    backgroundColor: "#2F2A24",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ttsBtnText: { color: "#fff", fontWeight: "800" },

  card: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    paddingVertical: 24,
    borderRadius: 16,
  },
  word: { fontSize: 64, textAlign: "center", fontWeight: "800", color: "#2F2A24" },
  gap: { color: "#C79A3E" },
  romaji: { marginTop: 6, fontSize: 16, textAlign: "center", color: "#6B5F5A" },
  hint: { marginTop: 2, fontSize: 13, textAlign: "center", color: "#8B7F77" },

  choices: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    zIndex: 10,
    elevation: 10,
  },
  choice: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#EDE5D7",
  },
  choiceText: { fontSize: 22, fontWeight: "800", color: "#3B2F2F" },

  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  btn: {
    flex: 1,
    backgroundColor: "#2F2A24",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontWeight: "800" },

  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#EDE5D7",
    borderRadius: 999,
  },
  toggleOn: { backgroundColor: "#C79A3E" },
  knob: { width: 16, height: 16, borderRadius: 999, backgroundColor: "#C9BBA5" },
  knobOn: { backgroundColor: "#FFF" },
  toggleText: { fontSize: 12, color: "#3B2F2F", fontWeight: "700" },

  footer: { alignItems: "center", paddingVertical: 10 },
  footerText: { fontSize: 12, color: "#6B5F5A" },
});
