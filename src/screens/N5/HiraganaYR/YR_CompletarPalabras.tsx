// src/screens/N5/HiraganaYR/YR_CompletarPalabras.tsx
import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* =========================================================
   Audios locales (si faltan, el botón “Escuchar” se desactiva)
========================================================= */
const AUDIO_BANK: Record<string, any> = {
  yama: require("../../../../assets/audio/n5/yr/yama.mp3"),
  yuki: require("../../../../assets/audio/n5/yr/yuki.mp3"),
  yoru: require("../../../../assets/audio/n5/yr/yoru.mp3"),
  ringo: require("../../../../assets/audio/n5/yr/ringo.mp3"),
  reizouko: require("../../../../assets/audio/n5/yr/reizouko.mp3"),
  raion: require("../../../../assets/audio/n5/yr/raion.mp3"),
};

type FillItem = {
  id: string;
  jp: string;
  romaji: string;
  es: string;
  missingIdx: number[]; // índices de los huecos
};

/* =========================================================
   Palabras (con 20 extra)
========================================================= */
const FILL_DATA: FillItem[] = [
  // Base
  { id: "yama", jp: "やま", romaji: "yama", es: "montaña", missingIdx: [0, 1] },
  { id: "yuki", jp: "ゆき", romaji: "yuki", es: "nieve", missingIdx: [0, 1] },
  { id: "yoru", jp: "よる", romaji: "yoru", es: "noche", missingIdx: [0, 1] },
  { id: "ringo", jp: "りんご", romaji: "ringo", es: "manzana", missingIdx: [0, 2] },
  { id: "reizouko", jp: "れいぞうこ", romaji: "reizōko", es: "refrigerador", missingIdx: [0, 2, 4, 5] },
  { id: "raion", jp: "らいおん", romaji: "raion", es: "león", missingIdx: [0, 1] },

  // Extra (20)
  { id: "yasai", jp: "やさい", romaji: "yasai", es: "verduras", missingIdx: [0, 2] },
  { id: "yasumi", jp: "やすみ", romaji: "yasumi", es: "descanso", missingIdx: [0, 2] },
  { id: "yasui", jp: "やすい", romaji: "yasui", es: "barato", missingIdx: [0, 3] },
  { id: "yane", jp: "やね", romaji: "yane", es: "techo", missingIdx: [0, 1] },
  { id: "yume", jp: "ゆめ", romaji: "yume", es: "sueño", missingIdx: [0, 1] },
  { id: "yubi", jp: "ゆび", romaji: "yubi", es: "dedo", missingIdx: [0] },
  { id: "yomi", jp: "よみ", romaji: "yomi", es: "lectura", missingIdx: [0, 1] },
  { id: "yoyaku", jp: "よやく", romaji: "yoyaku", es: "reserva", missingIdx: [0, 1] },
  { id: "raigetsu", jp: "らいげつ", romaji: "raigetsu", es: "el mes que viene", missingIdx: [0, 1] },
  { id: "rainen", jp: "らいねん", romaji: "rainen", es: "el año que viene", missingIdx: [0, 1] },
  { id: "raku", jp: "らく", romaji: "raku", es: "fácil/cómodo", missingIdx: [0] },
  { id: "risu", jp: "りす", romaji: "risu", es: "ardilla", missingIdx: [0] },
  { id: "riyuu", jp: "りゆう", romaji: "riyū", es: "razón", missingIdx: [0, 1] },
  { id: "ryokou", jp: "りょこう", romaji: "ryokō", es: "viaje", missingIdx: [0] },
  { id: "rusu", jp: "るす", romaji: "rusu", es: "no estar en casa", missingIdx: [0] },
  { id: "rei", jp: "れい", romaji: "rei", es: "cero / ejemplo", missingIdx: [0, 1] },
  { id: "rekishi", jp: "れきし", romaji: "rekishi", es: "historia", missingIdx: [0, 1] },
  { id: "renshuu", jp: "れんしゅう", romaji: "renshū", es: "práctica", missingIdx: [0] },
  { id: "roku", jp: "ろく", romaji: "roku", es: "seis", missingIdx: [0] },
  { id: "rouka", jp: "ろうか", romaji: "rōka", es: "pasillo", missingIdx: [0] },
  { id: "roba", jp: "ろば", romaji: "roba", es: "burro", missingIdx: [0] },
  { id: "yomimono", jp: "よみもの", romaji: "yomimono", es: "lecturas", missingIdx: [0, 2] },
  { id: "yorugohan", jp: "よるごはん", romaji: "yoru-gohan", es: "cena", missingIdx: [0] },
  { id: "youfuku", jp: "ようふく", romaji: "yōfuku", es: "ropa", missingIdx: [0] },
  { id: "renraku", jp: "れんらく", romaji: "renraku", es: "contacto", missingIdx: [0] },
];

