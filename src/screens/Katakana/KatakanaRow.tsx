// src/screens/Katakana/KatakanaChallenge.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
// Ajusta la ruta si tu proyecto la tiene distinta
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

type Pair = { kana: string; romaji: string };
type Props = {
  /** opcional: suma puntos al “wallet” global del usuario */
  onGrantPoints?: (delta: number) => void;
};

// ✅ Solo familias vistas: A, KA, SA, TA, NA (ア〜ノ)
const KATAKANA_A_TO_N: Pair[] = [
  // A
  { kana: "ア", romaji: "a" }, { kana: "イ", romaji: "i" }, { kana: "ウ", romaji: "u" }, { kana: "エ", romaji: "e" }, { kana: "オ", romaji: "o" },
  // KA
  { kana: "カ", romaji: "ka" }, { kana: "キ", romaji: "ki" }, { kana: "ク", romaji: "ku" }, { kana: "ケ", romaji: "ke" }, { kana: "コ", romaji: "ko" },
  // SA
  { kana: "サ", romaji: "sa" }, { kana: "シ", romaji: "shi" }, { kana: "ス", romaji: "su" }, { kana: "セ", romaji: "se" }, { kana: "ソ", romaji: "so" },
  // TA
  { kana: "タ", romaji: "ta" }, { kana: "チ", romaji: "chi" }, { kana: "ツ", romaji: "tsu" }, { kana: "テ", romaji: "te" }, { kana: "ト", romaji: "to" },
  // NA
  { kana: "ナ", romaji: "na" }, { kana: "ニ", romaji: "ni" }, { kana: "ヌ", romaji: "nu" }, { kana: "ネ", romaji: "ne" }, { kana: "ノ", romaji: "no" },
];

// ---------- utils ----------
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
const pickRandom = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);

const makeOptions = (
  correct: Pair,
  pool: Pair[],
  mode: "kana->roma" | "roma->kana"
) => {
  const distractors = pickRandom(pool.filter(p => p !== correct), 3);
  const raw = shuffle([correct, ...distractors]);
  return mode === "kana->roma"
    ? raw.map(r => ({ label: r.romaji, value: r.romaji, isCorrect: r === correct }))
    : raw.map(r => ({ label: r.kana, value: r.kana, isCorrect: r === correct }));
};

// ---------- logro (persistencia) ----------
const ACHIEVEMENT_KEY = "achv.katakana.a_to_n.first_clear";
const ACHIEVEMENT_POINTS = 10;

async function hasAchievement(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(ACHIEVEMENT_KEY);
    return v === "1";
  } catch {
    return false;
  }
}
async function setAchievement(): Promise<void> {
  try {
    await AsyncStorage.setItem(ACHIEVEMENT_KEY, "1");
  } catch {
    // noop
  }
}

