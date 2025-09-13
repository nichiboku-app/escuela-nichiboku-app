// src/screens/N5/FamiliaS/TrazosFamiliaSZ.tsx
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
import type { RootStackParamList } from "../../../../types";

/* ===== Tipos ===== */
type Nav = NativeStackNavigationProp<RootStackParamList>;
type FamilyKey = "S" | "Z";
type KanaKey =
  | "sa" | "shi" | "su" | "se" | "so"
  | "za" | "ji"  | "zu" | "ze" | "zo";

/* ===== Config de familias ===== */
const FAMILY_LIST: { key: FamilyKey; label: string; color: string }[] = [
  { key: "S", label: "Familia S", color: "#B32133" },
  { key: "Z", label: "Familia Z", color: "#0F766E" },
];

const KANA_LIST: Record<FamilyKey, { key: KanaKey; glyph: string; label: string; color: string }[]> = {
  S: [
    { key: "sa",  glyph: "さ", label: "sa",  color: "#B91C1C" },
    { key: "shi", glyph: "し", label: "shi", color: "#9A3412" },
    { key: "su",  glyph: "す", label: "su",  color: "#1D4ED8" },
    { key: "se",  glyph: "せ", label: "se",  color: "#047857" },
    { key: "so",  glyph: "そ", label: "so",  color: "#7C3AED" },
  ],
  Z: [
    { key: "za", glyph: "ざ", label: "za", color: "#0E7490" },
    { key: "ji", glyph: "じ", label: "ji", color: "#7C2D12" },
    { key: "zu", glyph: "ず", label: "zu", color: "#2563EB" },
    { key: "ze", glyph: "ぜ", label: "ze", color: "#065F46" },
    { key: "zo", glyph: "ぞ", label: "zo", color: "#6D28D9" },
  ],
};

const RECOMMENDED_STROKES: Record<KanaKey, number> = {
  sa: 3, shi: 1, su: 2, se: 3, so: 2,
  za: 4, ji: 2, zu: 3, ze: 4, zo: 3,
};

const STROKE_TIPS: Record<KanaKey, string[]> = {
  sa: ["① Trazo superior.", "② Curva principal.", "③ Cierre lateral."],
  shi: ["① Curva principal continua (fluida)."],
  su: ["① Curva superior.", "② Curva larga con cierre."],
  se: ["① Barra superior.", "② Curva larga.", "③ Cierre lateral."],
  so: ["① Curva superior.", "② Curva larga descendente."],
  za: ["① Trazo superior.", "② Curva principal.", "③ Cierre lateral.", "④ Dakuten (゛)."],
  ji: ["① Curva principal.", "② Dakuten (゛)."],
  zu: ["① Curva superior.", "② Curva larga.", "③ Dakuten (゛)."],
  ze: ["① Barra superior.", "② Curva larga.", "③ Cierre lateral.", "④ Dakuten (゛)."],
  zo: ["① Curva superior.", "② Curva larga.", "③ Dakuten (゛)."],
};

/** Puntos visibles 1,2,3... (aproximados) para sugerir orden */
const ORDER_HINTS: Record<KanaKey, { x: number; y: number }[]> = {
  sa: [{x:.35,y:.18},{x:.38,y:.38},{x:.68,y:.62}],
  shi:[{x:.52,y:.35}],
  su: [{x:.52,y:.22},{x:.42,y:.58}],
  se: [{x:.46,y:.19},{x:.42,y:.52},{x:.70,y:.62}],
  so: [{x:.55,y:.22},{x:.46,y:.60}],
  za: [{x:.35,y:.18},{x:.38,y:.38},{x:.68,y:.62},{x:.78,y:.18}],
  ji: [{x:.52,y:.35},{x:.78,y:.18}],
  zu: [{x:.52,y:.22},{x:.42,y:.58},{x:.78,y:.18}],
  ze: [{x:.46,y:.19},{x:.42,y:.52},{x:.70,y:.62},{x:.78,y:.18}],
  zo: [{x:.55,y:.22},{x:.46,y:.60},{x:.78,y:.18}],
} ;

