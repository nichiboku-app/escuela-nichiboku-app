// src/screens/N5/HiraganaWN/WN_LecturaFrases.tsx
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ===================== Tipos ===================== */
type Phrase = {
  id: string;
  jp: string;      // con espacios/puntuación (para referencia interna)
  romaji: string;  // guía principal
  es: string;      // ayuda en español
};

type Tile = { uid: string; ch: string; required: boolean };

/* ===================== Datos ===================== */
const PHRASES: Phrase[] = [
  { id: "watashi_wa",        jp: "わたしは 〜 です。",     romaji: "watashi wa ~ desu.",       es: "Yo soy ~." },
  { id: "ringo_wo_tabemasu", jp: "りんごを たべます。",   romaji: "ringo o tabemasu.",        es: "Como manzana." },
  { id: "konbanwa",          jp: "こんばんは。",           romaji: "konbanwa.",                es: "Buenas noches." },
  { id: "ongaku_ga_suki",    jp: "おんがくが すきです。", romaji: "ongaku ga suki desu.",     es: "Me gusta la música." },
  { id: "tenki_ga_ii",       jp: "てんきが いいです。",   romaji: "tenki ga ii desu.",        es: "Hace buen clima." },
  { id: "enpitsu_kaimasu",   jp: "えんぴつを かいます。", romaji: "enpitsu o kaimasu.",       es: "Compro un lápiz." },
];

/* ====== MP3 locales ====== */
const PHRASE_AUDIO: Record<string, any> = {
  watashi_wa:        require("../../../../assets/audio/n5/wn/watashi_wa.mp3"),
  ringo_wo_tabemasu: require("../../../../assets/audio/n5/wn/ringo_wo_tabemasu.mp3"),
  konbanwa:          require("../../../../assets/audio/n5/wn/konbanwa.mp3"),
  ongaku_ga_suki:    require("../../../../assets/audio/n5/wn/ongaku_ga_suki.mp3"),
  tenki_ga_ii:       require("../../../../assets/audio/n5/wn/tenki_ga_ii.mp3"),
  enpitsu_kaimasu:   require("../../../../assets/audio/n5/wn/enpitsu_kaimasu.mp3"),
};

/* ===================== Trazos わ・を・ん ===================== */
type XY = { x: number; y: number };
const HINTS: Record<string, XY[]> = {
  "わ": [{ x: 0.40, y: 0.30 }, { x: 0.62, y: 0.58 }],
  "を": [{ x: 0.38, y: 0.28 }, { x: 0.56, y: 0.56 }, { x: 0.46, y: 0.50 }],
  "ん": [{ x: 0.54, y: 0.48 }],
};
const STROKE_COUNT: Record<string, number> = { "わ": 2, "を": 3, "ん": 1 };

