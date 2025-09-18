import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import type { RootStackParamList } from "../../../types";

/* =========================================================
   🔊 Audios (estático). Debes tener estos mp3 en:
   assets/audio/katakana/
   a,i,u,e,o, ka,ki,ku,ke,ko, sa,shi,su,se,so, ta,chi,tsu,te,to,
   na,ni,nu,ne,no, ha,hi,fu,he,ho, ma,mi,mu,me,mo, ya,yu,yo,
   ra,ri,ru,re,ro, wa,wo,n
========================================================= */
const KATAKANA_AUDIO: Record<string, any> = {
  a: require("../../../assets/audio/katakana/a.mp3"),
  i: require("../../../assets/audio/katakana/i.mp3"),
  u: require("../../../assets/audio/katakana/u.mp3"),
  e: require("../../../assets/audio/katakana/e.mp3"),
  o: require("../../../assets/audio/katakana/o.mp3"),
  ka: require("../../../assets/audio/katakana/ka.mp3"),
  ki: require("../../../assets/audio/katakana/ki.mp3"),
  ku: require("../../../assets/audio/katakana/ku.mp3"),
  ke: require("../../../assets/audio/katakana/ke.mp3"),
  ko: require("../../../assets/audio/katakana/ko.mp3"),
  sa: require("../../../assets/audio/katakana/sa.mp3"),
  shi: require("../../../assets/audio/katakana/shi.mp3"),
  su: require("../../../assets/audio/katakana/su.mp3"),
  se: require("../../../assets/audio/katakana/se.mp3"),
  so: require("../../../assets/audio/katakana/so.mp3"),
  ta: require("../../../assets/audio/katakana/ta.mp3"),
  chi: require("../../../assets/audio/katakana/chi.mp3"),
  tsu: require("../../../assets/audio/katakana/tsu.mp3"),
  te: require("../../../assets/audio/katakana/te.mp3"),
  to: require("../../../assets/audio/katakana/to.mp3"),
  na: require("../../../assets/audio/katakana/na.mp3"),
  ni: require("../../../assets/audio/katakana/ni.mp3"),
  nu: require("../../../assets/audio/katakana/nu.mp3"),
  ne: require("../../../assets/audio/katakana/ne.mp3"),
  no: require("../../../assets/audio/katakana/no.mp3"),
  ha: require("../../../assets/audio/katakana/ha.mp3"),
  hi: require("../../../assets/audio/katakana/hi.mp3"),
  fu: require("../../../assets/audio/katakana/fu.mp3"),
  he: require("../../../assets/audio/katakana/he.mp3"),
  ho: require("../../../assets/audio/katakana/ho.mp3"),
  ma: require("../../../assets/audio/katakana/ma.mp3"),
  mi: require("../../../assets/audio/katakana/mi.mp3"),
  mu: require("../../../assets/audio/katakana/mu.mp3"),
  me: require("../../../assets/audio/katakana/me.mp3"),
  mo: require("../../../assets/audio/katakana/mo.mp3"),
  ya: require("../../../assets/audio/katakana/ya.mp3"),
  yu: require("../../../assets/audio/katakana/yu.mp3"),
  yo: require("../../../assets/audio/katakana/yo.mp3"),
  ra: require("../../../assets/audio/katakana/ra.mp3"),
  ri: require("../../../assets/audio/katakana/ri.mp3"),
  ru: require("../../../assets/audio/katakana/ru.mp3"),
  re: require("../../../assets/audio/katakana/re.mp3"),
  ro: require("../../../assets/audio/katakana/ro.mp3"),
  wa: require("../../../assets/audio/katakana/wa.mp3"),
  wo: require("../../../assets/audio/katakana/wo.mp3"),
  n: require("../../../assets/audio/katakana/n.mp3"),
};

/* =========================================================
   Datos por filas (Gojūon)
========================================================= */
type RowKey = "A" | "K" | "S" | "T" | "N" | "H" | "M" | "Y" | "R" | "W";
type Item = { kana: string; romaji: string };

const ROW_LABEL: Record<RowKey, string> = {
  A: "ア行",
  K: "カ行",
  S: "サ行",
  T: "タ行",
  N: "ナ行",
  H: "ハ行",
  M: "マ行",
  Y: "ヤ行",
  R: "ラ行",
  W: "ワ行（+ン）",
};

