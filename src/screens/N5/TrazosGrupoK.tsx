// src/screens/N5/TrazosGrupoK.tsx
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
type KanaKey = "ka" | "ke" | "ki" | "ko" | "ku" | "ga" | "ge" | "gi" | "go" | "gu";

/* ===== Config ===== */
const KANA_LIST: { key: KanaKey; glyph: string; label: string; color: string }[] = [
  { key: "ka", glyph: "か", label: "ka", color: "#B91C1C" },
  { key: "ke", glyph: "け", label: "ke", color: "#047857" },
  { key: "ki", glyph: "き", label: "ki", color: "#9A3412" },
  { key: "ko", glyph: "こ", label: "ko", color: "#7C3AED" },
  { key: "ku", glyph: "く", label: "ku", color: "#1D4ED8" },
  { key: "ga", glyph: "が", label: "ga", color: "#DC2626" },
  { key: "ge", glyph: "げ", label: "ge", color: "#059669" },
  { key: "gi", glyph: "ぎ", label: "gi", color: "#C2410C" },
  { key: "go", glyph: "ご", label: "go", color: "#8B5CF6" },
  { key: "gu", glyph: "ぐ", label: "gu", color: "#2563EB" },
];

const RECOMMENDED_STROKES: Record<KanaKey, number> = {
  ka: 3, ke: 3, ki: 4, ko: 2, ku: 1,
  ga: 3, ge: 3, gi: 4, go: 2, gu: 1,
};

const STROKE_TIPS: Record<KanaKey, string[]> = {
  ka: ["① Trazo vertical corto.", "② Curva principal a la derecha.", "③ Pequeño trazo diagonal final."],
  ke: ["① Línea vertical.", "② Curva lateral.", "③ Remate pequeño."],
  ki: ["① Línea corta arriba.", "② Curva principal.", "③ Pequeño gancho.", "④ Remate inferior."],
  ko: ["① Línea superior.", "② Línea inferior más larga."],
  ku: ["① Trazo en forma de gancho (curva hacia abajo y a la derecha)."],
  ga: ["①-③ como か.", "• Agrega dakuten (゛) arriba a la derecha."],
  ge: ["①-③ como け.", "• Agrega dakuten (゛) arriba a la derecha."],
  gi: ["①-④ como き.", "• Agrega dakuten (゛) arriba a la derecha."],
  go: ["①-② como こ.", "• Agrega dakuten (゛) arriba a la derecha."],
  gu: ["① como く.", "• Agrega dakuten (゛) arriba a la derecha."],
};

const ORDER_HINTS: Record<KanaKey, { x: number; y: number }[]> = {
  ka: [{ x: 0.40, y: 0.22 }, { x: 0.55, y: 0.45 }, { x: 0.65, y: 0.62 }],
  ke: [{ x: 0.42, y: 0.20 }, { x: 0.52, y: 0.45 }, { x: 0.62, y: 0.62 }],
  ki: [{ x: 0.45, y: 0.20 }, { x: 0.52, y: 0.40 }, { x: 0.62, y: 0.55 }, { x: 0.58, y: 0.70 }],
  ko: [{ x: 0.40, y: 0.25 }, { x: 0.40, y: 0.55 }],
  ku: [{ x: 0.45, y: 0.40 }],
  ga: [{ x: 0.40, y: 0.22 }, { x: 0.55, y: 0.45 }, { x: 0.65, y: 0.62 }, { x: 0.66, y: 0.12 }],
  ge: [{ x: 0.42, y: 0.20 }, { x: 0.52, y: 0.45 }, { x: 0.62, y: 0.62 }, { x: 0.66, y: 0.12 }],
  gi: [{ x: 0.45, y: 0.20 }, { x: 0.52, y: 0.40 }, { x: 0.62, y: 0.55 }, { x: 0.58, y: 0.70 }, { x: 0.66, y: 0.12 }],
  go: [{ x: 0.40, y: 0.25 }, { x: 0.40, y: 0.55 }, { x: 0.66, y: 0.12 }],
  gu: [{ x: 0.45, y: 0.40 }, { x: 0.66, y: 0.12 }],
};

