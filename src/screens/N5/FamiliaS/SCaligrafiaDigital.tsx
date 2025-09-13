import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import Slider from "@react-native-community/slider";
import * as Speech from "expo-speech";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  GestureResponderEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ========== Mazo S/Z (20 palabras) ========== */
type WordItem = { id: string; jp: string; romaji: string; es: string };
const WORDS: WordItem[] = [
  // S
  { id: "sakana",  jp: "さかな",   romaji: "sakana",  es: "pez / pescado" },
  { id: "sashimi", jp: "さしみ",   romaji: "sashimi", es: "sashimi" },
  { id: "satou",   jp: "さとう",   romaji: "satou",   es: "azúcar" },
  { id: "shio",    jp: "しお",     romaji: "shio",    es: "sal" },
  { id: "shima",   jp: "しま",     romaji: "shima",   es: "isla" },
  { id: "shigoto", jp: "しごと",   romaji: "shigoto", es: "trabajo" },
  { id: "shinbun", jp: "しんぶん", romaji: "shinbun", es: "periódico" },
  { id: "sushi",   jp: "すし",     romaji: "sushi",   es: "sushi" },
  { id: "suika",   jp: "すいか",   romaji: "suika",   es: "sandía" },
  { id: "suzume",  jp: "すずめ",   romaji: "suzume",  es: "gorrión" },
  { id: "sumou",   jp: "すもう",   romaji: "sumou",   es: "sumo" },
  { id: "sekai",   jp: "せかい",   romaji: "sekai",   es: "mundo" },
  { id: "seki",    jp: "せき",     romaji: "seki",    es: "asiento" },
  { id: "sensei",  jp: "せんせい", romaji: "sensei",  es: "maestro/a" },
  { id: "sora",    jp: "そら",     romaji: "sora",    es: "cielo" },
  { id: "soto",    jp: "そと",     romaji: "soto",    es: "afuera" },
  { id: "soba",    jp: "そば",     romaji: "soba",    es: "fideos soba" },
  // Z
  { id: "zasshi",  jp: "ざっし",   romaji: "zasshi",  es: "revista" },
  { id: "zou",     jp: "ぞう",     romaji: "zou",     es: "elefante" },
  { id: "zubon",   jp: "ずぼん",   romaji: "zubon",   es: "pantalón" },
];

/* ========== Utils ========== */
function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ========== Canvas con auto-fit + bloqueo de scroll ========== */
type Stroke = { d: string; width: number; color: string };
export type TraceHandle = { undo: () => void; clear: () => void };