const ROW_DATA: Record<RowKey, Item[]> = {
  A: [
    { kana: "ア", romaji: "a" },
    { kana: "イ", romaji: "i" },
    { kana: "ウ", romaji: "u" },
    { kana: "エ", romaji: "e" },
    { kana: "オ", romaji: "o" },
  ],
  K: [
    { kana: "カ", romaji: "ka" },
    { kana: "キ", romaji: "ki" },
    { kana: "ク", romaji: "ku" },
    { kana: "ケ", romaji: "ke" },
    { kana: "コ", romaji: "ko" },
  ],
  S: [
    { kana: "サ", romaji: "sa" },
    { kana: "シ", romaji: "shi" },
    { kana: "ス", romaji: "su" },
    { kana: "セ", romaji: "se" },
    { kana: "ソ", romaji: "so" },
  ],
  T: [
    { kana: "タ", romaji: "ta" },
    { kana: "チ", romaji: "chi" },
    { kana: "ツ", romaji: "tsu" },
    { kana: "テ", romaji: "te" },
    { kana: "ト", romaji: "to" },
  ],
  N: [
    { kana: "ナ", romaji: "na" },
    { kana: "ニ", romaji: "ni" },
    { kana: "ヌ", romaji: "nu" },
    { kana: "ネ", romaji: "ne" },
    { kana: "ノ", romaji: "no" },
  ],
  H: [
    { kana: "ハ", romaji: "ha" },
    { kana: "ヒ", romaji: "hi" },
    { kana: "フ", romaji: "fu" },
    { kana: "ヘ", romaji: "he" },
    { kana: "ホ", romaji: "ho" },
  ],
  M: [
    { kana: "マ", romaji: "ma" },
    { kana: "ミ", romaji: "mi" },
    { kana: "ム", romaji: "mu" },
    { kana: "メ", romaji: "me" },
    { kana: "モ", romaji: "mo" },
  ],
  Y: [
    { kana: "ヤ", romaji: "ya" },
    { kana: "ユ", romaji: "yu" },
    { kana: "ヨ", romaji: "yo" },
  ],
  R: [
    { kana: "ラ", romaji: "ra" },
    { kana: "リ", romaji: "ri" },
    { kana: "ル", romaji: "ru" },
    { kana: "レ", romaji: "re" },
    { kana: "ロ", romaji: "ro" },
  ],
  W: [
    { kana: "ワ", romaji: "wa" },
    { kana: "ヲ", romaji: "wo" },
    { kana: "ン", romaji: "n" },
  ],
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
  });
}

function useKanaAudio(ids: string[]) {
  const ref = useRef<Record<string, Audio.Sound>>({});
  const cur = useRef<Audio.Sound | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        await ensurePlaybackMode();
        for (const id of ids) {
          const mod = KATAKANA_AUDIO[id];
          if (!mod) continue; // si falta mp3 → “Sin audio”
          const asset = Asset.fromModule(mod);
          await asset.downloadAsync();
          const s = new Audio.Sound();
          await s.loadAsync({ uri: asset.localUri || asset.uri }, { shouldPlay: false, volume: 1.0 });
          ref.current[id] = s;
        }
      } catch (e) {
        console.warn("[KatakanaRow] preload error:", e);
      } finally {
        if (!cancel) setReady(true);
      }
    })();
    return () => {
      cancel = true;
      (async () => {
        try { await cur.current?.unloadAsync(); } catch {}
        for (const s of Object.values(ref.current)) {
          try { await s.unloadAsync(); } catch {}
        }
      })();
    };
  }, [ids]);

  const has = useCallback((id: string) => !!ref.current[id], []);
  const play = useCallback(async (id: string) => {
    const s = ref.current[id];
    if (!s) return;
    await ensurePlaybackMode();
    if (cur.current && cur.current !== s) {
      try { await cur.current.stopAsync(); } catch {}
    }
    cur.current = s;
    try { await s.playFromPositionAsync(0); } catch {}
  }, []);

  return { ready, has, play };
}

/* =========================================================
   Trazos (guía con fallback)
========================================================= */
type XY = { x: number; y: number };

/** Fallback genérico: si no hay guía específica, mostramos 2 puntos razonables */
const DEFAULT_HINTS: XY[] = [
  { x: 0.34, y: 0.28 }, // ①
  { x: 0.62, y: 0.60 }, // ②
];

/** Guías por carácter (puedes ir ampliando por filas) */
const HINTS: Record<string, XY[]> = {
  // A 行
  ア: [{ x: 0.35, y: 0.30 }, { x: 0.65, y: 0.62 }],
  イ: [{ x: 0.52, y: 0.28 }, { x: 0.58, y: 0.60 }],
  ウ: [{ x: 0.46, y: 0.30 }, { x: 0.65, y: 0.58 }],
  エ: [{ x: 0.40, y: 0.34 }, { x: 0.62, y: 0.60 }],
  オ: [{ x: 0.44, y: 0.26 }, { x: 0.62, y: 0.62 }],

  // K 行 (ejemplos; ajusta si quieres mayor exactitud)
  カ: [{ x: 0.40, y: 0.28 }, { x: 0.62, y: 0.58 }],
  キ: [{ x: 0.38, y: 0.30 }, { x: 0.60, y: 0.56 }],
  ク: [{ x: 0.44, y: 0.30 }, { x: 0.64, y: 0.62 }],
  ケ: [{ x: 0.36, y: 0.28 }, { x: 0.60, y: 0.58 }],
  コ: [{ x: 0.38, y: 0.34 }, { x: 0.62, y: 0.62 }],

  // Puedes ir añadiendo S/T/N/H/M/Y/R/W aquí…
};