const GUIDE_STROKES: Record<KanaKey, string[]> = {
  ka: ["M 180 90 L 200 120", "M 200 120 C 230 150, 250 190, 230 230", "M 230 210 L 260 230"],
  ke: ["M 185 90 L 190 220", "M 190 140 C 220 160, 245 180, 235 210", "M 220 210 L 245 230"],
  ki: ["M 180 90 L 205 100", "M 205 100 C 215 130, 240 160, 235 200", "M 210 175 L 245 195", "M 230 200 L 225 240"],
  ko: ["M 180 110 L 260 110", "M 180 200 L 260 200"],
  ku: ["M 180 120 C 220 130, 250 170, 230 210"],
  ga: ["M 180 90 L 200 120", "M 200 120 C 230 150, 250 190, 230 230", "M 230 210 L 260 230", "M 250 70 L 265 85"],
  ge: ["M 185 90 L 190 220", "M 190 140 C 220 160, 245 180, 235 210", "M 220 210 L 245 230", "M 250 70 L 265 85"],
  gi: ["M 180 90 L 205 100", "M 205 100 C 215 130, 240 160, 235 200", "M 210 175 L 245 195", "M 230 200 L 225 240", "M 250 70 L 265 85"],
  go: ["M 180 110 L 260 110", "M 180 200 L 260 200", "M 250 70 L 265 85"],
  gu: ["M 180 120 C 220 130, 250 170, 230 210", "M 250 70 L 265 85"],
};

const OUTLINES: Record<KanaKey, string> = {
  ka: "M 180 90 L 200 120 M 200 120 C 230 150, 250 190, 230 230 M 230 210 L 260 230",
  ke: "M 185 90 L 190 220 M 190 140 C 220 160, 245 180, 235 210 M 220 210 L 245 230",
  ki: "M 180 90 L 205 100 M 205 100 C 215 130, 240 160, 235 200 M 210 175 L 245 195 M 230 200 L 225 240",
  ko: "M 180 110 L 260 110 M 180 200 L 260 200",
  ku: "M 180 120 C 220 130, 250 170, 230 210",
  ga: "M 180 90 L 200 120 M 200 120 C 230 150, 250 190, 230 230 M 230 210 L 260 230 M 250 70 L 265 85",
  ge: "M 185 90 L 190 220 M 190 140 C 220 160, 245 180, 235 210 M 220 210 L 245 230 M 250 70 L 265 85",
  gi: "M 180 90 L 205 100 M 205 100 C 215 130, 240 160, 235 200 M 210 175 L 245 195 M 230 200 L 225 240 M 250 70 L 265 85",
  go: "M 180 110 L 260 110 M 180 200 L 260 200 M 250 70 L 265 85",
  gu: "M 180 120 C 220 130, 250 170, 230 210 M 250 70 L 265 85",
};

const ICON_TIPS = require("../../../assets/strokeorder/images/ka.webp");

const STROKE_ORDER_IMAGE: Record<KanaKey, any> = {
  ka: require("../../../assets/strokeorder/images/ka.webp"),
  ke: require("../../../assets/strokeorder/images/ke.webp"),
  ki: require("../../../assets/strokeorder/images/ki.webp"),
  ko: require("../../../assets/strokeorder/images/ko.webp"),
  ku: require("../../../assets/strokeorder/images/ku.webp"),
  ga: require("../../../assets/strokeorder/images/ga.webp"),
  ge: require("../../../assets/strokeorder/images/ge.webp"),
  gi: require("../../../assets/strokeorder/images/gi.webp"),
  go: require("../../../assets/strokeorder/images/go.webp"),
  gu: require("../../../assets/strokeorder/images/gu.webp"),
};

