// src/screens/N5/HRoleplaySaludoScreen.tsx
import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    Vibration,
    View,
} from "react-native";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";

/* =========================================================
   Tipos
========================================================= */
type KanaPart = {
  kana: string;
  romaji: string;
  tips: string[];
};

type PhraseItem = {
  id: "konnichiwa" | "ohayo_gozaimasu" | "hajimemashite_yoroshiku";
  jp: string;
  romaji: string;
  es: string;
  kanaBreak: KanaPart[];
};

type QuizChoice = { key: string; label: string; correct: boolean };
type QuizQ = { id: string; question: string; choices: QuizChoice[] };

/* =========================================================
   Datos — Roleplay de saludos
========================================================= */
const PHRASES: PhraseItem[] = [
  {
    id: "konnichiwa",
    jp: "こんにちは",
    romaji: "konnichiwa",
    es: "¡Hola!/Buenas (día-tarde)",
    kanaBreak: [
      { kana: "こ", romaji: "ko", tips: ["① Superior, ② Inferior."] },
      { kana: "ん", romaji: "n", tips: ["① Curva continua."] },
      { kana: "に", romaji: "ni", tips: ["① Corta izq., ② Larga der."] },
      { kana: "ち", romaji: "chi", tips: ["① Corta, ② Curva larga."] },
      { kana: "は", romaji: "ha (se lee 'wa')", tips: ["① Vertical, ② Horizontal, ③ Curva."] },
    ],
  },
  {
    id: "ohayo_gozaimasu",
    jp: "おはようございます",
    romaji: "ohayō gozaimasu",
    es: "Buenos días (formal)",
    kanaBreak: [
      { kana: "お", romaji: "o", tips: ["①-③ con lazo."] },
      { kana: "は", romaji: "ha", tips: ["① Vertical, ② Horizontal, ③ Curva."] },
      { kana: "よ", romaji: "yo", tips: ["①-② dos trazos."] },
      { kana: "う", romaji: "u", tips: ["①-② alargamiento."] },
      { kana: "ご", romaji: "go", tips: ["こ + dakuten (゛)."] },
      { kana: "ざ", romaji: "za", tips: ["さ + dakuten (゛)."] },
      { kana: "い", romaji: "i", tips: ["①-② dos trazos."] },
      { kana: "ま", romaji: "ma", tips: ["①-③ tres trazos."] },
      { kana: "す", romaji: "su", tips: ["①-② curva descendente."] },
    ],
  },
  {
    id: "hajimemashite_yoroshiku",
    jp: "はじめまして。よろしくおねがいします。",
    romaji: "Hajimemashite. Yoroshiku onegai shimasu.",
    es: "Mucho gusto. Encantado(a) de conocerle.",
    kanaBreak: [
      { kana: "は", romaji: "ha", tips: ["① Vertical, ② Horizontal, ③ Curva."] },
      { kana: "じ", romaji: "ji", tips: ["し + dakuten (゛)."] },
      { kana: "め", romaji: "me", tips: ["①-② dos trazos."] },
      { kana: "ま", romaji: "ma", tips: ["①-③ tres trazos."] },
      { kana: "し", romaji: "shi", tips: ["① Trazo fluido."] },
      { kana: "て", romaji: "te", tips: ["①-② dos trazos."] },
      { kana: "よ", romaji: "yo", tips: ["①-② dos trazos."] },
      { kana: "ろ", romaji: "ro", tips: ["① Trazo cerrado."] },
      { kana: "し", romaji: "shi", tips: ["① Trazo fluido."] },
      { kana: "く", romaji: "ku", tips: ["① Curva."] },
      { kana: "お", romaji: "o", tips: ["①-③ con lazo."] },
      { kana: "ね", romaji: "ne", tips: ["①-② dos trazos."] },
      { kana: "が", romaji: "ga", tips: ["か + dakuten (゛)."] },
      { kana: "い", romaji: "i", tips: ["①-② dos trazos."] },
      { kana: "し", romaji: "shi", tips: ["① Trazo fluido."] },
      { kana: "ま", romaji: "ma", tips: ["①-③ tres trazos."] },
      { kana: "す", romaji: "su", tips: ["①-② curva descendente."] },
    ],
  },
];

