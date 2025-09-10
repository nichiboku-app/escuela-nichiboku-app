// src/screens/N5/FamiliaT/TQuizEscucha.tsx
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { useFeedbackSounds } from "../../../../src/hooks/useFeedbackSounds";

/* ============== Datos ============== */
type KanaKeyT = "ta" | "chi" | "tsu" | "te" | "to";
type QuizItem = {
  key: KanaKeyT;
  hira: string;
  romaji: string;
  example: { jp: string; romaji: string; es: string };
};

const BANK: QuizItem[] = [
  { key: "ta",  hira: "た", romaji: "ta",  example: { jp: "たまご", romaji: "tamago", es: "huevo" } },
  { key: "chi", hira: "ち", romaji: "chi", example: { jp: "ちず",   romaji: "chizu",  es: "mapa" } },
  { key: "tsu", hira: "つ", romaji: "tsu", example: { jp: "つき",   romaji: "tsuki",  es: "luna" } },
  { key: "te",  hira: "て", romaji: "te",  example: { jp: "てがみ", romaji: "tegami", es: "carta" } },
  { key: "to",  hira: "と", romaji: "to",  example: { jp: "とけい", romaji: "tokei",  es: "reloj" } },
];

/* ============== Utils ============== */
function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ============== Pantalla ============== */
export default function TQuizEscucha() {
  const [useShuffle, setUseShuffle] = useState(true);
  const deck = useMemo(() => (useShuffle ? shuffle(BANK) : BANK), [useShuffle]);

  const [showRomaji, setShowRomaji] = useState(false);
  const [showHintES, setShowHintES] = useState(true);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<KanaKeyT | null>(null);

  const item = deck[round];

  // ✅ Sonidos de feedback
  const { playCorrect, playWrong, ready: sndReady } = useFeedbackSounds();

  // === Voz japonesa
  const [jaVoiceId, setJaVoiceId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const vs = await Speech.getAvailableVoicesAsync();
        const ja = vs.find((v) => v.language?.toLowerCase().startsWith("ja"));
        setJaVoiceId(ja?.identifier ?? null);
      } catch {}
    })();
    return () => { try { Speech.stop(); } catch {} };
  }, []);

  // Anti doble-tap
  const busyRef = useRef(false);

  const speak = useCallback(async (it: QuizItem) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      Speech.stop();
      Vibration.vibrate(8);
      const phrase = `${it.hira}。${it.example.jp}。`;
      Speech.speak(phrase, {
        language: "ja-JP",
        voice: jaVoiceId ?? undefined,
        rate: 1.02,
        pitch: 1.0,
      });
    } finally {
      setTimeout(() => (busyRef.current = false), 120);
    }
  }, [jaVoiceId]);

  // Opciones
  const onPick = useCallback((k: KanaKeyT) => {
    if (!item || picked) return;
    setPicked(k);
    const ok = k === item.key;

    if (ok) {
      setScore((s) => s + 1);
      Vibration.vibrate(12);
      if (sndReady) { playCorrect().catch(() => {}); }
    } else {
      Vibration.vibrate([0, 30, 40, 30]);
      if (sndReady) { playWrong().catch(() => {}); }
    }
  }, [item, picked, sndReady, playCorrect, playWrong]);

  const next = useCallback(() => {
    if (round + 1 >= deck.length) {
      setRound(0);
      setScore(0);
      setPicked(null);
      return;
    }
    setRound((r) => r + 1);
    setPicked(null);
  }, [round, deck.length]);

  const resetDeck = useCallback(() => {
    setRound(0);
    setScore(0);
    setPicked(null);
  }, []);

  const options = useMemo(() => shuffle(BANK.map((b) => b.key)), [round]);

  if (!item) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <View style={[styles.card, { alignItems: "center" }]}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, fontWeight: "700" }}>Cargando…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz de escucha — Familia T</Text>
      <Text style={styles.subtitle}>Escucha y elige la sílaba correcta.</Text>

      {/* Controles compactos */}
      <View style={styles.toggles}>
        <Toggle
          label="Barajar"
          value={useShuffle}
          onPressIn={() => { setUseShuffle((v) => !v); resetDeck(); }}
        />
        <Toggle
          label="Romaji"
          value={showRomaji}
          onPressIn={() => setShowRomaji((v) => !v)}
        />
        <Toggle
          label="Pista ES"
          value={showHintES}
          onPressIn={() => setShowHintES((v) => !v)}
        />
        <Pressable style={styles.ttsBtn} onPressIn={() => speak(item)}>
          <Text style={styles.ttsBtnText}>▶︎ TTS</Text>
        </Pressable>
      </View>

      {/* Tarjeta */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.meta}>Pregunta {round + 1}/{deck.length}</Text>
          <Text style={styles.meta}>Aciertos: {score}</Text>
        </View>

        <View style={{ alignItems: "center", marginTop: 8 }}>
          <Text style={styles.bigKana}>?</Text>
          {showRomaji && <Text style={styles.romaji}>({item.romaji})</Text>}
          {showHintES && (
            <Text style={styles.hint}>Ej.: {item.example.jp} — {item.example.es}</Text>
          )}
        </View>

        {/* Opciones */}
        <FlatList
          data={options}
          keyExtractor={(k) => k}
          contentContainerStyle={{ gap: 10, paddingTop: 10 }}
          renderItem={({ item: k }) => {
            const info = BANK.find((b) => b.key === k)!;
            const hasPicked = picked != null;
            const isPicked = picked === k;
            const isRight = hasPicked && k === deck[round].key;
            const bg = !hasPicked ? "#111827" : isRight ? "#059669" : isPicked ? "#DC2626" : "#374151";
            return (
              <Pressable
                onPressIn={() => onPick(k)}
                disabled={hasPicked}
                style={[styles.opt, { backgroundColor: bg }]}
              >
                <Text style={styles.optKana}>{info.hira}</Text>
                <Text style={styles.optText}>{info.romaji}</Text>
              </Pressable>
            );
          }}
        />

        <Pressable
          onPressIn={next}
          disabled={picked == null}
          style={[styles.primaryBtn, { marginTop: 12, opacity: picked == null ? 0.5 : 1 }]}
        >
          <Text style={styles.primaryBtnText}>
            {round + 1 >= deck.length ? "Reiniciar" : "Siguiente"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.footerNote}>Tip: pulsa “TTS” varias veces y compara con las opciones.</Text>
    </View>
  );
}