/* =========================================================
   Pool global de opciones
========================================================= */
const EXTRA_BANK = ["は", "ひ", "ふ", "ま", "み", "も"]; // 6 letras “ya vistas”
const BASE_YR = ["や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ"];
const EXTRA_BASE = ["い", "お", "う", "き", "こ", "す", "ね", "し", "て", "く", "ご", "ぞ", "ん"];
const MAX_OPTIONS = 14; // cantidad final en la bandeja

/* =========================================================
   Hints (para modal de Trazos) — opcional
========================================================= */
type XY = { x: number; y: number };
const HINTS: Record<string, XY[]> = {
  や: [{ x: 0.45, y: 0.28 }, { x: 0.52, y: 0.62 }],
  ゆ: [{ x: 0.42, y: 0.28 }, { x: 0.60, y: 0.58 }],
  よ: [{ x: 0.46, y: 0.32 }, { x: 0.62, y: 0.58 }],
  ら: [{ x: 0.40, y: 0.32 }, { x: 0.56, y: 0.60 }],
  り: [{ x: 0.46, y: 0.32 }, { x: 0.58, y: 0.64 }],
  る: [{ x: 0.50, y: 0.58 }],
  れ: [{ x: 0.40, y: 0.32 }, { x: 0.62, y: 0.58 }],
  ろ: [{ x: 0.50, y: 0.56 }],
  ま: [{ x: 0.40, y: 0.30 }, { x: 0.60, y: 0.30 }, { x: 0.50, y: 0.60 }],
  み: [{ x: 0.44, y: 0.32 }, { x: 0.60, y: 0.60 }],
  ふ: [{ x: 0.42, y: 0.18 }, { x: 0.58, y: 0.18 }, { x: 0.52, y: 0.62 }],
  は: [{ x: 0.40, y: 0.20 }, { x: 0.62, y: 0.22 }, { x: 0.56, y: 0.60 }],
  ひ: [{ x: 0.55, y: 0.45 }],
  ほ: [{ x: 0.40, y: 0.20 }, { x: 0.62, y: 0.20 }, { x: 0.60, y: 0.58 }, { x: 0.50, y: 0.64 }],
  き: [{ x: 0.40, y: 0.30 }, { x: 0.64, y: 0.30 }, { x: 0.52, y: 0.58 }],
  こ: [{ x: 0.38, y: 0.32 }, { x: 0.62, y: 0.62 }],
  い: [{ x: 0.44, y: 0.34 }, { x: 0.60, y: 0.58 }],
  お: [{ x: 0.42, y: 0.26 }, { x: 0.42, y: 0.54 }, { x: 0.62, y: 0.62 }],
  う: [{ x: 0.54, y: 0.40 }, { x: 0.50, y: 0.64 }],
  す: [{ x: 0.45, y: 0.30 }, { x: 0.55, y: 0.65 }],
  ね: [{ x: 0.45, y: 0.30 }, { x: 0.60, y: 0.55 }],
  し: [{ x: 0.55, y: 0.45 }],
  て: [{ x: 0.45, y: 0.30 }, { x: 0.58, y: 0.55 }],
  く: [{ x: 0.55, y: 0.45 }],
  ご: [{ x: 0.38, y: 0.32 }, { x: 0.62, y: 0.62 }, { x: 0.78, y: 0.22 }],
  ぞ: [{ x: 0.38, y: 0.30 }, { x: 0.62, y: 0.60 }, { x: 0.78, y: 0.22 }],
  ん: [{ x: 0.54, y: 0.46 }],
};
const STROKE_COUNT: Record<string, number> = {
  や: 2, ゆ: 2, よ: 2, ら: 2, り: 2, る: 1, れ: 2, ろ: 1,
  ま: 3, み: 2, ふ: 3, は: 3, ひ: 1, ほ: 4,
  き: 3, こ: 2, い: 2, お: 3, う: 2, す: 2, ね: 2, し: 1, て: 2, く: 1, ご: 3, ぞ: 3, ん: 1,
};