// ---------- componente ----------
export default function KatakanaChallenge(props: Props) {
  const { onGrantPoints } = props ?? {};
  const TOTAL_Q = 20;
  const SECS_PER_Q = 12;

  // ⛑️ Adaptador tolerante a nombres del hook de sonidos
  type Sfx = {
    playCorrect?: () => void;
    playIncorrect?: () => void;
    playSuccess?: () => void;
    playWrong?: () => void;
    playError?: () => void;
    playNegative?: () => void;
  };
  const _sfx = (useFeedbackSounds?.() as unknown as Sfx) ?? {};
  const playCorrect = _sfx.playCorrect ?? _sfx.playSuccess ?? (() => {});
  const playIncorrect =
    _sfx.playIncorrect ?? _sfx.playWrong ?? _sfx.playError ?? _sfx.playNegative ?? (() => {});

  // re-barajar preguntas en cada intento
  const [gameKey, setGameKey] = useState(0);
  const questions = useMemo(() => {
    const base = pickRandom(KATAKANA_A_TO_N, Math.min(TOTAL_Q, KATAKANA_A_TO_N.length));
    return base.map((pair, idx) => {
      const mode: "kana->roma" | "roma->kana" = idx % 2 === 0 ? "kana->roma" : "roma->kana";
      const options = makeOptions(pair, KATAKANA_A_TO_N, mode);
      const prompt = mode === "kana->roma" ? pair.kana : pair.romaji;
      return { pair, mode, options, prompt };
    });
  }, [gameKey]);

  const [started, setStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [seconds, setSeconds] = useState(SECS_PER_Q);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState<Pair[]>([]);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);

  // logro (UI)
  const [showAchievement, setShowAchievement] = useState(false);
  const [alreadyEarned, setAlreadyEarned] = useState<boolean | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const current = questions[qIndex];

  // Cargar si ya tiene el logro (una sola vez al montar)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const earned = await hasAchievement();
      if (mounted) setAlreadyEarned(earned);
    })();
    return () => { mounted = false; };
  }, []);

  const resetTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // cronómetro por pregunta
  useEffect(() => {
    if (!started) return;
    resetTimers();
    setSeconds(SECS_PER_Q);
    timerRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          onAnswer(null);
          return SECS_PER_Q;
        }
        return prev - 1;
      });
    }, 1000);
    return () => resetTimers();
  }, [started, qIndex]);

  const start = () => {
    setGameKey(k => k + 1); // nuevas preguntas
    setStarted(true);
    setQIndex(0);
    setScore(0);
    setStreak(0);
    setMistakes([]);
    setSelected(null);
    setFlash(null);
  };

  const finishGame = async () => {
    resetTimers();
    setStarted(false);

    const earned = alreadyEarned ?? (await hasAchievement());
    if (!earned) {
      await setAchievement();
      onGrantPoints?.(ACHIEVEMENT_POINTS);
      setShowAchievement(true);
      setAlreadyEarned(true);
    }
  };

  const onAnswer = (value: string | null) => {
    if (!current) return;
    if (selected !== null) return;

    const correctValue = current.mode === "kana->roma" ? current.pair.romaji : current.pair.kana;
    const isCorrect = value === correctValue;

    setSelected(value ?? "__TIMEOUT__");

    if (isCorrect) {
      playCorrect();
      setFlash("ok");
      const bonus = Math.max(0, seconds) * 5; // bonus por velocidad
      setScore(prev => prev + 100 + bonus);
      setStreak(s => s + 1);
    } else {
      playIncorrect();
      setFlash("bad");
      setStreak(0);
      setMistakes(prev => [...prev, current.pair]);
    }

    setTimeout(() => {
      setSelected(null);
      setFlash(null);
      if (qIndex + 1 < questions.length) {
        setQIndex(qIndex + 1);
      } else {
        finishGame();
      }
    }, 700);
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Cintillo decorativo */}
      <View style={s.ribbon}>
        <Text style={s.ribbonTxt}>⛩️ Katakana Challenge</Text>
      </View>

      {!started && qIndex === 0 && score === 0 ? (
        <>
          <Text style={s.title}>⚡ Desafío cronometrado</Text>
          <Text style={s.subtitle}>
            Identifica rápidamente sílabas y palabras en katakana (familias ア〜ノ).
          </Text>

          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="flash" size={18} />
              <Text style={s.h}>Cómo funciona</Text>
            </View>
            <Text style={s.li}>• 20 preguntas aleatorias.</Text>
            <Text style={s.li}>• {SECS_PER_Q} s por pregunta.</Text>
            <Text style={s.li}>• Puntos por velocidad y acierto.</Text>
            <Text style={s.li}>• Al finalizar se otorga 1 logro único (+10 pts).</Text>

            <Pressable style={s.btn} onPress={start}>
              <Text style={s.btnTxt}>Comenzar</Text>
            </Pressable>
          </View>

          <View style={s.hintBox}>
            <Text style={s.hintTitle}>Ámbito del reto</Text>
            <Text style={s.hintBody}>Incluye: ア〜オ, カ〜コ, サ〜ソ, タ〜ト, ナ〜ノ</Text>
          </View>
        </>
      ) : null}

      {started && current && (
        <View style={[s.card, s.gameCard, flash === "ok" ? s.okFlash : flash === "bad" ? s.badFlash : null]}>
          {/* Header de estado */}
          <View style={s.rowBetween}>
            <Chip icon="time" label={`${seconds}s`} />
            <Chip icon="star" label={`${score} pts`} />
            <Chip icon="flame" label={`x${streak}`} />
          </View>

          {/* Progreso */}
          <View style={s.progressWrap}>
            <View style={[s.progressBar, { width: `${((qIndex + 1) / questions.length) * 100}%` }]} />
          </View>
          <Text style={s.progressText}>
            Pregunta {qIndex + 1}/{questions.length}
          </Text>

          {/* Enunciado */}
          <View style={s.promptWrap}>
            <Text style={s.promptHelp}>
              {current.mode === "kana->roma" ? "¿Qué significa este katakana?" : "Selecciona el katakana correcto:"}
            </Text>
            <Text style={s.prompt}>
              {current.prompt}
            </Text>
          </View>

          {/* Opciones */}
          <View style={s.optionsGrid}>
            {current.options.map((opt, idx) => {
              const chosen = selected !== null && (selected === opt.value);
              const correctValue = current.mode === "kana->roma" ? current.pair.romaji : current.pair.kana;
              const isRight = selected !== null && opt.value === correctValue;
              return (
                <Pressable
                  key={idx}
                  onPress={() => onAnswer(opt.value)}
                  style={({ pressed }) => [
                    s.option,
                    pressed && s.optionPressed,
                    chosen && s.optionChosen,
                    isRight && s.optionRight,
                    selected && !isRight && chosen && s.optionWrong,
                  ]}
                >
                  <Text style={s.optionTxt}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {!started && (qIndex > 0 || score > 0) && (
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="ribbon" size={18} />
            <Text style={s.h}>Resumen</Text>
          </View>
          <View style={s.summaryRow}>
            <Chip icon="star" label={`Puntaje: ${score}`} big />
            <Chip icon="flame" label={`Racha máx: ${streak}`} big />
          </View>

          <Text style={[s.h, { marginTop: 12 }]}>Letras a reforzar</Text>
          {mistakes.length === 0 ? (
            <Text style={s.li}>¡Excelente! No hay errores para repasar. 🎉</Text>
          ) : (
            <View style={s.badges}>
              {mistakes.map((m, i) => (
                <View key={`${m.kana}-${i}`} style={s.badge}>
                  <Text style={s.badgeKana}>{m.kana}</Text>
                  <Text style={s.badgeRoma}>{m.romaji}</Text>
                </View>
              ))}
            </View>
          )}

          <Pressable style={[s.btn, { marginTop: 16 }]} onPress={start}>
            <Text style={s.btnTxt}>Jugar otra vez</Text>
          </Pressable>
        </View>
      )}

      {/* Modal de logro (solo aparece la 1ª vez) */}
      <Modal transparent visible={showAchievement} animationType="fade" onRequestClose={() => setShowAchievement(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.achvCard}>
            <View style={s.achvEmblem}>
              <Ionicons name="trophy" size={32} />
            </View>
            <Text style={s.achvTitle}>¡Logro desbloqueado!</Text>
            <Text style={s.achvName}>Katakana Challenger</Text>
            <Text style={s.achvPts}>+{ACHIEVEMENT_POINTS} pts</Text>

            <Pressable style={[s.btn, { marginTop: 12 }]} onPress={() => setShowAchievement(false)}>
              <Text style={s.btnTxt}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ---------- UI helpers ----------
function Chip({ icon, label, big }: { icon: keyof typeof Ionicons.glyphMap | "time" | "star" | "flame" | "ribbon"; label: string; big?: boolean }) {
  return (
    <View style={[stylesChip.chip, big && stylesChip.big]}>
      <Ionicons name={icon as any} size={big ? 18 : 14} />
      <Text style={[stylesChip.txt, big && stylesChip.txtBig]}>{label}</Text>
    </View>
  );
}

// ---------- estilos ----------
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";
const GOLD = "#C6A15B";
const WASHI = "#fffdf7";

const s = StyleSheet.create({
  container: { padding: 16, backgroundColor: PAPER },

  ribbon: {
    alignSelf: "center",
    backgroundColor: "#ffffffaa",
    borderColor: GOLD,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  ribbonTxt: { fontWeight: "900", letterSpacing: 0.4, color: INK },

  title: { fontSize: 24, fontWeight: "900", textAlign: "center", marginTop: 14, color: INK },
  subtitle: { textAlign: "center", fontSize: 13, color: "#4B5563", marginTop: 6, marginBottom: 12 },

  card: {
    backgroundColor: WASHI,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  h: { fontWeight: "900", color: INK, fontSize: 16 },
  li: { marginTop: 4, color: "#374151" },

  btn: {
    marginTop: 14,
    backgroundColor: CRIMSON,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9f1c2c",
  },
  btnTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.3 },

  hintBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  hintTitle: { fontWeight: "900", color: INK, marginBottom: 4 },
  hintBody: { color: "#374151" },

  gameCard: { paddingTop: 14 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },

  progressWrap: {
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: GOLD,
  },
  progressText: { marginTop: 6, fontSize: 12, color: "#6B7280" },

  promptWrap: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EFE6D7",
    backgroundColor: "#fffcf5",
  },
  promptHelp: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  prompt: { fontSize: 40, fontWeight: "900", color: INK },

  optionsGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  option: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  optionPressed: { transform: [{ scale: 0.98 }] },
  optionTxt: { fontSize: 18, fontWeight: "700", color: INK },
  optionChosen: { borderColor: "#D1D5DB", backgroundColor: "#fafafa" },
  optionRight: { borderColor: "#16a34a", backgroundColor: "#eaf7ee" },
  optionWrong: { borderColor: "#dc2626", backgroundColor: "#fdecec" },

  okFlash: { borderColor: "#16a34a", borderWidth: 1 },
  badFlash: { borderColor: "#dc2626", borderWidth: 1 },

  summaryRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  badge: {
    paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: 12, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fff",
    alignItems: "center",
  },
  badgeKana: { fontSize: 20, fontWeight: "900", color: INK, lineHeight: 24 },
  badgeRoma: { fontSize: 12, color: "#6B7280" },

  // Modal logro
  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  achvCard: {
    width: "100%", maxWidth: 360, backgroundColor: WASHI, padding: 18,
    borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB",
    alignItems: "center",
  },
  achvEmblem: {
    width: 72, height: 72, borderRadius: 999, borderWidth: 2, borderColor: GOLD,
    alignItems: "center", justifyContent: "center", backgroundColor: "#fff", marginBottom: 10,
  },
  achvTitle: { fontSize: 18, fontWeight: "900", color: INK },
  achvName: { marginTop: 2, color: "#374151" },
  achvPts: { marginTop: 6, fontWeight: "900", color: CRIMSON },
});

const stylesChip = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  txt: { fontSize: 12, color: INK, fontWeight: "700" },
  big: { paddingVertical: 8, paddingHorizontal: 12 },
  txtBig: { fontSize: 14 },
});
``