/* =========================================================
   MP3 locales para frases (ya generados con gTTS)
========================================================= */
const PHRASE_AUDIO = {
  konnichiwa: require("../../../../assets/audio/n5/roleplayH/konnichiwa.mp3"),
  ohayo_gozaimasu: require("../../../../assets/audio/n5/roleplayH/ohayo_gozaimasu.mp3"),
  hajimemashite_yoroshiku: require("../../../../assets/audio/n5/roleplayH/hajimemashite_yoroshiku.mp3"),
} as const;

/* =========================================================
   Familia H — selector arriba (dinámico)
========================================================= */
const H_FAMILY: KanaPart[] = [
  { kana: "は", romaji: "ha", tips: ["① Vertical", "② Horizontal", "③ Curva lateral"] },
  { kana: "ひ", romaji: "hi", tips: ["① Curva fluida (1 trazo)"] },
  { kana: "ふ", romaji: "fu", tips: ["① Punto izq.", "② Punto der.", "③ Curva inferior"] },
  { kana: "へ", romaji: "he", tips: ["① Diagonal ascendente (1 trazo)"] },
  { kana: "ほ", romaji: "ho", tips: ["① Vertical", "② Horizontal sup.", "③ Curva der.", "④ Cierre"] },
];

/* =========================================================
   Hints de trazos (1..n) por carácter (0..1)
========================================================= */
type XY = { x: number; y: number };
const HINTS: Record<string, XY[]> = {
  // Familia H
  "は": [{ x: 0.40, y: 0.20 }, { x: 0.62, y: 0.22 }, { x: 0.56, y: 0.60 }],
  "ひ": [{ x: 0.55, y: 0.45 }],
  "ふ": [{ x: 0.42, y: 0.18 }, { x: 0.58, y: 0.18 }, { x: 0.52, y: 0.62 }],
  "へ": [{ x: 0.35, y: 0.55 }],
  "ほ": [{ x: 0.40, y: 0.20 }, { x: 0.62, y: 0.20 }, { x: 0.60, y: 0.58 }, { x: 0.50, y: 0.64 }],

  // Otras usadas en frases (para que el frame responda)
  "こ": [{ x: 0.35, y: 0.30 }, { x: 0.65, y: 0.65 }],
  "ん": [{ x: 0.55, y: 0.45 }],
  "に": [{ x: 0.35, y: 0.30 }, { x: 0.65, y: 0.65 }],
  "ち": [{ x: 0.40, y: 0.30 }, { x: 0.55, y: 0.65 }],
  "お": [{ x: 0.40, y: 0.25 }, { x: 0.40, y: 0.55 }, { x: 0.62, y: 0.62 }],
  "よ": [{ x: 0.45, y: 0.35 }, { x: 0.60, y: 0.60 }],
  "う": [{ x: 0.55, y: 0.40 }, { x: 0.50, y: 0.65 }],
  "い": [{ x: 0.45, y: 0.30 }, { x: 0.60, y: 0.55 }],
  "ま": [{ x: 0.35, y: 0.30 }, { x: 0.60, y: 0.30 }, { x: 0.50, y: 0.60 }],
  "す": [{ x: 0.45, y: 0.30 }, { x: 0.55, y: 0.65 }],
  "ろ": [{ x: 0.52, y: 0.50 }],
  "く": [{ x: 0.55, y: 0.45 }],
  "ね": [{ x: 0.45, y: 0.30 }, { x: 0.60, y: 0.55 }],
  "し": [{ x: 0.55, y: 0.45 }],
  "て": [{ x: 0.45, y: 0.30 }, { x: 0.58, y: 0.55 }],
  "ご": [{ x: 0.35, y: 0.30 }, { x: 0.65, y: 0.65 }, { x: 0.78, y: 0.20 }],
  "ざ": [{ x: 0.35, y: 0.18 }, { x: 0.38, y: 0.38 }, { x: 0.68, y: 0.62 }, { x: 0.78, y: 0.18 }],
  "じ": [{ x: 0.52, y: 0.35 }, { x: 0.78, y: 0.18 }],
  "が": [{ x: 0.42, y: 0.20 }, { x: 0.58, y: 0.22 }, { x: 0.56, y: 0.60 }, { x: 0.78, y: 0.18 }],
};