const TraceCanvas = forwardRef<TraceHandle, {
  guide: string;
  showGrid: boolean;
  showGuide: boolean;
  onCount?: (n: number) => void;
  fontLoaded: boolean;
  resetKey: number;
  toggleScroll: (enabled: boolean) => void;
  strokeWidth: number; // 👈 grosor dinámico
}>(
({ guide, showGrid, showGuide, onCount, fontLoaded, resetKey, toggleScroll, strokeWidth }, ref) => {
  const { width } = useWindowDimensions();
  const SIZE = Math.min(width - 32, 360); // tamaño del área
  const INK = "#111827";

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState("");
  const drawingRef = useRef(false);

  useEffect(() => { setStrokes([]); setCurrent(""); onCount?.(0); }, [resetKey]);
  useEffect(() => onCount?.(strokes.length), [strokes.length]);

  const safeToggleScroll = useCallback((enabled: boolean) => {
    requestAnimationFrame(() => toggleScroll(enabled));
  }, [toggleScroll]);

  const onStart = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    drawingRef.current = true;
    safeToggleScroll(false);
    setCurrent(`M ${locationX} ${locationY}`);
  };
  const onMove = (e: GestureResponderEvent) => {
    if (!drawingRef.current) return;
    const { locationX, locationY } = e.nativeEvent;
    setCurrent((p) => p + ` L ${locationX} ${locationY}`);
  };
  const finish = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    safeToggleScroll(true);
    if (!current) return;
    setStrokes((s) => s.concat({ d: current, width: strokeWidth, color: INK }));
    setCurrent("");
    Vibration.vibrate(6);
  };

  const undo = () => setStrokes((prev) => prev.slice(0, -1));
  const clear = () => { setStrokes([]); setCurrent(""); onCount?.(0); };
  useImperativeHandle(ref, () => ({ undo, clear }), []);

  // Guía: repartir caracteres para que no se corten
  const chars = useMemo(() => Array.from(guide), [guide]);
  const usableW = SIZE * 0.86;
  const cellW   = Math.max(usableW / Math.max(chars.length, 1), 1);
  const fontSz  = Math.min(cellW * 0.80, SIZE * 0.44);
  const leftX   = (SIZE - usableW) / 2;
  const baseY   = SIZE / 2 + fontSz * 0.03;

  return (
    <Svg
      width={SIZE}
      height={SIZE}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={onStart}
      onResponderMove={onMove}
      onResponderRelease={finish}
      onResponderTerminate={finish}
      onResponderTerminationRequest={() => false}
    >
      <Rect x={0} y={0} width={SIZE} height={SIZE} rx={16} fill="#FFF8EF" stroke="#E7D8BF" strokeWidth={2} />

      {showGrid && (
        <G>
          {[1,2,3].map((i) => {
            const p = (i * SIZE) / 4;
            return (
              <React.Fragment key={i}>
                <Line x1={p} y1={0} x2={p} y2={SIZE} stroke="#E4D2B2" strokeDasharray="6 10" />
                <Line x1={0} y1={p} x2={SIZE} y2={p} stroke="#E4D2B2" strokeDasharray="6 10" />
              </React.Fragment>
            );
          })}
          <Line x1={SIZE/2} y1={0} x2={SIZE/2} y2={SIZE} stroke="#D9C19A" />
          <Line x1={0} y1={SIZE/2} x2={SIZE} y2={SIZE/2} stroke="#D9C19A" />
        </G>
      )}

      {showGuide && chars.map((ch, i) => {
        const cx = leftX + cellW * (i + 0.5);
        return (
          <SvgText
            key={`${ch}-${i}`}
            x={cx}
            y={baseY}
            fontFamily={fontLoaded ? "NotoSansJP_700Bold" : undefined}
            fontSize={fontSz}
            textAnchor="middle"
            alignmentBaseline="middle"
            opacity={0.24}
            fill="#6B7280"
            stroke="#111827"
            strokeWidth={1.2}
          >
            {ch}
          </SvgText>
        );
      })}

      {!!current && (
        <Path d={current} stroke={INK} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {strokes.map((s, i) => (
        <Path key={i} d={s.d} stroke={s.color} strokeWidth={s.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
});
TraceCanvas.displayName = "TraceCanvas";

/* ========== Pantalla ========== */
export default function SCaligrafiaDigital() {
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });
  const { playCorrect } = useFeedbackSounds();

  // toggles superiores
  const [useShuffle, setUseShuffle] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [showHintES, setShowHintES] = useState(true);
  const [showGuide, setShowGuide] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // grosor
  const [strokeW, setStrokeW] = useState(10); // por defecto

  // deck + navegación
  const deck = useMemo(() => (useShuffle ? shuffle(WORDS) : WORDS), [useShuffle]);
  const [idx, setIdx] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  // contador de trazos
  const [traceCount, setTraceCount] = useState(0);

  // bloqueo de scroll mientras dibujas
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const item = deck[idx];
  const canvasRef = useRef<TraceHandle>(null);

  useEffect(() => {
    setIdx(0);
    setResetKey((n) => n + 1);
    setTraceCount(0);
  }, [useShuffle]);

  const speak = useCallback(() => {
    if (!item) return;
    Speech.stop();
    Speech.speak(item.jp, { language: "ja-JP", rate: 0.92, pitch: 1.0 });
  }, [item]);

  const next = () => {
    setIdx((i) => (i + 1 >= deck.length ? 0 : i + 1));
    setResetKey((n) => n + 1);
    setTraceCount(0);
    playCorrect().catch(() => {});
  };
  const prev = () => {
    setIdx((i) => (i - 1 < 0 ? deck.length - 1 : i - 1));
    setResetKey((n) => n + 1);
    setTraceCount(0);
  };

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text>No hay palabras.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Caligrafía digital — Familias S/Z</Text>
        <Text style={styles.meta}>Palabra {idx + 1}/{deck.length} • Trazos: {traceCount}</Text>
      </View>

      {/* Toggles */}
      <View style={styles.toggles}>
        <SwitchChip label="Barajar"   value={useShuffle} onPressIn={() => setUseShuffle(v => !v)} />
        <SwitchChip label="Romaji"    value={showRomaji} onPressIn={() => setShowRomaji(v => !v)} />
        <SwitchChip label="Pista ES"  value={showHintES} onPressIn={() => setShowHintES(v => !v)} />
      </View>
      <View style={[styles.toggles, { marginTop: 0 }]}>
        <SwitchChip label="Guía"       value={showGuide} onPressIn={() => setShowGuide(v => !v)} />
        <SwitchChip label="Cuadrícula" value={showGrid}  onPressIn={() => setShowGrid(v => !v)} />
        <Pressable style={styles.ttsBtn} onPressIn={speak}>
          <Text style={styles.ttsBtnText}>▶︎ TTS</Text>
        </Pressable>
      </View>

      {/* Grosor de trazo */}
      <View style={styles.sliderWrap}>
        <Text style={styles.sliderLabel}>Grosor de trazo</Text>
        <View style={styles.presets}>
          <PresetChip label="Fino"  onPress={() => setStrokeW(8)}   active={strokeW <= 8} />
          <PresetChip label="Medio" onPress={() => setStrokeW(12)}  active={strokeW > 8 && strokeW < 16} />
          <PresetChip label="Grueso" onPress={() => setStrokeW(18)} active={strokeW >= 16} />
        </View>
        <View style={styles.sliderRow}>
          <Slider
            style={{ flex: 1, marginHorizontal: 10 }}
            minimumValue={6}
            maximumValue={22}
            step={1}
            value={strokeW}
            minimumTrackTintColor="#2F2A24"
            maximumTrackTintColor="#D1C8B4"
            thumbTintColor="#2F2A24"
            onValueChange={setStrokeW}
          />
          <Text style={styles.sliderValue}>{strokeW}px</Text>
        </View>
      </View>

      {/* Tarjeta + Canvas */}
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 16 }}
        scrollEnabled={scrollEnabled}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.card}>
          <TraceCanvas
            ref={canvasRef}
            guide={item.jp}
            showGrid={showGrid}
            showGuide={showGuide}
            fontLoaded={!!fontsLoaded}
            resetKey={resetKey}
            onCount={setTraceCount}
            toggleScroll={setScrollEnabled}
            strokeWidth={strokeW}
          />

          {/* Toolbar */}
          <View style={styles.toolbar}>
            <Pressable
              onPressIn={() => { canvasRef.current?.undo(); Vibration.vibrate(10); }}
              style={({ pressed }) => [styles.toolBtn, pressed && styles.toolPressed]}
            >
              <Text style={styles.toolText}>Deshacer</Text>
            </Pressable>
            <Pressable
              onPressIn={() => { canvasRef.current?.clear(); Vibration.vibrate(18); }}
              style={({ pressed }) => [styles.toolBtn, pressed && styles.toolPressed]}
            >
              <Text style={styles.toolText}>Borrar todo</Text>
            </Pressable>
          </View>

          <View style={{ alignItems: "center", marginTop: 6 }}>
            {showRomaji && <Text style={styles.romaji}>{item.romaji}</Text>}
            {showHintES && <Text style={styles.hint}>{item.es}</Text>}
          </View>
        </View>
      </ScrollView>

      {/* Navegación */}
      <View style={styles.actions}>
        <Button label="◀︎ Anterior" onPress={prev} />
        <Button label="Siguiente ▶︎" onPress={next} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Traza encima de la guía. Ajusta el grosor a tu gusto y usa TTS para escuchar la palabra.</Text>
      </View>
    </SafeAreaView>
  );
}