/** Si tienes outlines/paths exactos, añádelos aquí. Se deja vacío para usar glyph. */
const GUIDE_STROKES: Record<KanaKey, string[]> = {
  sa: [], shi: [], su: [], se: [], so: [],
  za: [], ji: [], zu: [], ze: [], zo: [],
};
const OUTLINES: Record<KanaKey, string> = {
  sa:"", shi:"", su:"", se:"", so:"",
  za:"", ji:"", zu:"", ze:"", zo:"",
};

/** Ícono para la tarjeta de tips (reutilizamos el de A, que ya existe en tu proyecto) */
const ICON_TIPS = require("../../../../assets/icons/hiragana/A_trazos.webp");

/** Imágenes de orden de trazo (las que me pasaste) */
const STROKE_ORDER_IMAGE: Partial<Record<KanaKey, any>> = {
  // Familia S
  sa:  require("../../../../assets/images/Familiast/sa.webp"),
  shi: require("../../../../assets/images/Familiast/shi.webp"),
  su:  require("../../../../assets/images/Familiast/su.webp"),
  se:  require("../../../../assets/images/Familiast/se.webp"),
  so:  require("../../../../assets/images/Familiast/so.webp"),

  // Familia Z
  za:  require("../../../../assets/images/Familiast/za.webp"),
  zu:  require("../../../../assets/images/Familiast/zu.webp"),
  ze:  require("../../../../assets/images/Familiast/ze.webp"),
  zo:  require("../../../../assets/images/Familiast/zo.webp"),

  // Si agregas la de "ji", solo descomenta:
  // ji: require("../../../../assets/images/Familiast/ji.webp"),
};

/* ========= Botón con TapGestureHandler ========= */
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