const STROKE_COUNT: Record<string, number> = {
  "は": 3, "ひ": 1, "ふ": 3, "へ": 1, "ほ": 4,
  "こ": 2, "ん": 1, "に": 2, "ち": 2, "お": 3, "よ": 2, "う": 2, "い": 2, "ま": 3, "す": 2, "ろ": 1, "く": 1, "ね": 2, "し": 1, "て": 2,
  "ご": 3, "ざ": 4, "じ": 2, "が": 4,
};

/* =========================================================
   Audio helpers
========================================================= */
async function ensurePlaybackMode() {
  await Audio.setIsEnabledAsync(true);
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
    interruptionModeAndroid: 1,
    interruptionModeIOS: 1,
  });
}

/** Hook SFX robusto (correcto/incorrecto) */
function useSfx() {
  const okRef = useRef<Audio.Sound | null>(null);
  const badRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensurePlaybackMode();
        const okAsset = Asset.fromModule(require("../../../../assets/sounds/correct.mp3"));
        const badAsset = Asset.fromModule(require("../../../../assets/sounds/wrong.mp3"));
        await okAsset.downloadAsync();
        await badAsset.downloadAsync();
        const ok = new Audio.Sound();
        await ok.loadAsync({ uri: okAsset.localUri || okAsset.uri }, { shouldPlay: false, volume: 1.0 });
        const bad = new Audio.Sound();
        await bad.loadAsync({ uri: badAsset.localUri || badAsset.uri }, { shouldPlay: false, volume: 1.0 });
        if (!cancelled) {
          okRef.current = ok;
          badRef.current = bad;
        } else {
          try { await ok.unloadAsync(); } catch {}
          try { await bad.unloadAsync(); } catch {}
        }
      } catch (e) {
        console.warn("[useSfx] load error:", e);
      }
    })();
    return () => {
      cancelled = true;
      (async () => {
        try { await okRef.current?.unloadAsync(); } catch {}
        try { await badRef.current?.unloadAsync(); } catch {}
        okRef.current = null; badRef.current = null;
      })();
    };
  }, []);

  const replay = async (s?: Audio.Sound | null) => {
    if (!s) return;
    try { await s.stopAsync(); } catch {}
    try { await s.playFromPositionAsync(0); } catch { try { await s.replayAsync(); } catch {} }
  };

  const playOk = useCallback(async () => { Vibration.vibrate(8); await ensurePlaybackMode(); await replay(okRef.current); }, []);
  const playBad = useCallback(async () => { Vibration.vibrate(8); await ensurePlaybackMode(); await replay(badRef.current); }, []);

  return { playOk, playBad };
}

/** Hook que precarga y reproduce los MP3 de las frases */
function usePhraseAudio() {
  const bankRef = useRef<Partial<Record<PhraseItem["id"], Audio.Sound>>>({});
  const currentRef = useRef<Audio.Sound | null>(null);
  const [ready, setReady] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensurePlaybackMode();
        // Preload each phrase mp3
        for (const key of Object.keys(PHRASE_AUDIO) as PhraseItem["id"][]) {
          const mod = PHRASE_AUDIO[key];
          const asset = Asset.fromModule(mod);
          await asset.downloadAsync();
          const s = new Audio.Sound();
          await s.loadAsync({ uri: asset.localUri || asset.uri }, { shouldPlay: false, volume: 1.0 });
          bankRef.current[key] = s;
        }
        if (!cancelled) setReady(true);
      } catch (e) {
        console.warn("[usePhraseAudio] preload error:", e);
        if (!cancelled) setReady(true); // deja usar aunque sea tarde
      }
    })();
    return () => {
      cancelled = true;
      (async () => {
        try { await currentRef.current?.unloadAsync(); } catch {}
        const all = Object.values(bankRef.current).filter(Boolean) as Audio.Sound[];
        for (const s of all) { try { await s.unloadAsync(); } catch {} }
        bankRef.current = {};
        currentRef.current = null;
      })();
    };
  }, []);

  const playById = useCallback(async (id: PhraseItem["id"]) => {
    const s = bankRef.current[id];
    if (!s || busyRef.current) return;
    busyRef.current = true;
    try {
      await ensurePlaybackMode();
      if (currentRef.current && currentRef.current !== s) {
        try { await currentRef.current.stopAsync(); } catch {}
      }
      currentRef.current = s;
      await s.playFromPositionAsync(0);
    } finally {
      setTimeout(() => { busyRef.current = false; }, 120);
    }
  }, []);

  return { ready, playById };
}