/* ============== UI helpers ============== */
function Toggle({
  label, value, onPressIn,
}: { label: string; value: boolean; onPressIn: () => void }) {
  return (
    <Pressable onPressIn={onPressIn} style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.knob, value && styles.knobOn]} />
      <Text style={styles.toggleText}>{label}</Text>
    </Pressable>
  );
}

/* ============== Estilos (controles más chicos) ============== */
const RED = "#B32133";
const INK = "#111827";
const PAPER = "#faf7f0";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAPER, paddingHorizontal: 16, paddingTop: 10 },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  subtitle: { textAlign: "center", fontSize: 12, color: "#555", marginTop: 4, marginBottom: 8 },

  /* Controles compactos */
  toggles: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 2, paddingVertical: 4 },
  ttsBtn: { marginLeft: "auto", backgroundColor: INK, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9 },
  ttsBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  meta: { fontSize: 11, color: "#6b7280", fontWeight: "700" },

  bigKana: { fontSize: 44, lineHeight: 50, color: INK, fontWeight: "900" },
  romaji: { marginTop: 2, fontSize: 13, color: "#666" },
  hint: { marginTop: 4, fontSize: 11, color: "#666" },

  opt: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  optKana: { color: "#fff", fontSize: 26, fontWeight: "900" },
  optText: { color: "#fff", fontWeight: "800", fontSize: 13, opacity: 0.95 },

  primaryBtn: { backgroundColor: RED, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

  /* Toggle más chico */
  toggle: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: "#EDE5D7", borderRadius: 999 },
  toggleOn: { backgroundColor: "#C79A3E" },
  knob: { width: 12, height: 12, borderRadius: 999, backgroundColor: "#C9BBA5" },
  knobOn: { backgroundColor: "#FFF" },
  toggleText: { fontSize: 11, color: "#3B2F2F", fontWeight: "700" },

  footerNote: { textAlign: "center", fontSize: 11, color: "#555", marginVertical: 10 },
});