/* =========================================================
   Utils
========================================================= */
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* =========================================================
   Audio helpers (palabra)
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
  const bankRef = useRef<Record<string, Audio.Sound>>({});
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const currentRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensurePlaybackMode();
        const ids = Object.keys(AUDIO_BANK);
        for (const id of ids) {
          const asset = Asset.fromModule(AUDIO_BANK[id]);
          await asset.downloadAsync();
          const s = new Audio.Sound();
          await s.loadAsync({ uri: asset.localUri || asset.uri }, { shouldPlay: false, volume: 1.0 });
          bankRef.current[id] = s;
        }
        if (!cancelled) {
          setLoadedIds(new Set(ids));
          setReady(true);
        }
      } catch (e) {
        console.warn("[useWordAudio]", e);
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
      (async () => {
        try { await currentRef.current?.unloadAsync(); } catch {}
        for (const s of Object.values(bankRef.current)) {
          try { await s.unloadAsync(); } catch {}
        }
      })();
    };
  }, []);

  const hasAudio = useCallback((id: string) => loadedIds.has(id), [loadedIds]);

  const play = useCallback(async (id: string) => {
    const s = bankRef.current[id];
    if (!s) return;
    await ensurePlaybackMode();
    if (currentRef.current && currentRef.current !== s) {
      try { await currentRef.current.stopAsync(); } catch {}
    }
    currentRef.current = s;
    try { await s.playFromPositionAsync(0); } catch {}
  }, []);

  return { ready, hasAudio, play };
}