/* =========================================================
   Frame dinámico de trazos (sin imágenes)
========================================================= */
function TraceFrame({
  char,
  showGrid,
  showGuide,
  fontLoaded,
  size = 220,
}: {
  char: string;
  showGrid: boolean;
  showGuide: boolean;
  fontLoaded: boolean;
  size?: number;
}) {
  const grid = [1, 2, 3].map((i) => (i * size) / 4);
  const fontSize = size * 0.62;
  const hints = HINTS[char] || [];
  const count = STROKE_COUNT[char] ?? hints.length;

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        <Rect x={0} y={0} width={size} height={size} rx={16} fill="#FFF8EF" stroke="#E7D8BF" strokeWidth={2} />
        {showGrid && (
          <>
            {grid.map((p, i) => (
              <G key={`g-${i}`}>
                <Line x1={p} y1={0} x2={p} y2={size} stroke="#E4D2B2" strokeDasharray="6 10" />
                <Line x1={0} y1={p} x2={size} y2={p} stroke="#E4D2B2" strokeDasharray="6 10" />
              </G>
            ))}
            <Line x1={size / 2} y1={0} x2={size / 2} y2={size} stroke="#D9C19A" />
            <Line x1={0} y1={size / 2} x2={size} y2={size / 2} stroke="#D9C19A" />
          </>
        )}

        {showGuide && fontLoaded && (
          <SvgText
            x={size / 2}
            y={size / 2 + fontSize * 0.03}
            fontFamily="NotoSansJP_700Bold"
            fontSize={fontSize}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#6B7280"
            opacity={0.26}
            stroke="#111827"
            strokeWidth={1.5}
          >
            {char}
          </SvgText>
        )}

        {showGuide &&
          hints.map((h, i) => {
            const cx = h.x * size;
            const cy = h.y * size;
            return (
              <G key={`hint-${i}`} opacity={0.96}>
                <Circle cx={cx} cy={cy} r={12} fill="#DC2626" />
                <SvgText x={cx} y={cy + 1} fontSize={12} fontWeight="bold" fill="#fff" textAnchor="middle" alignmentBaseline="middle">
                  {i + 1}
                </SvgText>
              </G>
            );
          })}
      </Svg>
      <Text style={{ textAlign: "center", marginTop: 6, fontWeight: "800", color: "#111827" }}>
        {count ? `${count} trazos` : "Trazos"}
      </Text>
    </View>
  );
}