/* ===== Lienzo ===== */
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
  const hints = ORDER_HINTS[kana] || [];

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
            OUTLINES[kana] ? (
              <Path d={OUTLINES[kana]} stroke="#9CA3AF" strokeWidth={8} fill="none" opacity={0.25} />
            ) : null
          )
        )}

        {/* Números de orden */}
        {showGuide && hints.map((h, i) => {
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

        {/* Líneas guía opcionales (si las defines en GUIDE_STROKES) */}
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

/* ===== Tarjeta imagen orden de trazo ===== */
function StrokeOrderImageCard({ kana, simultaneousHandlers }: { kana: KanaKey; simultaneousHandlers?: any }) {
  const src = STROKE_ORDER_IMAGE[kana];
  const { width } = useWindowDimensions();
  const W = Math.min(width - 32, 520);
  const H = 220;
  const [open, setOpen] = useState(false);

  if (!src) {
    return (
      <View style={styles.imageWrap}>
        <Text style={styles.imageHint}>Agrega imágenes de orden de trazo para mostrar aquí.</Text>
      </View>
    );
  }

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

/* ===== Pill ===== */
function Pill({ label, active, onPress, simultaneousHandlers }: { label: string; active?: boolean; onPress: () => void; simultaneousHandlers?: any }) {
  const press = () => { Vibration.vibrate(8); onPress(); };
  return (
    <TapButton onPress={press} style={[styles.pill, active && styles.pillActive]} role="button" simultaneousHandlers={simultaneousHandlers}>
      <Text pointerEvents="none" style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TapButton>
  );
}

/* ===== Pantalla ===== */
export default function TrazosFamiliaSZ() {
  const navigation = useNavigation<Nav>();
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });

  const [family, setFamily] = useState<FamilyKey>("S");
  const [kana, setKana] = useState<KanaKey>("sa"); // default S
  const [resetKey, setResetKey] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showStrokeGuides, setShowStrokeGuides] = useState(false);
  const [baseGuideOpacity, setBaseGuideOpacity] = useState(0.12);

  const [count, setCount] = useState<number>(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const kanaList = KANA_LIST[family];
  const selected = kanaList.find(k => k.key === kana) || kanaList[0];
  const glyph = selected.glyph;
  const tips = STROKE_TIPS[kana];
  const recommended = RECOMMENDED_STROKES[kana];

  const scrollSimultaneousRef = useRef<any>(null);

  // Cambiar familia resetea el kana y lienzo
  useEffect(() => {
    const first = KANA_LIST[family][0].key;
    setKana(first);
  }, [family]);

  // Cambiar kana resetea el contador y canvas
  useEffect(() => { setCount(0); setResetKey((n) => n + 1); }, [kana]);

  const toggleGuide = useCallback(() => setShowGuide((v) => !v), []);
  const toggleGrid = useCallback(() => setShowGrid((v) => !v), []);
  const toggleStrokeGuides = useCallback(() => setShowStrokeGuides((v) => !v), []);

  const canvasRef = useRef<TraceCanvasHandle>(null);

  const selectFamily = (f: FamilyKey) => { Vibration.vibrate(8); setFamily(f); };
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
        <Text style={styles.title}>Trazos — Familias S y Z</Text>
        <Text style={styles.subtitle}>Practica さ・し・す・せ・そ y ざ・じ・ず・ぜ・ぞ con guía y cuadrícula</Text>
      </View>

      {/* Selector de familia */}
      <Text style={styles.sectionTitle}>Elige la familia</Text>
      <View style={styles.selectorRow} collapsable={false}>
        {FAMILY_LIST.map((f) => {
          const isActive = family === f.key;
          return (
            <TapButton
              key={f.key}
              onPress={() => selectFamily(f.key)}
              role="button"
              style={[styles.kanaBtn, { backgroundColor: f.color }, isActive && styles.kanaBtnActive]}
              simultaneousHandlers={scrollSimultaneousRef}
            >
              <Text pointerEvents="none" style={styles.kanaGlyph}>{f.key}</Text>
              <Text pointerEvents="none" style={styles.kanaLabel}>{f.label}</Text>
            </TapButton>
          );
        })}
      </View>

      {/* Selector de carácter */}
      <Text style={styles.sectionTitle}>Elige el carácter</Text>
      <View style={styles.selectorRowWrap}>
        {kanaList.map((k) => {
          const isActive = kana === k.key;
          return (
            <TapButton
              key={k.key}
              onPress={() => selectKana(k.key)}
              role="button"
              style={[styles.kanaBtnSmall, { backgroundColor: k.color }, isActive && styles.kanaBtnActive]}
              simultaneousHandlers={scrollSimultaneousRef}
            >
              <Text pointerEvents="none" style={styles.kanaGlyphSmall}>{k.glyph}</Text>
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

      {/* Imagen (usa tus assets) */}
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
  selectorRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 6,
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
  kanaBtnSmall: {
    width: "30%",
    borderRadius: 14,
    paddingVertical: 10,
    minHeight: 56,
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
  kanaGlyph: { fontSize: 28, color: "#fff", fontWeight: "900", lineHeight: 30 },
  kanaGlyphSmall: { fontSize: 30, color: "#fff", fontWeight: "900", lineHeight: 32 },
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

  imageWrap: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB", borderRadius: 14, padding: 10 },
  lottieControls: { flexDirection: "row", marginTop: 8, justifyContent: "center" },
  smallBtn: { backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#111827" },
  smallBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  smallBtnAlt: { backgroundColor: "#F3F4F6", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#D1D5DB" },
  smallBtnTextAlt: { color: "#111827", fontWeight: "800", fontSize: 12 },
  imageHint: { textAlign: "center", color: "#374151", fontSize: 12, fontWeight: "800", opacity: 0.85 },

  infoCard: { marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
  infoTitle: { fontWeight: "900", marginBottom: 6, color: "#111827" },
  infoText: { color: "#374151" },

  nextBtn: { marginTop: 18, alignSelf: "center", backgroundColor: "#111827", paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14 },
  nextText: { color: "#fff", fontWeight: "900" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
  },
});