function TraceFrame({
  char,
  showGrid = true,
  showGuide = true,
  showNumbers = true,
  size = 160,
}: {
  char: string;
  showGrid?: boolean;
  showGuide?: boolean;
  showNumbers?: boolean; // ⬅️ si es false: oculta NÚMEROS y CÍRCULOS
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
        {showGuide && (
          <SvgText
            x={size / 2}
            y={size / 2 + fontSize * 0.03}
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
        {/* ⬇️ Ahora solo renderizamos CÍRCULO + número si showNumbers es true */}
        {showGuide && showNumbers && hints.map((h, i) => (
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

/* ===================== Audio helpers ===================== */
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

function useBankAudio<T extends string>(bank: Record<T, any>) {
  const soundsRef = useRef<Partial<Record<T, Audio.Sound>>>({});
  const currentRef = useRef<Audio.Sound | null>(null);
  const [ready, setReady] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensurePlaybackMode();
        for (const key of Object.keys(bank) as T[]) {
          const mod = bank[key];
          const asset = Asset.fromModule(mod);
          await asset.downloadAsync();
          const s = new Audio.Sound();
          await s.loadAsync({ uri: asset.localUri || asset.uri }, { shouldPlay: false, volume: 1.0 });
          soundsRef.current[key] = s;
        }
        if (!cancelled) setReady(true);
      } catch (e) {
        console.warn("[WN_LecturaFrases] preload error:", e);
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
      (async () => {
        try { await currentRef.current?.unloadAsync(); } catch {}
        const all = Object.values(soundsRef.current).filter(Boolean) as Audio.Sound[];
        for (const s of all) { try { await s.unloadAsync(); } catch {} }
        soundsRef.current = {};
        currentRef.current = null;
      })();
    };
  }, []);

  const play = useCallback(async (key: T) => {
    const s = soundsRef.current[key];
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

  return { ready, play };
}

/* ===================== Utils ===================== */
const MAX_OPTIONS = 14;
const DISTRACTORS_POOL = ["わ","を","ん","ら","り","る","れ","ろ","や","ゆ","よ","ま","み","む","め","も","あ","い","う","え","お"];

function normalizeJP(s: string): string {
  return s.replace(/[ \u3000。、・〜ー\.！!？?]/g, "");
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ===================== UI ===================== */
export default function WN_LecturaFrases() {
  const [step, setStep] = useState(0);
  const phrase = PHRASES[step];

  const { ready: audioReady, play } = useBankAudio(PHRASE_AUDIO);
  const { playCorrect, playWrong } = useFeedbackSounds();

  // Controles de trazos (globales)
  const [bigFrames, setBigFrames] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true); // ⬅️ controla círculos y números

  // Objetivo (sin pistas en hiragana)
  const target = useMemo(() => Array.from(normalizeJP(phrase.jp)), [phrase.jp]);
  const targetLen = target.length;

  // Banco de fichas + estado
  const [pool, setPool] = useState<Tile[]>([]);
  const [picked, setPicked] = useState<Tile[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [lock, setLock] = useState(false);

  useEffect(() => {
    const reqTiles: Tile[] = target.map((ch) => ({ uid: uid(), ch, required: true }));
    const needExtra = Math.max(0, MAX_OPTIONS - reqTiles.length);
    const poolCandidates = shuffle(DISTRACTORS_POOL.filter((d) => !target.includes(d)));
    const extraTiles: Tile[] = poolCandidates.slice(0, needExtra).map((ch) => ({ uid: uid(), ch, required: false }));
    const initialPool = shuffle([...reqTiles, ...extraTiles]);
    setPool(initialPool);
    setPicked([]);
    setChecked(null);
    setLock(false);
  }, [target]);

  const onPick = (tile: Tile) => {
    if (lock) return;
    if (picked.length >= targetLen) return;
    setPool((p) => p.filter((t) => t.uid !== tile.uid));
    setPicked((p) => [...p, tile]);
    setChecked(null);
  };

  const onRemovePicked = (idx: number) => {
    if (lock) return;
    setPicked((p) => {
      const copy = p.slice();
      const [t] = copy.splice(idx, 1);
      if (t) setPool((poolPrev) => shuffle([...poolPrev, t]));
      return copy;
    });
    setChecked(null);
  };

  const onClear = () => {
    if (lock) return;
    setPool((p) => shuffle([...p, ...picked]));
    setPicked([]);
    setChecked(null);
  };

  const isFull = picked.length === targetLen;
  const userStr = picked.map((t) => t.ch).join("");
  const correctStr = target.join("");

  const onCheck = async () => {
    if (lock) return;
    if (!isFull) {
      await playWrong();
      setChecked(false);
      return;
    }
    const ok = userStr === correctStr;
    setChecked(ok);
    if (ok) await playCorrect();
    else await playWrong();
  };

  useEffect(() => {
    if (picked.length === targetLen && targetLen > 0) {
      onCheck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked.length, targetLen]);

  const next = () => {
    if (lock) return;
    setStep((s) => (s + 1) % PHRASES.length);
  };

  const renderPoolItem = ({ item }: { item: Tile }) => (
    <Pressable onPress={() => onPick(item)} style={styles.kanaOption}>
      <Text style={styles.kanaOptionTxt}>{item.ch}</Text>
      {!item.required && <Text style={styles.kanaHint}>extra</Text>}
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
      <Text style={styles.title}>Ordena la frase — W–N</Text>
      <Text style={styles.subtitle}>
        Forma la oración en <Text style={{ fontWeight: "800" }}>hiragana</Text> tocando las letras en orden.
        Te mostramos el <Text style={{ fontWeight: "800" }}>romaji</Text> como guía.
      </Text>

      {/* ===== Controles de trazo (globales) ===== */}
      <View style={styles.controlsRow}>
        <Pressable
          onPress={() => setBigFrames((v) => !v)}
          style={[styles.pill, bigFrames && styles.pillActive]}
        >
          <Text style={[styles.pillText, bigFrames && styles.pillTextActive]}>
            {bigFrames ? "Reducir" : "Ampliar"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setShowNumbers((v) => !v)}
          style={[styles.pill, !showNumbers && styles.pillActive]}
        >
          <Text style={[styles.pillText, !showNumbers && styles.pillTextActive]}>
            {showNumbers ? "Ocultar números" : "Mostrar números"}
          </Text>
        </Pressable>
      </View>

      {/* ===== Sección: Nuevas letras わ・を・ん ===== */}
      <View style={styles.kanaRow}>
        <View style={styles.kanaCard}>
          <Text style={styles.kanaHead}>わ (wa)</Text>
          <TraceFrame char="わ" size={bigFrames ? 220 : 160} showNumbers={showNumbers} />
          <Text style={styles.kanaNote}>
            Uso: sonido “wa” en palabras (ej. <Text style={styles.bold}>わたし</Text>). Ojo: la <Text style={styles.bold}>partícula “wa”</Text> se escribe
            <Text style={styles.bold}> は</Text>, no わ.
          </Text>
        </View>

        <View style={styles.kanaCard}>
          <Text style={styles.kanaHead}>を (o)</Text>
          <TraceFrame char="を" size={bigFrames ? 220 : 160} showNumbers={showNumbers} />
          <Text style={styles.kanaNote}>
            Uso: partícula del <Text style={styles.bold}>objeto directo</Text>. Se <Text style={styles.bold}>pronuncia “o”</Text>. Ej.: りんご
            <Text style={styles.bold}>を</Text> たべます。
          </Text>
        </View>

        <View style={styles.kanaCard}>
          <Text style={styles.kanaHead}>ん (n)</Text>
          <TraceFrame char="ん" size={bigFrames ? 220 : 160} showNumbers={showNumbers} />
          <Text style={styles.kanaNote}>
            Uso: <Text style={styles.bold}>nasal</Text>. Puede cerrar palabra (ej. ほん). Antes de <Text style={styles.bold}>b/m/p</Text> suena como “m”
            (しんぶん ≈ “shimbun”). No añade vocal.
          </Text>
        </View>
      </View>

      {/* ===== Tarjeta de ejercicio ===== */}
      <View style={[styles.card, checked === true && styles.cardOk, checked === false && styles.cardBad]}>
        <Text style={styles.romaji}>{phrase.romaji}</Text>
        <Text style={styles.es}>{phrase.es}</Text>

        <View style={styles.slotsWrap}>
          {Array.from({ length: targetLen }).map((_, i) => {
            const tile = picked[i];
            const showWrong = checked === false && tile && tile.ch !== target[i];
            return (
              <Pressable
                key={`slot-${i}`}
                onPress={() => onRemovePicked(i)}
                style={[
                  styles.slot,
                  tile && styles.slotFilled,
                  showWrong && styles.slotWrong,
                  checked === true && styles.slotOk,
                ]}
              >
                <Text style={[styles.slotText, tile && styles.slotTextFilled]}>
                  {tile ? tile.ch : "＿"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.row}>
          <Pressable
            onPress={() => play(phrase.id as any)}
            disabled={!audioReady}
            style={[styles.btnDark, !audioReady && styles.btnDisabled]}
          >
            <Text style={styles.btnText}>{audioReady ? "▶︎ Escuchar" : "Cargando…"}</Text>
          </Pressable>

          <Pressable onPress={onClear} style={styles.btnOutline}>
            <Text style={styles.btnTextDark}>Limpiar</Text>
          </Pressable>

          {checked === true && (
            <Pressable onPress={next} style={styles.btnDark}>
              <Text style={styles.btnText}>Siguiente ›</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.choicesCard}>
        <Text style={styles.sectionSmall}>Elige letras (incluye distractores)</Text>
        <FlatList
          data={pool}
          keyExtractor={(t) => t.uid}
          renderItem={renderPoolItem}
          numColumns={5}
          columnWrapperStyle={{ justifyContent: "flex-start", gap: 10 }}
          contentContainerStyle={{ gap: 10 }}
          scrollEnabled={false}
        />
        <Text style={styles.helpSmall}>
          Tip: si te equivocas, toca un cuadro de tu respuesta para devolver esa letra.
        </Text>
      </View>
    </ScrollView>
  );
}

/* ===================== Estilos ===================== */
const INK = "#111827";
const PAPER = "#faf7f0";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAPER },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: 12 },
  subtitle: { textAlign: "center", fontSize: 13, color: "#444", marginTop: 6, marginBottom: 10, paddingHorizontal: 16 },

  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#C4B69B",
    backgroundColor: "#FFFDF9",
    minHeight: 44,
    minWidth: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: { backgroundColor: "#111827", borderColor: "#111827" },
  pillText: { color: "#3B2B1B", fontWeight: "800" },
  pillTextActive: { color: "#fff" },

  kanaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  kanaCard: {
    flexGrow: 1,
    minWidth: 220,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  kanaHead: { fontWeight: "900", color: "#111827", marginBottom: 6, textAlign: "center" },
  kanaNote: { marginTop: 8, color: "#374151" },
  bold: { fontWeight: "900", color: "#111827" },

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
    borderWidth: 2,
    borderColor: "#111827",
    marginHorizontal: 16,
    marginTop: 10,
  },
  cardOk: { borderColor: "#16a34a", backgroundColor: "#ecfdf5" },
  cardBad: { borderColor: "#dc2626", backgroundColor: "#fef2f2" },

  romaji: { textAlign: "center", color: "#111827", fontWeight: "900", fontSize: 16 },
  es: { textAlign: "center", color: "#6b7280", marginTop: 2, fontWeight: "700" },

  slotsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  slot: {
    minWidth: 38, minHeight: 42,
    borderWidth: 2, borderColor: "#111", borderStyle: "dashed",
    borderRadius: 10, alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff", paddingHorizontal: 6,
  },
  slotFilled: { borderStyle: "solid", backgroundColor: "#f8fafc" },
  slotWrong: { borderColor: "#dc2626", backgroundColor: "#fef2f2" },
  slotOk: { borderColor: "#16a34a" },
  slotText: { fontSize: 22, fontWeight: "900", color: "#9ca3af" },
  slotTextFilled: { color: INK },

  row: { flexDirection: "row", justifyContent: "center", marginTop: 10, columnGap: 10 },
  btnDark: { backgroundColor: INK, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 120, alignItems: "center" },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontWeight: "800" },

  btnOutline: {
    borderWidth: 2, borderColor: "#111", backgroundColor: "#fff",
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 120, alignItems: "center",
  },
  btnTextDark: { color: "#111", fontWeight: "800" },

  choicesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionSmall: { fontWeight: "900", marginBottom: 8, color: "#1f2937" },
  kanaOption: {
    flex: 1,
    minWidth: 54,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#111",
    backgroundColor: "#FFF8EF",
    alignItems: "center",
  },
  kanaOptionTxt: { fontSize: 22, fontWeight: "900", color: "#111" },
  kanaHint: { fontSize: 10, color: "#6b7280", marginTop: 2 },

  helpSmall: { marginTop: 8, color: "#6b7280", fontSize: 12, textAlign: "center" },
});