/* ===== UI helpers ===== */
function SwitchChip({
  label, value, onPressIn,
}: { label: string; value: boolean; onPressIn: () => void }) {
  return (
    <Pressable
      onPressIn={onPressIn}
      android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
      style={[styles.switch, value && styles.switchOn]}
    >
      <View style={[styles.dot, value && styles.dotOn]} />
      <Text style={[styles.switchText, value && styles.switchTextOn]}>{label}</Text>
    </Pressable>
  );
}

function PresetChip({ label, onPress, active }: { label: string; onPress: () => void; active?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.preset, active && styles.presetActive]}
    >
      <Text style={[styles.presetText, active && styles.presetTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Button({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPressIn={onPress}
      disabled={!!disabled}
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
const INK = "#2F2A24";
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F3EA" },
  center: { alignItems: "center", justifyContent: "center" },

  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  title: { fontSize: 20, fontWeight: "900", color: INK },
  meta:  { fontSize: 12, color: "#6B5F5A", marginTop: 4 },

  toggles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  switch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#EDE5D7",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D5CAB6",
  },
  switchOn: { backgroundColor: "#C79A3E", borderColor: "#B1822F" },
  dot: { width: 14, height: 14, borderRadius: 999, backgroundColor: "#C9BBA5" },
  dotOn: { backgroundColor: "#FFF" },
  switchText: { fontSize: 12, color: "#3B2F2F", fontWeight: "700" },
  switchTextOn: { color: "#1B1108" },

  ttsBtn: {
    marginLeft: "auto",
    backgroundColor: INK,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ttsBtnText: { color: "#fff", fontWeight: "800" },

  /* Grosor */
  sliderWrap: {
    marginTop: 2,
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  sliderLabel: { fontWeight: "900", color: "#2F2A24", marginBottom: 6 },
  presets: { flexDirection: "row", gap: 8, marginBottom: 6 },
  preset: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EDE5D7",
    borderWidth: 1,
    borderColor: "#D5CAB6",
  },
  presetActive: { backgroundColor: "#C79A3E", borderColor: "#B1822F" },
  presetText: { color: "#3B2F2F", fontWeight: "700", fontSize: 12 },
  presetTextActive: { color: "#1B1108" },
  sliderRow: { flexDirection: "row", alignItems: "center" },
  sliderValue: { width: 46, textAlign: "right", fontWeight: "900", color: "#2F2A24" },

  card: {
    width: "100%",
    maxWidth: 520,
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  toolbar: { flexDirection: "row", alignSelf: "center", marginTop: 8 },
  toolBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
    marginHorizontal: 6,
  },
  toolPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  toolText: { color: "#fff", fontWeight: "800" },

  romaji: { marginTop: 4, fontSize: 16, color: "#6B5F5A" },
  hint:   { marginTop: 2, fontSize: 13, color: "#8B7F77" },

  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 10,
  },
  btn: {
    flex: 1,
    backgroundColor: INK,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontWeight: "900" },

  footer: { alignItems: "center", paddingBottom: 8 },
  footerText: { fontSize: 12, color: "#6B5F5A" },
});
