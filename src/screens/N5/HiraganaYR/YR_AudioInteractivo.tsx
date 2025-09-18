// src/screens/N5/HiraganaYR/YR_AudioInteractivo.tsx
import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import { Asset } from "expo-asset";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";

/* =========================================================
   Tipos
========================================================= */
type KanaPart = { kana: string; romaji: string; tips: string[] };

type WordItem = {
  id: "yama" | "yuki" | "yoru" | "ringo" | "reizouko" | "raion";
  jp: string;
  romaji: string;
  es: string;
  kanaBreak: KanaPart[];
};

/* =========================================================
   Palabras Y–R (escuchar, tocar y repetir)
========================================================= */
const WORDS: WordItem[] = [
  {
    id: "yama",
    jp: "やま",
    romaji: "yama",
    es: "montaña",
    kanaBreak: [
      { kana: "や", romaji: "ya", tips: ["① Curva larga", "② pequeño gancho"] },
      { kana: "ま", romaji: "ma", tips: ["①-③ tres trazos"] },
    ],
  },
  {
    id: "yuki",
    jp: "ゆき",
    romaji: "yuki",
    es: "nieve",
    kanaBreak: [
      { kana: "ゆ", romaji: "yu", tips: ["①-② dos trazos"] },
      { kana: "き", romaji: "ki", tips: ["①-③ tres trazos"] },
    ],
  },
  {
    id: "yoru",
    jp: "よる",
    romaji: "yoru",
    es: "noche",
    kanaBreak: [
      { kana: "よ", romaji: "yo", tips: ["①-② dos trazos"] },
      { kana: "る", romaji: "ru", tips: ["① curva cerrada"] },
    ],
  },
  {
    id: "ringo",
    jp: "りんご",
    romaji: "ringo",
    es: "manzana",
    kanaBreak: [
      { kana: "り", romaji: "ri", tips: ["①-② dos trazos"] },
      { kana: "ん", romaji: "n", tips: ["① curva continua"] },
      { kana: "ご", romaji: "go", tips: ["こ + dakuten (゛)"] },
    ],
  },
  {
    id: "reizouko",
    jp: "れいぞうこ",
    romaji: "reizōko",
    es: "refrigerador",
    kanaBreak: [
      { kana: "れ", romaji: "re", tips: ["①-② dos trazos"] },
      { kana: "い", romaji: "i", tips: ["①-② dos trazos"] },
      { kana: "ぞ", romaji: "zo", tips: ["そ + dakuten (゛)"] },
      { kana: "う", romaji: "u", tips: ["①-② dos trazos"] },
      { kana: "こ", romaji: "ko", tips: ["①-② dos trazos"] },
    ],
  },
  {
    id: "raion",
    jp: "らいおん",
    romaji: "raion",
    es: "león",
    kanaBreak: [
      { kana: "ら", romaji: "ra", tips: ["①-② dos trazos"] },
      { kana: "い", romaji: "i", tips: ["①-② dos trazos"] },
      { kana: "お", romaji: "o", tips: ["①-③ con lazo"] },
      { kana: "ん", romaji: "n", tips: ["① curva continua"] },
    ],
  },
];

/* =========================================================
   MP3 locales (colócalos en assets/audio/n5/yr/)
========================================================= */
const WORD_AUDIO: Record<WordItem["id"], any> = {
  yama: require("../../../../assets/audio/n5/yr/yama.mp3"),
  yuki: require("../../../../assets/audio/n5/yr/yuki.mp3"),
  yoru: require("../../../../assets/audio/n5/yr/yoru.mp3"),
  ringo: require("../../../../assets/audio/n5/yr/ringo.mp3"),
  reizouko: require("../../../../assets/audio/n5/yr/reizouko.mp3"),
  raion: require("../../../../assets/audio/n5/yr/raion.mp3"),
};

/* =========================================================
   Selector de letras Y–R arriba
========================================================= */
const YR_FAMILY: KanaPart[] = [
  { kana: "や", romaji: "ya", tips: ["① Curva larga", "② Gancho"] },
  { kana: "ゆ", romaji: "yu", tips: ["① Vertical corta", "② Curva grande"] },
  { kana: "よ", romaji: "yo", tips: ["① Arriba", "② Curva derecha"] },
  { kana: "ら", romaji: "ra", tips: ["① Corta", "② Curva"] },
  { kana: "り", romaji: "ri", tips: ["① Corta", "② Curva baja"] },
  { kana: "る", romaji: "ru", tips: ["① Curva cerrada"] },
  { kana: "れ", romaji: "re", tips: ["① Corta", "② Curva lateral"] },
  { kana: "ろ", romaji: "ro", tips: ["① Cierre redondo"] },
];