/* =========================================================
   Marco de trazos (modal)
========================================================= */
function TraceFrame({
  char, showGrid = true, showGuide = true, fontLoaded, size = 200,
}: { char: string; showGrid?: boolean; showGuide?: boolean; fontLoaded: boolean; size?: number; }) {
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
        {showGuide && hints.map((h, i) => (
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
   Pantalla principal
========================================================= */
export default function YR_CompletarPalabras() {
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });
  const { ready, hasAudio, play } = useWordAudio();

  // ✅ Usa el hook global de SFX
  const { playCorrect, playWrong } = useFeedbackSounds();

  // puntos + logro (solo una vez)
  const [points, setPoints] = useState(0);
  const [firstWin, setFirstWin] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);

  const [step, setStep] = useState(0);
  const word = FILL_DATA[step];
  const chars = useMemo(() => Array.from(word.jp), [word]);
  const missingSet = useMemo(() => new Set(word.missingIdx), [word.missingIdx]);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedBlank, setSelectedBlank] = useState<number | null>(word.missingIdx[0] ?? null);
  const [wrongSet, setWrongSet] = useState<Set<number>>(new Set());
  const [openTrace, setOpenTrace] = useState<string | null>(null);

  // Opciones: garantiza necesarias + rellena con distractores
  const options = useMemo(() => {
    const required = uniq(word.missingIdx.map((i) => chars[i]));
    const distractorPool = uniq([
      ...EXTRA_BANK,
      ...BASE_YR,
      ...EXTRA_BASE,
      ...chars,
    ]).filter((k) => !required.includes(k));

    const needed = Math.max(0, MAX_OPTIONS - required.length);
    const picked = shuffle(distractorPool).slice(0, needed);
    return shuffle([...required, ...picked]);
  }, [word, chars]);

  useEffect(() => {
    // reset al cambiar de palabra
    setAnswers({});
    setSelectedBlank(word.missingIdx[0] ?? null);
    setWrongSet(new Set());
  }, [word]);

  const isComplete = word.missingIdx.every((i) => !!answers[i]);
  const isAllCorrect = isComplete && word.missingIdx.every((i) => answers[i] === chars[i]);

  // ✅ Logro automático al completar BIEN el primer ejercicio
  useEffect(() => {
    if (!firstWin) {
      const complete = word.missingIdx.every((i) => !!answers[i]);
      const correct = complete && word.missingIdx.every((i) => answers[i] === chars[i]);
      if (correct) {
        setPoints((p) => p + 10);
        setFirstWin(true);
        setShowAchievement(true);
        (async () => { try { await playCorrect(); } catch {} })();
      }
    }
  }, [answers, chars, word, firstWin, playCorrect]);

  const fillBlank = (kana: string) => {
    const target =
      selectedBlank !== null && missingSet.has(selectedBlank)
        ? selectedBlank
        : word.missingIdx.find((i) => !answers[i]);
    if (target === undefined) return;
    setAnswers((p) => ({ ...p, [target]: kana }));
    setWrongSet((s) => {
      const next = new Set(s);
      next.delete(target);
      return next;
    });
  };

  const clearBlank = (i: number) => {
    setAnswers((p) => {
      const n = { ...p };
      delete n[i];
      return n;
    });
    setWrongSet((s) => {
      const n = new Set(s);
      n.delete(i);
      return n;
    });
    setSelectedBlank(i);
  };

  const check = async () => {
    if (!isComplete) {
      const empties = word.missingIdx.filter((i) => !answers[i]);
      setWrongSet(new Set(empties));
      await playWrong();
      return;
    }
    const wrong = word.missingIdx.filter((i) => answers[i] !== chars[i]);
    if (wrong.length === 0) {
      await playCorrect();
    } else {
      setWrongSet(new Set(wrong));
      await playWrong();
    }
  };

  const next = () => {
    const nxt = (step + 1) % FILL_DATA.length;
    setStep(nxt);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
      <Text style={styles.title}>Completar palabras — Y・R</Text>
      <Text style={styles.subtitle}>
        Completa las letras que faltan. Toca <Text style={{ fontWeight: "800" }}>Escuchar</Text> si hay audio y mantén
        una opción para ver sus <Text style={{ fontWeight: "800" }}>Trazos</Text>.
      </Text>

      {/* Puntos */}
      <View style={styles.pointsPill}>
        <Text style={styles.pointsTxt}>⭐ Puntos: {points}</Text>
      </View>

      {/* ===== Tarjeta de ejercicio ===== */}
      <View style={styles.card}>
        <Text style={styles.es}>{word.es}</Text>
        <Text style={styles.romaji}>{word.romaji}</Text>

        {/* JP con huecos */}
        <View style={styles.jpWrap}>
          {chars.map((ch, i) => {
            const isMissing = missingSet.has(i);
            if (!isMissing) {
              return (
                <View key={`ch-${i}`} style={styles.fixedKanaBox}>
                  <Text style={styles.fixedKana}>{ch}</Text>
                </View>
              );
            }
            const filled = (answers as any)[i];
            const wrong = wrongSet.has(i);
            const selected = selectedBlank === i;
            return (
              <Pressable
                key={`blank-${i}`}
                onPress={() => setSelectedBlank(i)}
                style={[
                  styles.blankBox,
                  selected && styles.blankSelected,
                  wrong && styles.blankWrong,
                  filled && styles.blankFilled,
                ]}
              >
                <Text style={[styles.blankText, filled && styles.blankTextFilled]}>
                  {filled ?? "＿"}
                </Text>
                {filled && (
                  <Pressable onPress={() => clearBlank(i)} style={styles.clearBtn}>
                    <Text style={styles.clearTxt}>×</Text>
                  </Pressable>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.row}>
          <Pressable
            onPress={() => play(word.id)}
            disabled={!ready || !hasAudio(word.id)}
            style={[styles.btnDark, (!ready || !hasAudio(word.id)) && styles.btnDisabled]}
          >
            <Text style={styles.btnText}>
              {ready ? (hasAudio(word.id) ? "▶︎ Escuchar" : "Sin audio") : "Cargando…"}
            </Text>
          </Pressable>
          <Pressable onPress={check} style={[styles.btnOutline, isAllCorrect && styles.btnOk]}>
            <Text style={[styles.btnTextDark]}>{isAllCorrect ? "¡Correcto!" : "Comprobar"}</Text>
          </Pressable>
          {isAllCorrect && (
            <Pressable onPress={next} style={[styles.btnDark]}>
              <Text style={styles.btnText}>Siguiente ›</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ===== Opciones ===== */}
      <View style={styles.choicesCard}>
        <Text style={styles.sectionSmall}>Elige la letra</Text>
        <View style={styles.choicesWrap}>
          {options.map((k, idx) => (
            <Pressable
              key={`${word.id}-opt-${idx}-${k}`}
              onPress={() => fillBlank(k)}
              onLongPress={() => setOpenTrace(k)}
              style={styles.kanaOption}
            >
              <Text style={styles.kanaOptionTxt}>{k}</Text>
              <Text style={styles.kanaHint}>Trazos (mantén)</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.helpSmall}>Sugerencia: mantén presionada una opción para ver su trazo.</Text>
      </View>

      {/* ===== Modal de trazos ===== */}
      <Modal visible={!!openTrace} transparent animationType="fade" onRequestClose={() => setOpenTrace(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {!!openTrace && (
              <>
                <Text style={styles.modalKana}>{openTrace}</Text>
                <TraceFrame char={openTrace} fontLoaded={!!fontsLoaded} size={200} />
              </>
            )}
            <Pressable onPress={() => setOpenTrace(null)} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ===== Logro (primer acierto) ===== */}
      <Modal visible={showAchievement} transparent animationType="fade" onRequestClose={() => setShowAchievement(false)}>
        <View style={styles.achvBackdrop}>
          <View style={styles.achvCard}>
            <Text style={styles.achvBig}>🏆 ¡Logro desbloqueado!</Text>
            <Text style={styles.achvMsg}>Primer ejercicio correcto</Text>
            <Text style={styles.achvPts}>+10 puntos</Text>
            <Pressable onPress={() => setShowAchievement(false)} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
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

  pointsPill: {
    alignSelf: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 6,
  },
  pointsTxt: { color: "#fff", fontWeight: "900" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginHorizontal: 16,
  },

  es: { textAlign: "center", color: "#374151", fontWeight: "800" },
  romaji: { textAlign: "center", color: "#6b7280", marginTop: 2, fontWeight: "700" },

  jpWrap: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 8, marginTop: 12, marginBottom: 6 },
  fixedKanaBox: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10, backgroundColor: "#F3F4F6" },
  fixedKana: { fontSize: 28, fontWeight: "900", color: INK },

  blankBox: {
    minWidth: 46, minHeight: 48,
    borderWidth: 2, borderColor: "#111", borderStyle: "dashed",
    borderRadius: 12, alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff", paddingHorizontal: 8, position: "relative",
  },
  blankFilled: { borderStyle: "solid", backgroundColor: "#f8fafc" },
  blankSelected: { borderColor: "#0ea5e9" },
  blankWrong: { borderColor: "#dc2626", backgroundColor: "#fef2f2" },
  blankText: { fontSize: 26, fontWeight: "900", color: "#9ca3af" },
  blankTextFilled: { color: INK },

  clearBtn: {
    position: "absolute", right: -8, top: -8,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#111", alignItems: "center", justifyContent: "center",
  },
  clearTxt: { color: "#fff", fontWeight: "900", lineHeight: 18 },

  row: { flexDirection: "row", justifyContent: "center", marginTop: 12, columnGap: 10 },
  btnDark: { backgroundColor: INK, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 120, alignItems: "center" },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontWeight: "800" },

  btnOutline: {
    borderWidth: 2, borderColor: "#111", backgroundColor: "#fff",
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 120, alignItems: "center",
  },
  btnOk: { borderColor: "#16a34a", backgroundColor: "#ecfdf5" },
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
  choicesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kanaOption: {
    minWidth: 64, paddingVertical: 10, borderRadius: 12,
    borderWidth: 2, borderColor: "#111", backgroundColor: "#FFF8EF",
    alignItems: "center",
  },
  kanaOptionTxt: { fontSize: 22, fontWeight: "900", color: "#111" },
  kanaHint: { fontSize: 10, color: "#6b7280", marginTop: 2 },

  helpSmall: { marginTop: 8, color: "#6b7280", fontSize: 12, textAlign: "center" },

  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center", paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 18,
    width: "100%", maxWidth: 420, alignItems: "center",
  },
  modalKana: { fontSize: 60, lineHeight: 62, fontWeight: "900", color: INK, marginBottom: 8 },
  modalBtn: { backgroundColor: INK, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginTop: 10 },
  modalBtnText: { color: "#fff", fontWeight: "800" },

  achvBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center", paddingHorizontal: 16,
  },
  achvCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 18,
    width: "100%", maxWidth: 360, alignItems: "center", borderWidth: 2, borderColor: "#111827",
  },
  achvBig: { fontSize: 20, fontWeight: "900", color: "#111827" },
  achvMsg: { marginTop: 4, color: "#374151", fontWeight: "800" },
  achvPts: { marginTop: 6, fontSize: 16, fontWeight: "900", color: "#16a34a" },
});