/* ========= Botón con TapGestureHandler (anti “zona exacta”) ========= */
function TapButton({
  children,
  onPress,
  style,
  role,
  simultaneousHandlers,
}: {
  children: React.ReactNode;
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
        {/* pointerEvents="none": el texto nunca roba el toque */}
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
  inkColor: string;
  strokeWidth: number;
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
  inkColor,
  strokeWidth,
  resetKey,
  reportCount,
  toggleScroll,
  fontLoaded,
  showStrokeGuides,
  baseGuideOpacity,
}, ref) => {
  const { width } = useWindowDimensions();
  const SIZE = Math.min(width - 32, 360);

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
    setStrokes((prev) => prev.concat({ color: inkColor, width: strokeWidth, d: currentPath }));
    setLocalCount((n) => n + 1);
    setCurrentPath("");
  }, [currentPath, inkColor, strokeWidth, safeToggleScroll]);

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
          <Path d={currentPath} stroke={inkColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
export default function TrazosGrupoK() {
  const navigation = useNavigation<Nav>();
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });

  const [kana, setKana] = useState<KanaKey>("ka");
  const [resetKey, setResetKey] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showStrokeGuides, setShowStrokeGuides] = useState(false);
  const [baseGuideOpacity, setBaseGuideOpacity] = useState(0.12);

  const [inkColor, setInkColor] = useState<string>("#111827");
  const [strokeWidth, setStrokeWidth] = useState<number>(10);
  const [count, setCount] = useState<number>(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const tips = STROKE_TIPS[kana];
  const glyph = KANA_LIST.find((k) => k.key === kana)!.glyph;
  const recommended = RECOMMENDED_STROKES[kana];

  const scrollSimultaneousRef = useRef<any>(null);

  useEffect(() => { setCount(0); setResetKey((n) => n + 1); }, [kana]);

  // Callbacks para pills
  const toggleGuide = useCallback(() => setShowGuide((v) => !v), []);
  const toggleGrid = useCallback(() => setShowGrid((v) => !v), []);
  const toggleStrokeGuides = useCallback(() => setShowStrokeGuides((v) => !v), []);
  const setBrush6  = useCallback(() => setStrokeWidth(6), []);
  const setBrush10 = useCallback(() => setStrokeWidth(10), []);
  const setBrush16 = useCallback(() => setStrokeWidth(16), []);
  const setInkBlack = useCallback(() => setInkColor("#111827"), []);
  const setInkRed   = useCallback(() => setInkColor("#B91C1C"), []);
  const setInkBlue  = useCallback(() => setInkColor("#1D4ED8"), []);
  const setInkGreen = useCallback(() => setInkColor("#047857"), []);

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
        <Text style={styles.title}>Trazos — Grupo K</Text>
        <Text style={styles.subtitle}>Practica か・け・き・こ・く y が・げ・ぎ・ご・ぐ con guía y cuadrícula</Text>
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
        <Pill label="Pincel fino" active={strokeWidth === 6} onPress={setBrush6} simultaneousHandlers={scrollSimultaneousRef} />
        <Pill label="Pincel medio" active={strokeWidth === 10} onPress={setBrush10} simultaneousHandlers={scrollSimultaneousRef} />
        <Pill label="Pincel grueso" active={strokeWidth === 16} onPress={setBrush16} simultaneousHandlers={scrollSimultaneousRef} />
        <Pill label="Líneas guía" active={showStrokeGuides} onPress={toggleStrokeGuides} simultaneousHandlers={scrollSimultaneousRef} />
      </View>
      <View style={styles.pillsRow} collapsable={false}>
        <Pill label="Tinta negra" active={inkColor === "#111827"} onPress={setInkBlack} simultaneousHandlers={scrollSimultaneousRef} />
        <Pill label="Rojo" active={inkColor === "#B91C1C"} onPress={setInkRed} simultaneousHandlers={scrollSimultaneousRef} />
        <Pill label="Azul" active={inkColor === "#1D4ED8"} onPress={setInkBlue} simultaneousHandlers={scrollSimultaneousRef} />
        <Pill label="Verde" active={inkColor === "#047857"} onPress={setInkGreen} simultaneousHandlers={scrollSimultaneousRef} />
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
        inkColor={inkColor}
        strokeWidth={strokeWidth}
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
          • Para dakuten (が/げ/ぎ/ご/ぐ), dibuja primero la base y al final el signo ゛.{"\n"}
          • Practica lento al inicio y luego a velocidad natural.{"\n"}
          • Repite 3–5 veces cada carácter antes de pasar al siguiente.
        </Text>
      </View>

      {/* Siguiente */}
      <TapButton
        onPress={() => { Vibration.vibrate(12); navigation.navigate("PronunciacionGrupoK"); }}
        role="button"
        style={styles.nextBtn}
        simultaneousHandlers={scrollSimultaneousRef}
      >
        <Text pointerEvents="none" style={styles.nextText}>Siguiente ➜</Text>
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
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 6,
    zIndex: 10,
    elevation: 10,
  },
  kanaBtn: {
    flexBasis: "18%",
    borderRadius: 14,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#111",
    marginBottom: 10,
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
    paddingVertical: 12, // un poco más alto para mejor target
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

  toolbar: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 10,
    zIndex: 10,
    elevation: 10,
  },
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