/* =========================================================
   Puntos-guía (0..1) y nº de trazos (aprox) para las letras usadas
========================================================= */
type XY = { x: number; y: number };
const HINTS: Record<string, XY[]> = {
  // Y–R
  "や": [{ x: 0.45, y: 0.28 }, { x: 0.52, y: 0.62 }],
  "ゆ": [{ x: 0.42, y: 0.28 }, { x: 0.60, y: 0.58 }],
  "よ": [{ x: 0.46, y: 0.32 }, { x: 0.62, y: 0.58 }],
  "ら": [{ x: 0.40, y: 0.32 }, { x: 0.56, y: 0.60 }],
  "り": [{ x: 0.46, y: 0.32 }, { x: 0.58, y: 0.64 }],
  "る": [{ x: 0.50, y: 0.58 }],
  "れ": [{ x: 0.40, y: 0.32 }, { x: 0.62, y: 0.58 }],
  "ろ": [{ x: 0.50, y: 0.56 }],

  // Extra usados en palabras
  "ま": [{ x: 0.40, y: 0.30 }, { x: 0.60, y: 0.30 }, { x: 0.50, y: 0.60 }],
  "き": [{ x: 0.40, y: 0.30 }, { x: 0.64, y: 0.30 }, { x: 0.52, y: 0.58 }],
  "ん": [{ x: 0.54, y: 0.46 }],
  "こ": [{ x: 0.38, y: 0.32 }, { x: 0.62, y: 0.62 }],
  "い": [{ x: 0.44, y: 0.34 }, { x: 0.60, y: 0.58 }],
  "お": [{ x: 0.42, y: 0.26 }, { x: 0.42, y: 0.54 }, { x: 0.62, y: 0.62 }],
  "う": [{ x: 0.54, y: 0.40 }, { x: 0.50, y: 0.64 }],
  // con dakuten (punto de referencia)
  "ご": [{ x: 0.38, y: 0.32 }, { x: 0.62, y: 0.62 }, { x: 0.78, y: 0.22 }],
  "ぞ": [{ x: 0.38, y: 0.30 }, { x: 0.62, y: 0.60 }, { x: 0.78, y: 0.22 }],
};

const STROKE_COUNT: Record<string, number> = {
  や: 2, ゆ: 2, よ: 2, ら: 2, り: 2, る: 1, れ: 2, ろ: 1,
  ま: 3, き: 3, ん: 1, こ: 2, い: 2, お: 3, う: 2, ご: 3, ぞ: 3,
};

