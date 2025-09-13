// src/screens/N5/TrazosGrupoA.tsx
import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
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
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
  useWindowDimensions,
} from "react-native";
import { State as RNGHState, TapGestureHandler } from "react-native-gesture-handler";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import type { RootStackParamList } from "../../../types";

/* ===== Tipos ===== */
type Nav = NativeStackNavigationProp<RootStackParamList>;
type KanaKey = "a" | "i" | "u" | "e" | "o";

/* ===== Config ===== */
const KANA_LIST: { key: KanaKey; glyph: string; label: string; color: string }[] = [
  { key: "a", glyph: "あ", label: "a", color: "#B91C1C" },
  { key: "i", glyph: "い", label: "i", color: "#9A3412" },
  { key: "u", glyph: "う", label: "u", color: "#1D4ED8" },
  { key: "e", glyph: "え", label: "e", color: "#047857" },
  { key: "o", glyph: "お", label: "o", color: "#7C3AED" },
];

const RECOMMENDED_STROKES: Record<KanaKey, number> = { a: 3, i: 2, u: 2, e: 2, o: 3 };
const STROKE_TIPS: Record<KanaKey, string[]> = {
  a: ["① Línea horizontal arriba.", "② Curva principal descendente.", "③ Gancho pequeño a la derecha."],
  i: ["① Línea corta arriba.", "② Línea larga descendente curvada."],
  u: ["① Curva pequeña superior.", "② Curva descendente y cierre a la derecha."],
  e: ["① Línea superior.", "② Trazo largo que forma el resto (curva y cierre)."],
  o: ["① Punto/pequeño trazo arriba.", "② Curva principal.", "③ Cierre a la derecha."],
};

const ORDER_HINTS: Record<KanaKey, { x: number; y: number }[]> = {
  a: [{ x: 0.30, y: 0.17 }, { x: 0.33, y: 0.35 }, { x: 0.67, y: 0.55 }],
  i: [{ x: 0.52, y: 0.18 }, { x: 0.56, y: 0.35 }],
  u: [{ x: 0.56, y: 0.24 }, { x: 0.45, y: 0.60 }],
  e: [{ x: 0.46, y: 0.19 }, { x: 0.43, y: 0.58 }],
  o: [{ x: 0.65, y: 0.18 }, { x: 0.45, y: 0.46 }, { x: 0.64, y: 0.64 }],
};

const GUIDE_STROKES: Record<KanaKey, string[]> = {
  a: ["M 120 70 L 240 70", "M 160 90 C 130 150, 130 220, 210 250", "M 220 110 C 260 150, 270 185, 250 205"],
  i: ["M 190 80 L 230 95", "M 205 95 C 180 130, 180 220, 225 255"],
  u: ["M 210 95 C 185 115, 195 130, 225 140", "M 170 160 C 140 210, 185 260, 240 230 C 265 215, 260 195, 248 180"],
  e: ["M 170 80 L 260 80", "M 170 110 C 150 150, 230 170, 245 135 M 165 210 C 205 235, 265 215, 245 185"],
  o: ["M 245 75 L 225 88", "M 205 105 C 165 145, 165 215, 225 245 C 265 260, 295 215, 265 185", "M 265 185 C 255 195, 250 205, 250 205"],
};

const OUTLINES: Record<KanaKey, string> = {
  a: "M 120 70 L 240 70 M 160 90 C 130 150, 130 220, 210 250 M 220 110 C 260 150, 270 185, 250 205",
  i: "M 190 80 L 230 95 M 205 95 C 180 130, 180 220, 225 255",
  u: "M 210 95 C 185 115, 195 130, 225 140 M 170 160 C 140 210, 185 260, 240 230 C 265 215, 260 195, 248 180",
  e: "M 170 80 L 260 80 M 170 110 C 150 150, 230 170, 245 135 M 165 210 C 205 235, 265 215, 245 185",
  o: "M 245 75 L 225 88 M 205 105 C 165 145, 165 215, 225 245 C 265 260, 295 215, 265 185",
};