/* =========================================================
   Pantalla principal
========================================================= */
export default function HRoleplaySaludoScreen() {
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });

  // selector dinámico arriba
  const [currentKana, setCurrentKana] = useState<string>("は");
  const [showGrid, setShowGrid] = useState(true);
  const [showGuide, setShowGuide] = useState(true);

  // audio frases
  const { ready, playById } = usePhraseAudio();

  // SFX quiz
  const { playOk, playBad } = useSfx();

  /* ------------------ Quiz (5 preguntas) -------------------- */
  const QUIZ: QuizQ[] = useMemo(
    () => [
      {
        id: "q1",
        question: "¿Cuál es la lectura correcta de こんにちは?",
        choices: [
          { key: "a", label: "konbanwa", correct: false },
          { key: "b", label: "konnichiwa", correct: true },
          { key: "c", label: "ohayō", correct: false },
        ],
      },
      {
        id: "q2",
        question: "¿Qué significa おはようございます?",
        choices: [
          { key: "a", label: "Buenas noches (formal)", correct: false },
          { key: "b", label: "Buenos días (formal)", correct: true },
          { key: "c", label: "Hola (informal)", correct: false },
        ],
      },
      {
        id: "q3",
        question: "En こんにちは, la partícula は se pronuncia…",
        choices: [
          { key: "a", label: "wa", correct: true },
          { key: "b", label: "ha", correct: false },
          { key: "c", label: "ba", correct: false },
        ],
      },
      {
        id: "q4",
        question: "¿Cuál es una forma natural de presentarse?",
        choices: [
          { key: "a", label: "はじめまして。よろしくおねがいします。", correct: true },
          { key: "b", label: "こんにちは。おはようございます。", correct: false },
          { key: "c", label: "さようなら。", correct: false },
        ],
      },
      {
        id: "q5",
        question: "Selecciona el significado más cercano de よろしくおねがいします。",
        choices: [
          { key: "a", label: "Encantado(a), quedo a su cuidado", correct: true },
          { key: "b", label: "Disculpe las molestias", correct: false },
          { key: "c", label: "Muchas gracias", correct: false },
        ],
      },
    ],
    []
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const onAnswer = async (qid: string, key: string, correct: boolean) => {
    setAnswers((prev) => ({ ...prev, [qid]: key }));
    if (correct) await playOk();
    else await playBad();
  };

  /* -------------- UI de frase ------------------- */
  const renderPhrase = ({ item }: { item: PhraseItem }) => (
    <View style={styles.card}>
      <Text style={styles.jp}>{item.jp}</Text>
      <Text style={styles.romaji}>{item.romaji}</Text>
      <Text style={styles.es}>{item.es}</Text>

      <View style={styles.row}>
        <Pressable
          onPress={() => playById(item.id)}
          disabled={!ready}
          style={({ pressed }) => [styles.btnDark, (pressed || !ready) && styles.btnPressed]}
        >
          <Text style={styles.btnText}>{ready ? "▶︎ Escuchar" : "Cargando audio…"}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionSmall}>Letra por letra</Text>
      <View style={styles.kanaWrap}>
        {item.kanaBreak.map((k, idx) => (
          <LetterChip
            key={`${item.id}-${k.kana}-${idx}`}
            part={k}
            onOpen={(kana) => setCurrentKana(kana)} // <- sincroniza el frame de arriba
          />
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Roleplay — Saludos</Text>
      <Text style={styles.subtitle}>
        Arriba tienes el marco de trazos para la <Text style={{ fontWeight: "800" }}>familia H</Text>.
        Toca una letra o un chip de las frases para ver su orden sugerido.
      </Text>

      {/* ===== Selector y frame dinámico arriba ===== */}
      <Text style={styles.sectionTitle}>Familia H (は・ひ・ふ・へ・ほ)</Text>

      <View style={styles.selectorRowWrap}>
        {H_FAMILY.map((p) => {
          const active = currentKana === p.kana;
          return (
            <Pressable
              key={p.kana}
              onPress={() => { Vibration.vibrate(6); setCurrentKana(p.kana); }}
              style={({ pressed }) => [
                styles.kanaBtnSmall,
                active && styles.kanaBtnActive,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.kanaGlyphSmall}>{p.kana}</Text>
              <Text style={styles.kanaLabel}>{p.romaji}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.frameRow}>
        <TraceFrame char={currentKana} showGrid={showGrid} showGuide={showGuide} fontLoaded={!!fontsLoaded} />
        <View style={styles.frameControls}>
          <Pressable onPress={() => setShowGuide((v) => !v)} style={[styles.pill, showGuide && styles.pillActive]}>
            <Text style={[styles.pillText, showGuide && styles.pillTextActive]}>Guía</Text>
          </Pressable>
          <Pressable onPress={() => setShowGrid((v) => !v)} style={[styles.pill, showGrid && styles.pillActive]}>
            <Text style={[styles.pillText, showGrid && styles.pillTextActive]}>Cuadrícula</Text>
          </Pressable>
        </View>
      </View>

      {/* ===== Frases ===== */}
      <FlatList
        data={PHRASES}
        keyExtractor={(it) => it.id}
        renderItem={renderPhrase}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* ===== Quiz ===== */}
      <View style={styles.quizCard}>
        <Text style={styles.quizTitle}>Quiz (5 preguntas)</Text>
        {QUIZ.map((q) => (
          <View key={q.id} style={{ marginTop: 10 }}>
            <Text style={styles.quizQ}>{q.question}</Text>
            {q.choices.map((c) => {
              const picked = answers[q.id] === c.key;
              const ok = c.correct && picked;
              const bad = !c.correct && picked;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => onAnswer(q.id, c.key, c.correct)}
                  style={[
                    styles.choice,
                    ok && { borderColor: "#16a34a", backgroundColor: "#ecfdf5" },
                    bad && { borderColor: "#dc2626", backgroundColor: "#fef2f2" },
                  ]}
                >
                  <Text style={[styles.choiceText, ok && { color: "#065f46" }, bad && { color: "#991b1b" }]}>
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/* ====== Chip de letra con modal + sincronización de frame ====== */
function LetterChip({ part, onOpen }: { part: KanaPart; onOpen: (kana: string) => void }) {
  const [open, setOpen] = useState(false);
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });

  return (
    <>
      <Pressable
        onPress={() => { Vibration.vibrate(6); onOpen(part.kana); setOpen(true); }}
        style={({ pressed }) => [styles.kanaChip, pressed && styles.chipPressed]}
      >
        <Text style={styles.kanaBig}>{part.kana}</Text>
        <Text style={styles.kanaSmall}>{part.romaji}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalKana}>{part.kana}</Text>
            <Text style={styles.modalRomaji}>{part.romaji}</Text>

            <View style={{ height: 10 }} />
            <TraceFrame char={part.kana} showGrid={true} showGuide={true} fontLoaded={!!fontsLoaded} size={180} />

            <View style={{ height: 10 }} />
            <Text style={styles.modalTitle}>Cómo se escribe</Text>
            {part.tips.map((t, i) => (
              <Text key={i} style={styles.modalTip}>• {t}</Text>
            ))}

            <Pressable onPress={() => setOpen(false)} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* =========================================================
   Estilos
========================================================= */
const INK = "#111827";
const PAPER = "#faf7f0";
const RED = "#B32133";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAPER },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: 12 },
  subtitle: { textAlign: "center", fontSize: 13, color: "#444", marginTop: 6, marginBottom: 10, paddingHorizontal: 16 },

  sectionTitle: { fontSize: 18, fontWeight: "800", marginTop: 8, marginBottom: 6, paddingHorizontal: 16, color: "#1f2937" },

  selectorRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  kanaBtnSmall: {
    width: "30%",
    borderRadius: 14,
    paddingVertical: 10,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#111",
    backgroundColor: "#b32133",
  },
  kanaBtnActive: {
    transform: [{ translateY: -2 }],
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
  },
  kanaGlyphSmall: { fontSize: 30, color: "#fff", fontWeight: "900", lineHeight: 32 },
  kanaLabel: { fontSize: 12, color: "#fff", marginTop: 4, opacity: 0.9 },

  frameRow: {
    paddingHorizontal: 16,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 14,
  },
  frameControls: { rowGap: 8 },

  pill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C4B69B",
    backgroundColor: "#FFFDF9",
    minHeight: 44,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: { backgroundColor: "#111827", borderColor: "#111827" },
  pillText: { color: "#3B2B1B", fontWeight: "700" },
  pillTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  jp: { fontSize: 28, textAlign: "center", lineHeight: 36 },
  romaji: { textAlign: "center", marginTop: 4, color: "#555", fontWeight: "700" },
  es: { textAlign: "center", marginTop: 2, color: "#6b7280", fontSize: 12 },

  row: { flexDirection: "row", justifyContent: "center", marginTop: 10, columnGap: 10 },
  btnDark: { backgroundColor: INK, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 140, alignItems: "center" },
  btnPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  btnText: { color: "#fff", fontWeight: "800" },

  sectionSmall: { fontWeight: "800", marginTop: 10, marginBottom: 6, color: "#1f2937" },
  kanaWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  kanaChip: {
    backgroundColor: "#FFF8EF",
    borderColor: "#E7D8BF",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  chipPressed: { opacity: 0.85 },
  kanaBig: { fontSize: 22, fontWeight: "800", color: "#111" },
  kanaSmall: { fontSize: 12, color: "#6b7280", marginTop: 2, fontWeight: "700" },

  quizCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quizTitle: { fontWeight: "900", fontSize: 16, marginBottom: 6, color: "#111827" },
  quizQ: { color: "#374151", fontWeight: "700", marginBottom: 6 },
  choice: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  choiceText: { fontWeight: "800", color: "#111827" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
  },
  modalKana: { fontSize: 60, lineHeight: 62, fontWeight: "900", color: INK },
  modalRomaji: { marginTop: 4, fontWeight: "800", color: "#4b5563" },
  modalTitle: { marginTop: 10, fontWeight: "900", color: "#111827" },
  modalTip: { marginTop: 6, color: "#374151" },
  modalBtn: { backgroundColor: INK, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginTop: 14 },
  modalBtnText: { color: "#fff", fontWeight: "800" },
});