/* =========================================================
   Helpers de audio: precargar y reproducir
========================================================= */
async function ensurePlaybackMode() {
  await Audio.setIsEnabledAsync(true);
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

function useWordAudio() {
  const bankRef = useRef<Partial<Record<WordItem["id"], Audio.Sound>>>({});
  const currentRef = useRef<Audio.Sound | null>(null);
  const [ready, setReady] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensurePlaybackMode();
        for (const key of Object.keys(WORD_AUDIO) as WordItem["id"][]) {
          const mod = WORD_AUDIO[key];
          const asset = Asset.fromModule(mod);
          await asset.downloadAsync();
          const s = new Audio.Sound();
          await s.loadAsync({ uri: asset.localUri || asset.uri }, { shouldPlay: false, volume: 1.0 });
          bankRef.current[key] = s;
        }
        if (!cancelled) setReady(true);
      } catch (e) {
        console.warn("[useWordAudio] preload error:", e);
        if (!cancelled) setReady(true);
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

  const playById = useCallback(async (id: WordItem["id"]) => {
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
   Marco de trazos
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
          hints.map((h, i) => (
            <G key={`hint-${i}`} opacity={0.96}>
              <Circle cx={h.x * size} cy={h.y * size} r={12} fill="#DC2626" />
              <SvgText
                x={h.x * size}
                y={h.y * size + 1}
                fontSize={12}
                fontWeight="bold"
                fill="#fff"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {i + 1}
              </SvgText>
            </G>
          ))}
      </Svg>
      <Text style={{ textAlign: "center", marginTop: 6, fontWeight: "800", color: "#111827" }}>
        {count ? `${count} trazos` : "Trazos"}
      </Text>
    </View>
  );
}

/* =========================================================
   Grabación compartida (repite)
========================================================= */
function useRecorder() {
  const recRef = useRef<Audio.Recording | null>(null);
  const [recURI, setRecURI] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: false,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.warn("[recorder] audioMode error:", e);
      }
    })();
  }, []);

  const start = useCallback(async () => {
    if (isRecording) return;
    const rec = new Audio.Recording();
    try {
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      recRef.current = rec;
      setIsRecording(true);
    } catch (e) {
      console.warn("[recorder] start error:", e);
    }
  }, [isRecording]);

  const stop = useCallback(async () => {
    if (!isRecording || !recRef.current) return;
    try {
      await recRef.current.stopAndUnloadAsync();
      setRecURI(recRef.current.getURI() ?? null);
    } catch (e) {
      console.warn("[recorder] stop error:", e);
    } finally {
      recRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  const play = useCallback(async () => {
    if (!recURI) return;
    setIsPlayingBack(true);
    let sound: Audio.Sound | null = null;
    try {
      const created = await Audio.Sound.createAsync({ uri: recURI }, { shouldPlay: true });
      sound = created.sound;
      sound.setOnPlaybackStatusUpdate((st) => {
        const s = st as AVPlaybackStatusSuccess;
        if (s.isLoaded && s.didJustFinish) {
          setIsPlayingBack(false);
          setTimeout(() => sound?.unloadAsync().catch(() => {}), 0);
        }
      });
    } catch (e) {
      console.warn("[recorder] playback error:", e);
      setIsPlayingBack(false);
      try { await sound?.unloadAsync(); } catch {}
    }
  }, [recURI]);

  return { recURI, isRecording, isPlayingBack, start, stop, play };
}

/* =========================================================
   Pantalla principal
========================================================= */
export default function YR_AudioInteractivo() {
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });
  const [currentKana, setCurrentKana] = useState<string>("や");
  const [showGrid, setShowGrid] = useState(true);
  const [showGuide, setShowGuide] = useState(true);

  const { ready, playById } = useWordAudio();
  const recorder = useRecorder();

  const howTo = "Escucha la palabra, toca los chips para ver cómo se escribe cada letra y luego repite grabando tu voz.";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Audio interactivo — Y・R（や・ゆ・よ・ら・り・る・れ・ろ）</Text>
      <Text style={styles.subtitle}>{howTo}</Text>

      {/* ===== Selector y frame dinámico arriba ===== */}
      <Text style={styles.sectionTitle}>Letras Y–R</Text>

      <View style={styles.selectorRowWrap}>
        {YR_FAMILY.map((p) => {
          const active = currentKana === p.kana;
          return (
            <Pressable
              key={p.kana}
              onPress={() => setCurrentKana(p.kana)}
              style={[styles.kanaBtnSmall, active && styles.kanaBtnActive]}
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

      {/* ===== Palabras (escuchar, tocar y repetir) ===== */}
      {WORDS.map((w) => (
        <View key={w.id} style={styles.card}>
          <Text style={styles.jp}>{w.jp}</Text>
          <Text style={styles.romaji}>{w.romaji}</Text>
          <Text style={styles.es}>{w.es}</Text>

          <View style={styles.row}>
            <Pressable
              onPress={() => playById(w.id)}
              disabled={!ready}
              style={({ pressed }) => [styles.btnDark, (pressed || !ready) && styles.btnPressed]}
            >
              <Text style={styles.btnText}>{ready ? "▶︎ Escuchar" : "Cargando audio…"}</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionSmall}>Letra por letra</Text>
          <View style={styles.kanaWrap}>
            {w.kanaBreak.map((k, idx) => (
              <LetterChip
                key={`${w.id}-${k.kana}-${idx}`}
                part={k}
                onOpen={(kana) => setCurrentKana(kana)}
              />
            ))}
          </View>

          {/* Repite */}
          <View style={styles.row}>
            {!recorder.isRecording ? (
              <Pressable style={styles.btnOutline} onPress={recorder.start}>
                <Text style={[styles.btnText, styles.btnTextDark]}>● Grabar</Text>
              </Pressable>
            ) : (
              <Pressable style={[styles.btnOutline, styles.btnStop]} onPress={recorder.stop}>
                <Text style={[styles.btnText]}>■ Detener</Text>
              </Pressable>
            )}
            <Pressable
              style={styles.btnOutline}
              onPress={recorder.play}
              disabled={!recorder.recURI || recorder.isPlayingBack}
            >
              <Text style={[styles.btnText, styles.btnTextDark]}>
                {recorder.isPlayingBack ? "Reproduciendo…" : "▶︎ Mi voz"}
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/* ====== Chip con modal de trazo ====== */
function LetterChip({ part, onOpen }: { part: KanaPart; onOpen: (kana: string) => void }) {
  const [open, setOpen] = useState(false);
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });

  return (
    <>
      <Pressable onPress={() => { onOpen(part.kana); setOpen(true); }} style={styles.kanaChip}>
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
    width: "22%",
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
    marginHorizontal: 16,
    marginTop: 12,
  },
  jp: { fontSize: 28, textAlign: "center", lineHeight: 36 },
  romaji: { textAlign: "center", marginTop: 4, color: "#555", fontWeight: "700" },
  es: { textAlign: "center", marginTop: 2, color: "#6b7280", fontSize: 12 },

  row: { flexDirection: "row", justifyContent: "center", marginTop: 10, columnGap: 10 },
  btnDark: { backgroundColor: INK, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 140, alignItems: "center" },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
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
  kanaBig: { fontSize: 22, fontWeight: "800", color: "#111" },
  kanaSmall: { fontSize: 12, color: "#6b7280", marginTop: 2, fontWeight: "700" },

  btnOutline: {
    borderWidth: 2,
    borderColor: "#111",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 140,
    alignItems: "center",
  },
  btnTextDark: { color: "#111", fontWeight: "800" },
  btnStop: { backgroundColor: "#111", borderColor: "#111" },

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