const ICON_TIPS = require("../../../assets/icons/hiragana/A_trazos.webp");

const STROKE_ORDER_IMAGE: Record<KanaKey, any> = {
  a: require("../../../assets/strokeorder/images/hiragana-a.webp"),
  i: require("../../../assets/strokeorder/images/hiragana-i.webp"),
  u: require("../../../assets/strokeorder/images/hiragana-u.webp"),
  e: require("../../../assets/strokeorder/images/hiragana-e.webp"),
  o: require("../../../assets/strokeorder/images/hiragana-o.webp"),
};

/* ========= Botón con TapGestureHandler (anti “zona exacta”) ========= */
function TapButton({
  children,
  onPress,
  style,
  role,
  simultaneousHandlers,
}: {
  children?: React.ReactNode;
  onPress: () => void;
  style?: any;
  role?: "button";
  simultaneousHandlers?: any;
}) {
  const ref = useRef<any>(null);
  return (
    <TapGestureHandler
      ref={ref}
      numberOfTaps={1}
      maxDeltaX={12}
      maxDeltaY={12}
      maxDist={16}
      shouldCancelWhenOutside={false}
      simultaneousHandlers={simultaneousHandlers}
      onHandlerStateChange={(e) => {
        if (e.nativeEvent.state === RNGHState.ACTIVE) onPress();
      }}
    >
      <View style={style} accessibilityRole={role} collapsable={false}>
        <View pointerEvents="none">{children}</View>
      </View>
    </TapGestureHandler>
  );
}

/* ===== Lienzo (API imperativa) ===== */
type StrokeItem = { color: string; width: number; d: string };
export type TraceCanvasHandle = { undo: () => void; clear: () => void };