function TraceFrame({
  char,
  size = 220,
  showGrid = true,
  showGuide = true,
  showDots = true,
}: {
  char: string;
  size?: number;
  showGrid?: boolean;
  showGuide?: boolean;
  showDots?: boolean;
}) {
  const grid = [1, 2, 3].map((i) => (i * size) / 4);
  const fontSize = size * 0.62;

  // 👉 Si no hay guía específica para el carácter, usa DEFAULT_HINTS
  const hints = (HINTS[char] && HINTS[char].length ? HINTS[char] : DEFAULT_HINTS);

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

        {showGuide && showDots && hints.map((h, i) => (
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
    </View>
  );
}

/* =========================================================
   Pantalla
========================================================= */
const INK = "#0f172a";
const PAPER = "#f6f4ee";

export default function KatakanaRow() {
  const route = useRoute<RouteProp<RootStackParamList, "KatakanaRow">>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const rowKey: RowKey = (route?.params?.row as RowKey) || "A";

  const items = ROW_DATA[rowKey];
  const ids = useMemo(() => items.map((i) => i.romaji), [items]);
  const { ready, has, play } = useKanaAudio(ids);

  const [open, setOpen] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuide, setShowGuide] = useState(true);
  const [showDots, setShowDots] = useState(true);

  const title = `Katakana — ${ROW_LABEL[rowKey]}`;

  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>Toca ▶︎ para oír el sonido; abre “Trazos” para practicar la escritura.</Text>

      {/* Grid 2 columnas */}
      <View style={s.grid}>
        {items.map((it) => {
          const disabled = !ready || !has(it.romaji);
          return (
            <View key={it.romaji} style={s.card}>
              <Text style={s.kana}>{it.kana}</Text>
              <Text style={s.romaji}>{it.romaji}</Text>

              <View style={s.rowBtns}>
                <Pressable
                  onPress={() => play(it.romaji)}
                  disabled={disabled}
                  style={[s.btn, s.btnDark, disabled && s.btnDisabled]}
                >
                  <Text style={s.btnText}>{ready ? (has(it.romaji) ? "▶ Escuchar" : "Sin audio") : "Cargando…"}</Text>
                </Pressable>

                <Pressable onPress={() => setOpen(it.kana)} style={[s.btn, s.btnOutline]}>
                  <Text style={s.btnTextDark}>Trazos</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {/* Modal trazos */}
      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            {!!open && (
              <>
                <Text style={s.modalKana}>{open}</Text>
                <TraceFrame char={open} showGrid={showGrid} showGuide={showGuide} showDots={showDots} size={220} />
                <View style={s.actions}>
                  <Pressable onPress={() => setShowGuide((v) => !v)} style={[s.pill, showGuide && s.pillActive]}>
                    <Text style={[s.pillText, showGuide && s.pillTextActive]}>Guía</Text>
                  </Pressable>
                  <Pressable onPress={() => setShowGrid((v) => !v)} style={[s.pill, showGrid && s.pillActive]}>
                    <Text style={[s.pillText, showGrid && s.pillTextActive]}>Cuadrícula</Text>
                  </Pressable>
                  <Pressable onPress={() => setShowDots((v) => !v)} style={[s.pill, showDots && s.pillActive]}>
                    <Text style={[s.pillText, showDots && s.pillTextActive]}>Números</Text>
                  </Pressable>
                </View>
              </>
            )}
            <Pressable onPress={() => setOpen(null)} style={[s.btn, s.btnDark, { marginTop: 12 }]}>
              <Text style={s.btnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAPER },
  title: { fontSize: 22, fontWeight: "900", textAlign: "center", marginTop: 12 },
  subtitle: { textAlign: "center", fontSize: 13, color: "#475569", marginTop: 6, marginBottom: 10, paddingHorizontal: 16 },

  grid: {
    paddingHorizontal: 14,
    gap: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%", // 2 columnas
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "center",
  },
  kana: { fontSize: 56, textAlign: "center", color: INK, fontWeight: "900" },
  romaji: { textAlign: "center", marginTop: 2, marginBottom: 10, color: "#6b7280", fontWeight: "800" },

  rowBtns: { flexDirection: "row", gap: 8, width: "100%" },
  btn: {
    flex: 1,
    height: 44,
    minWidth: 0,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  btnDark: { backgroundColor: INK },
  btnOutline: { borderWidth: 2, borderColor: INK, backgroundColor: "#fff" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 14 },
  btnTextDark: { color: INK, fontWeight: "900", fontSize: 14 },

  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center", paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: "#fff", borderRadius: 18, padding: 16,
    width: "100%", maxWidth: 420, alignItems: "center",
  },
  modalKana: { fontSize: 52, lineHeight: 56, fontWeight: "900", color: INK, marginBottom: 6 },

  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 999, borderWidth: 1.5, borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc", minWidth: 108, alignItems: "center",
  },
  pillActive: { backgroundColor: INK, borderColor: INK },
  pillText: { color: "#1f2937", fontWeight: "800" },
  pillTextActive: { color: "#fff" },
});