const TraceCanvas = forwardRef<TraceCanvasHandle, {
  kana: KanaKey;
  glyph: string;
  showGrid: boolean;
  showGuide: boolean;
  resetKey: number;
  reportCount: (n: number) => void;
  toggleScroll: (enabled: boolean) => void;
  fontLoaded: boolean;
  showStrokeGuides: boolean;
  baseGuideOpacity: number;
}>(({
  kana,
  glyph,
  showGrid,
  showGuide,
  resetKey,
  reportCount,
  toggleScroll,
  fontLoaded,
  showStrokeGuides,
  baseGuideOpacity,
}, ref) => {
  const { width } = useWindowDimensions();
  const SIZE = Math.min(width - 32, 360);

  // Pincel fijo para A (simple y claro)
  const INK_COLOR = "#111827";
  const STROKE_WIDTH = 10;

  const [strokes, setStrokes] = useState<StrokeItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [localCount, setLocalCount] = useState(0);
  const drawingRef = useRef(false);

  useEffect(() => { reportCount(localCount); }, [localCount, reportCount]);
  useEffect(() => { setStrokes([]); setCurrentPath(""); setLocalCount(0); }, [resetKey]);

  const safeToggleScroll = useCallback((enabled: boolean) => {
    requestAnimationFrame(() => toggleScroll(enabled));
  }, [toggleScroll]);

  const onStart = useCallback((e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    drawingRef.current = true;
    safeToggleScroll(false);
    setCurrentPath(`M ${locationX} ${locationY}`);
  }, [safeToggleScroll]);

  const onMove = useCallback((e: GestureResponderEvent) => {
    if (!drawingRef.current) return;
    const { locationX, locationY } = e.nativeEvent;
    setCurrentPath((p) => p + ` L ${locationX} ${locationY}`);
  }, []);

  const finishStroke = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    safeToggleScroll(true);
    if (!currentPath) return;
    setStrokes((prev) => prev.concat({ color: INK_COLOR, width: STROKE_WIDTH, d: currentPath }));
    setLocalCount((n) => n + 1);
    setCurrentPath("");
  }, [currentPath, safeToggleScroll]);

  const undo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
    setLocalCount((n) => Math.max(0, n - 1));
  }, []);
  const clear = useCallback(() => {
    setStrokes([]);
    setCurrentPath("");
    setLocalCount(0);
  }, []);

  useImperativeHandle(ref, () => ({ undo, clear }), [undo, clear]);

  const gridLines = useMemo(() => Array.from({ length: 3 }, (_, i) => ((i + 1) * SIZE) / 4), [SIZE]);
  const fontSize = SIZE * 0.72;
  const hints = ORDER_HINTS[kana];

  return (
    <View style={{ alignSelf: "center" }}>
      <Svg
        width={SIZE}
        height={SIZE}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={onStart}
        onResponderMove={onMove}
        onResponderRelease={finishStroke}
        onResponderTerminate={finishStroke}
        onResponderTerminationRequest={() => false}
      >
        <Rect x={0} y={0} width={SIZE} height={SIZE} rx={16} fill="#FFF8EF" stroke="#E7D8BF" strokeWidth={2} />

        {/* Cuadrícula */}
        {showGrid && (
          <G>
            {gridLines.map((p, i) => <Line key={`v-${i}`} x1={p} y1={0} x2={p} y2={SIZE} stroke="#E4D2B2" strokeDasharray="6 10" />)}
            {gridLines.map((p, i) => <Line key={`h-${i}`} x1={0} y1={p} x2={SIZE} y2={p} stroke="#E4D2B2" strokeDasharray="6 10" />)}
            <Line x1={SIZE / 2} y1={0} x2={SIZE / 2} y2={SIZE} stroke="#D9C19A" />
            <Line x1={0} y1={SIZE / 2} x2={SIZE} y2={SIZE / 2} stroke="#D9C19A" />
          </G>
        )}

        {/* Guía principal */}
        {showGuide && (
          fontLoaded ? (
            <SvgText
              key={`glyph-${glyph}`}
              x={SIZE / 2}
              y={SIZE / 2 + fontSize * 0.03}
              fontFamily="NotoSansJP_700Bold"
              fontSize={fontSize}
              textAnchor="middle"
              alignmentBaseline="middle"
              fill="#6B7280"
              opacity={0.28}
              stroke="#111827"
              strokeWidth={1.5}
            >
              {glyph}
            </SvgText>
          ) : (
            <Path d={OUTLINES[kana]} stroke="#9CA3AF" strokeWidth={8} fill="none" opacity={0.25} />
          )
        )}

        {/* Números de orden */}
        {showGuide && hints?.map((h, i) => {
          const cx = h.x * SIZE, cy = h.y * SIZE;
          return (
            <G key={`hint-${i}`} opacity={0.95}>
              <Circle cx={cx} cy={cy} r={12} fill="#DC2626" />
              <SvgText x={cx} y={cy + 1} fontSize={12} fontWeight="bold" fill="#fff" textAnchor="middle" alignmentBaseline="middle">
                {i + 1}
              </SvgText>
            </G>
          );
        })}

        {/* Líneas guía opcionales */}
        {showStrokeGuides && (
          <G>
            {GUIDE_STROKES[kana].map((d, idx) => (
              <Path
                key={`g-${idx}`} d={d} stroke="#111827" strokeWidth={4}
                opacity={baseGuideOpacity} fill="none" strokeLinecap="round" strokeLinejoin="round"
              />
            ))}
          </G>
        )}

        {/* Trazo en curso */}
        {!!currentPath && (
          <Path d={currentPath} stroke={INK_COLOR} strokeWidth={STROKE_WIDTH} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Trazos del usuario */}
        <G>
          {strokes.map((s, idx) => (
            <Path key={idx} d={s.d} stroke={s.color} strokeWidth={s.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </G>
      </Svg>
    </View>
  );
});
TraceCanvas.displayName = "TraceCanvas";

/* ===== Tarjeta de imagen con tap ===== */
function StrokeOrderImageCard({ kana, simultaneousHandlers }: { kana: KanaKey; simultaneousHandlers?: any }) {
  const src = STROKE_ORDER_IMAGE[kana];
  const { width } = useWindowDimensions();
  const W = Math.min(width - 32, 520);
  const H = 220;
  const [open, setOpen] = useState(false);

  const openWithHaptic = () => { Vibration.vibrate(8); setOpen(true); };
  const closeWithHaptic = () => { Vibration.vibrate(8); setOpen(false); };

  return (
    <View style={styles.imageWrap} collapsable={false}>
      <TapButton onPress={openWithHaptic} style={{ width: "100%", borderRadius: 12 }} simultaneousHandlers={simultaneousHandlers}>
        <ExpoImage source={src} style={{ width: "100%", height: H, borderRadius: 12 }} contentFit="contain" />
      </TapButton>

      <View style={styles.lottieControls}>
        <TapButton onPress={openWithHaptic} style={styles.smallBtn} simultaneousHandlers={simultaneousHandlers}>
          <Text style={styles.smallBtnText} pointerEvents="none">Ampliar imagen</Text>
        </TapButton>
      </View>
      <Text style={styles.imageHint}>Orden de trazos (imagen)</Text>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeWithHaptic}>
        <View style={styles.modalBackdrop}>
          <TapButton onPress={closeWithHaptic} style={{ flex: 1 }} />
          <View style={[styles.modalCard, { width: W, maxWidth: 560 }]}>
            <ExpoImage source={src} style={{ width: "100%", height: W * 0.9, borderRadius: 12 }} contentFit="contain" />
            <TapButton onPress={closeWithHaptic} style={[styles.smallBtnAlt, { marginTop: 10 }]}>
              <Text style={styles.smallBtnTextAlt} pointerEvents="none">Cerrar</Text>
            </TapButton>
          </View>
          <TapButton onPress={closeWithHaptic} style={{ flex: 1 }} />
        </View>
      </Modal>
    </View>
  );
}

/* ===== Pill (opción) con tap ===== */
function Pill({ label, active, onPress, simultaneousHandlers }: { label: string; active?: boolean; onPress: () => void; simultaneousHandlers?: any }) {
  const press = () => { Vibration.vibrate(8); onPress(); };
  return (
    <TapButton onPress={press} style={[styles.pill, active && styles.pillActive]} role="button" simultaneousHandlers={simultaneousHandlers}>
      <Text pointerEvents="none" style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TapButton>
  );
}

/* ===== Pantalla ===== */
export default function TrazosGrupoA() {
  const navigation = useNavigation<Nav>();
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });

  const [kana, setKana] = useState<KanaKey>("a");
  const [resetKey, setResetKey] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showStrokeGuides, setShowStrokeGuides] = useState(false);
  const [baseGuideOpacity, setBaseGuideOpacity] = useState(0.12);

  const [count, setCount] = useState<number>(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const tips = STROKE_TIPS[kana];
  const glyph = KANA_LIST.find((k) => k.key === kana)!.glyph;
  const recommended = RECOMMENDED_STROKES[kana];

  const scrollSimultaneousRef = useRef<any>(null);

  useEffect(() => { setCount(0); setResetKey((n) => n + 1); }, [kana]);

  const toggleGuide = useCallback(() => setShowGuide((v) => !v), []);
  const toggleGrid = useCallback(() => setShowGrid((v) => !v), []);
  const toggleStrokeGuides = useCallback(() => setShowStrokeGuides((v) => !v), []);

  const canvasRef = useRef<TraceCanvasHandle>(null);

  const selectKana = (k: KanaKey) => { Vibration.vibrate(8); setKana(k); };

  return (
    <ScrollView
      ref={scrollSimultaneousRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 28 }}
      scrollEnabled={scrollEnabled}
      keyboardShouldPersistTaps="always"
      removeClippedSubviews={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Trazos — Grupo A</Text>
        <Text style={styles.subtitle}>Practica あ・い・う・え・お con guía y cuadrícula</Text>
      </View>

      {/* Selector */}
      <Text style={styles.sectionTitle}>Elige el carácter</Text>
      <View style={styles.selectorRow} collapsable={false}>
        {KANA_LIST.map((k) => {
          const isActive = kana === k.key;
          return (
            <TapButton
              key={k.key}
              onPress={() => selectKana(k.key)}
              role="button"
              style={[styles.kanaBtn, { backgroundColor: k.color }, isActive && styles.kanaBtnActive]}
              simultaneousHandlers={scrollSimultaneousRef}
            >
              <Text pointerEvents="none" style={styles.kanaGlyph}>{k.glyph}</Text>
              <Text pointerEvents="none" style={styles.kanaLabel}>{k.label}</Text>
            </TapButton>
          );
        })}
      </View>

      {/* Tips + contador */}
      <View style={styles.tipsBox}>
        <ExpoImage source={ICON_TIPS} style={{ width: 36, height: 36 }} contentFit="contain" />
        <View style={{ flex: 1 }}>
          <Text style={styles.tipsTitle}>Orden sugerido de trazos</Text>
          {tips.map((t, i) => (<Text key={i} style={styles.tipItem}>• {t}</Text>))}
        </View>
        <View style={styles.counterPill}>
          <Text style={styles.counterText}>{count}/{recommended}</Text>
          <Text style={styles.counterSub}>trazos</Text>
        </View>
      </View>

      {/* Imagen */}
      <View style={{ marginHorizontal: 16, marginTop: 6 }}>
        <StrokeOrderImageCard kana={kana} simultaneousHandlers={scrollSimultaneousRef} />
      </View>

      {/* Opciones */}
      <Text style={styles.sectionTitle}>Opciones</Text>
      <View style={styles.pillsRow} collapsable={false}>
        <Pill label="Guía" active={showGuide} onPress={toggleGuide} simultaneousHandlers={scrollSimultaneousRef} />
        <Pill label="Cuadrícula" active={showGrid} onPress={toggleGrid} simultaneousHandlers={scrollSimultaneousRef} />
        <Pill label="Líneas guía" active={showStrokeGuides} onPress={toggleStrokeGuides} simultaneousHandlers={scrollSimultaneousRef} />
      </View>

      {/* Slider opacidad */}
      {showStrokeGuides && (
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>Opacidad de líneas guía</Text>
          <Slider
            style={{ flex: 1, marginHorizontal: 12 }}
            minimumValue={0}
            maximumValue={0.3}
            step={0.01}
            value={baseGuideOpacity}
            minimumTrackTintColor="#111827"
            maximumTrackTintColor="#D1D5DB"
            thumbTintColor="#111827"
            onValueChange={setBaseGuideOpacity}
          />
          <Text style={styles.sliderValue}>{Math.round(baseGuideOpacity * 100)}%</Text>
        </View>
      )}

      {/* Lienzo */}
      <Text style={styles.sectionTitle}>Calca sobre la guía</Text>
      <TraceCanvas
        ref={canvasRef}
        kana={kana}
        glyph={glyph}
        showGrid={showGrid}
        showGuide={showGuide}
        resetKey={resetKey}
        reportCount={setCount}
        toggleScroll={setScrollEnabled}
        fontLoaded={!!fontsLoaded}
        showStrokeGuides={showStrokeGuides}
        baseGuideOpacity={baseGuideOpacity}
      />

      {/* Toolbar */}
      <View style={styles.toolbar} collapsable={false}>
        <TapButton
          onPress={() => { canvasRef.current?.undo(); Vibration.vibrate(10); }}
          role="button"
          style={styles.toolBtn}
          simultaneousHandlers={scrollSimultaneousRef}
        >
          <Text pointerEvents="none" style={styles.toolBtnText}>Deshacer</Text>
        </TapButton>

        <TapButton
          onPress={() => { canvasRef.current?.clear(); Vibration.vibrate(20); }}
          role="button"
          style={styles.toolBtn}
          simultaneousHandlers={scrollSimultaneousRef}
        >
          <Text pointerEvents="none" style={styles.toolBtnText}>Borrar todo</Text>
        </TapButton>
      </View>

      {/* Consejos */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Consejos</Text>
        <Text style={styles.infoText}>
          • Mantén el orden de los trazos.{"\n"}
          • Practica lento al inicio y luego a velocidad natural.{"\n"}
          • Suelta la presión al final para un acabado limpio.{"\n"}
          • Repite 3–5 veces cada carácter antes de pasar al siguiente.
        </Text>
      </View>

      {/* Siguiente */}
      <TapButton
        onPress={() => { Vibration.vibrate(12); navigation.navigate("PronunciacionGrupoA"); }}
        role="button"
        style={styles.nextBtn}
        simultaneousHandlers={scrollSimultaneousRef}
      >
        <Text pointerEvents="none" style={styles.nextText}>Siguiente: Pronunciación del grupo A ➜</Text>
      </TapButton>
    </ScrollView>
  );
}

/* ===== Estilos ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { padding: 20, backgroundColor: "#a41034" },
  title: { color: "#fff", fontWeight: "900", fontSize: 22 },
  subtitle: { color: "#FBE8E8", marginTop: 6 },

  sectionTitle: { fontSize: 18, fontWeight: "800", marginTop: 18, marginBottom: 8, marginLeft: 16 },

  selectorRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 6,
    zIndex: 10,
    elevation: 10,
  },
  kanaBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#111",
  },
  kanaBtnActive: {
    transform: [{ translateY: -2 }],
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
  },
  kanaGlyph: { fontSize: 34, color: "#fff", fontWeight: "900", lineHeight: 36 },
  kanaLabel: { fontSize: 12, color: "#fff", marginTop: 4, opacity: 0.9 },

  tipsBox: {
    margin: 16, padding: 14, borderRadius: 14,
    backgroundColor: "#FFF8EF", borderWidth: 1, borderColor: "#E7D8BF",
    flexDirection: "row", alignItems: "center",
  },
  tipsTitle: { fontWeight: "900", marginBottom: 4, color: "#3B2B1B" },
  tipItem: { color: "#4B3A28" },

  counterPill: { backgroundColor: "#111827", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, alignItems: "center", minWidth: 76, marginLeft: 8 },
  counterText: { color: "#fff", fontWeight: "900", fontSize: 16, lineHeight: 16 },
  counterSub: { color: "#D1D5DB", fontSize: 10 },

  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginBottom: 6,
    marginTop: 6,
    zIndex: 10,
    elevation: 10,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C4B69B",
    backgroundColor: "#FFFDF9",
    marginRight: 8,
    marginBottom: 8,
    minHeight: 44,
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: { backgroundColor: "#111827", borderColor: "#111827" },
  pillText: { color: "#3B2B1B", fontWeight: "700" },
  pillTextActive: { color: "#fff" },

  sliderRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 6 },
  sliderLabel: { fontWeight: "800", color: "#111827", marginRight: 6 },
  sliderValue: { width: 44, textAlign: "right", fontWeight: "800", color: "#111827", marginLeft: 6 },

  toolbar: { flexDirection: "row", alignSelf: "center", marginTop: 10, zIndex: 10, elevation: 10 },
  toolBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  toolBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  imageWrap: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB", borderRadius: 14, padding: 8 },
  lottieControls: { flexDirection: "row", marginTop: 8, justifyContent: "center" },
  smallBtn: { backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#111827" },
  smallBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  smallBtnAlt: { backgroundColor: "#F3F4F6", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#D1D5DB" },
  smallBtnTextAlt: { color: "#111827", fontWeight: "800", fontSize: 12 },
  imageHint: { marginTop: 6, textAlign: "center", color: "#374151", fontSize: 12, fontWeight: "800", opacity: 0.85 },

  infoCard: { marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
  infoTitle: { fontWeight: "900", marginBottom: 6, color: "#111827" },
  infoText: { color: "#374151" },

  nextBtn: { marginTop: 18, alignSelf: "center", backgroundColor: "#111827", paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14 },
  nextText: { color: "#fff", fontWeight: "900" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 10, alignItems: "center" },
});
