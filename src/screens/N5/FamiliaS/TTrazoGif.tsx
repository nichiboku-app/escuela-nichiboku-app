// src/screens/N5/FamiliaS/TTrazoGif.tsx
import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import Slider from "@react-native-community/slider";
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

/* ===== Tipos ===== */
type FamilyKey = "T" | "D";
type KanaKey =
  | "ta" | "chi" | "tsu" | "te" | "to"
  | "da" | "ji"  | "zu"  | "de" | "do";

/* ===== Config de familias ===== */
const FAMILY_LIST = [
  { key: "T", label: "Familia T", color: "#B32133" },
  { key: "D", label: "Familia D (dakuten)", color: "#0F766E" },
] as const;

const KANA_LIST: Record<FamilyKey, { key: KanaKey; glyph: string; label: string; color: string }[]> = {
  T: [
    { key: "ta",  glyph: "た", label: "ta",  color: "#B91C1C" },
    { key: "chi", glyph: "ち", label: "chi", color: "#9A3412" },
    { key: "tsu", glyph: "つ", label: "tsu", color: "#1D4ED8" },
    { key: "te",  glyph: "て", label: "te",  color: "#047857" },
    { key: "to",  glyph: "と", label: "to",  color: "#7C3AED" },
  ],
  D: [
    { key: "da", glyph: "だ", label: "da", color: "#0E7490" },
    { key: "ji", glyph: "ぢ", label: "ji", color: "#7C2D12" },
    { key: "zu", glyph: "づ", label: "zu", color: "#2563EB" },
    { key: "de", glyph: "で", label: "de", color: "#065F46" },
    { key: "do", glyph: "ど", label: "do", color: "#6D28D9" },
  ],
};

const RECOMMENDED_STROKES: Record<KanaKey, number> = {
  ta: 4, chi: 2, tsu: 1, te: 1, to: 2,
  da: 6, ji: 4, zu: 3, de: 3, do: 5,
};

const STROKE_TIPS: Record<KanaKey, string[]> = {
  ta:  ["① Barra corta.", "② Trazo oblicuo.", "③ Trazo vertical.", "④ Curva final."],
  chi: ["① Barra corta.", "② Curva larga descendente."],
  tsu: ["① Curva única continua."],
  te:  ["① Barra y curva en un trazo."],
  to:  ["① Trazo vertical curvo.", "② Trazo oblicuo corto."],
  da:  ["①–④ como た (ta).", "⑤⑥ Dakuten (゛)."],
  ji:  ["①–② como ち (chi).", "③④ Dakuten (゛)."],
  zu:  ["① como つ (tsu).", "②③ Dakuten (゛)."],
  de:  ["① como て (te).", "②③ Dakuten (゛)."],
  do:  ["①–② como と (to).", "③④ Dakuten (゛).", "⑤ Punto final."],
};

const ORDER_HINTS: Record<KanaKey, { x: number; y: number }[]> = {
  ta:  [{x:.30,y:.25},{x:.50,y:.18},{x:.50,y:.60},{x:.72,y:.66}],
  chi: [{x:.32,y:.20},{x:.64,y:.64}],
  tsu: [{x:.28,y:.36}],
  te:  [{x:.30,y:.22}],
  to:  [{x:.36,y:.20},{x:.62,y:.34}],
  da:  [{x:.30,y:.25},{x:.50,y:.18},{x:.50,y:.60},{x:.72,y:.66},{x:.78,y:.18},{x:.84,y:.16}],
  ji:  [{x:.32,y:.20},{x:.64,y:.64},{x:.78,y:.18},{x:.84,y:.16}],
  zu:  [{x:.28,y:.36},{x:.78,y:.18},{x:.84,y:.16}],
  de:  [{x:.30,y:.22},{x:.78,y:.18},{x:.84,y:.16}],
  do:  [{x:.36,y:.20},{x:.62,y:.34},{x:.78,y:.18},{x:.84,y:.16},{x:.74,y:.70}],
};

const GUIDE_STROKES: Record<KanaKey, string[]> = {
  ta: [], chi: [], tsu: [], te: [], to: [],
  da: [], ji: [], zu: [], de: [], do: [],
};
const OUTLINES: Record<KanaKey, string> = {
  ta:"", chi:"", tsu:"", te:"", to:"",
  da:"", ji:"", zu:"", de:"", do:"",
};

const ICON_TIPS = require("../../../../assets/icons/hiragana/SFamilia.webp");

/** RUTA CORRECTA de tus imágenes (familiaTD) */
const STROKE_ORDER_IMAGE: Partial<Record<KanaKey, any>> = {
  ta:  require("../../../../assets/images/Familiast/familiaTD/ta.webp"),
  chi: require("../../../../assets/images/Familiast/familiaTD/chi.webp"),
  tsu: require("../../../../assets/images/Familiast/familiaTD/tsu.webp"),
  te:  require("../../../../assets/images/Familiast/familiaTD/te.webp"),
  to:  require("../../../../assets/images/Familiast/familiaTD/to.webp"),
  da:  require("../../../../assets/images/Familiast/familiaTD/da.webp"),
  ji:  require("../../../../assets/images/Familiast/familiaTD/ji.webp"),
  zu:  require("../../../../assets/images/Familiast/familiaTD/zu.webp"),
  de:  require("../../../../assets/images/Familiast/familiaTD/de.webp"),
  do:  require("../../../../assets/images/Familiast/familiaTD/do.webp"),
};

/* ========= Botón con TapGestureHandler ========= */
function TapButton({
  children, onPress, style, role, simultaneousHandlers,
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
  kana, glyph, showGrid, showGuide, resetKey, reportCount,
  toggleScroll, fontLoaded, showStrokeGuides, baseGuideOpacity,
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
    setStrokes([]); setCurrentPath(""); setLocalCount(0);
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

        {showGrid && (
          <G>
            {gridLines.map((p, i) => <Line key={`v-${i}`} x1={p} y1={0} x2={p} y2={SIZE} stroke="#E4D2B2" strokeDasharray="6 10" />)}
            {gridLines.map((p, i) => <Line key={`h-${i}`} x1={0} y1={p} x2={SIZE} y2={p} stroke="#E4D2B2" strokeDasharray="6 10" />)}
            <Line x1={SIZE / 2} y1={0} x2={SIZE / 2} y2={SIZE} stroke="#D9C19A" />
            <Line x1={0} y1={SIZE / 2} x2={SIZE} y2={SIZE / 2} stroke="#D9C19A" />
          </G>
        )}

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
          ) : OUTLINES ? null : null
        )}

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

        {showStrokeGuides && (
          <G>
            {GUIDE_STROKES[kana].map((d, idx) => (
              <Path key={`g-${idx}`} d={d} stroke="#111827" strokeWidth={4} opacity={baseGuideOpacity} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </G>
        )}

        {!!currentPath && (
          <Path d={currentPath} stroke={INK_COLOR} strokeWidth={STROKE_WIDTH} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}

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

/* ===== Tarjeta de imagen (arriba del lienzo) + modal ===== */
function StrokeOrderImageCard({ kana, simultaneousHandlers }: { kana: KanaKey; simultaneousHandlers?: any }) {
  const src = STROKE_ORDER_IMAGE[kana];
  const { width } = useWindowDimensions();
  const W = Math.min(width - 32, 520);
  const H = 220;
  const [open, setOpen] = useState(false);

  if (!src) return null;

  const openWithHaptic = () => { Vibration.vibrate(8); setOpen(true); };
  const closeWithHaptic = () => { Vibration.vibrate(8); setOpen(false); };

  return (
    <View style={styles.imageWrap} collapsable={false}>
      <ExpoImage source={src} style={{ width: "100%", height: H, borderRadius: 12 }} contentFit="contain" />
      <View style={styles.lottieControls}>
        <TapButton onPress={openWithHaptic} style={styles.smallBtn} simultaneousHandlers={simultaneousHandlers}>
          <Text style={styles.smallBtnText} pointerEvents="none">Ampliar imagen</Text>
        </TapButton>
      </View>

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

/* ===== Pantalla ===== */
export default function TTrazoGif() {
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });

  const [family, setFamily] = useState<FamilyKey>("T");
  const [kana, setKana] = useState<KanaKey>("ta");
  const [resetKey, setResetKey] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showStrokeGuides, setShowStrokeGuides] = useState(false);
  const [baseGuideOpacity, setBaseGuideOpacity] = useState(0.12);

  const [count, setCount] = useState<number>(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const kanaList = KANA_LIST[family];
  const glyph = (kanaList.find(k => k.key === kana) || kanaList[0]).glyph;
  const tips = STROKE_TIPS[kana];
  const recommended = RECOMMENDED_STROKES[kana];

  const scrollSimultaneousRef = useRef<any>(null);

  useEffect(() => { setKana(KANA_LIST[family][0].key); }, [family]);
  useEffect(() => { setCount(0); setResetKey(n => n + 1); }, [kana]);

  const canvasRef = useRef<TraceCanvasHandle>(null);

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
        <Text style={styles.title}>Gif interactivo — Familias T/D</Text>
        <Text style={styles.subtitle}>Toca un botón para ver el orden de trazos del carácter.</Text>
      </View>

      {/* Selector de familia */}
      <View style={styles.selectorRow} collapsable={false}>
        {FAMILY_LIST.map((f) => {
          const active = family === f.key;
          return (
            <TapButton
              key={f.key}
              onPress={() => setFamily(f.key)}
              role="button"
              style={[styles.kanaBtn, { backgroundColor: f.color }, active && styles.kanaBtnActive]}
              simultaneousHandlers={scrollSimultaneousRef}
            >
              <Text pointerEvents="none" style={styles.kanaGlyph}>{f.key}</Text>
              <Text pointerEvents="none" style={styles.kanaLabel}>{f.label}</Text>
            </TapButton>
          );
        })}
      </View>

      {/* Selector de carácter */}
      <View style={styles.selectorRowWrap}>
        {kanaList.map((k) => {
          const active = kana === k.key;
          return (
            <TapButton
              key={k.key}
              onPress={() => setKana(k.key)}
              role="button"
              style={[styles.kanaBtnSmall, { backgroundColor: k.color }, active && styles.kanaBtnActive]}
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

      {/* === AQUÍ LA IMAGEN (arriba del lienzo) === */}
      <Text style={styles.sectionTitle}>Orden de trazos (imagen)</Text>
      <View style={{ marginHorizontal: 16, marginTop: 6 }}>
        <StrokeOrderImageCard kana={kana} simultaneousHandlers={scrollSimultaneousRef} />
      </View>

      {/* Opciones */}
      <Text style={styles.sectionTitle}>Opciones</Text>
      <View style={styles.pillsRow} collapsable={false}>
        <TapButton onPress={() => setShowGuide(v => !v)} style={[styles.pill, showGuide && styles.pillActive]} role="button" simultaneousHandlers={scrollSimultaneousRef}>
          <Text pointerEvents="none" style={[styles.pillText, showGuide && styles.pillTextActive]}>Guía</Text>
        </TapButton>
        <TapButton onPress={() => setShowGrid(v => !v)} style={[styles.pill, showGrid && styles.pillActive]} role="button" simultaneousHandlers={scrollSimultaneousRef}>
          <Text pointerEvents="none" style={[styles.pillText, showGrid && styles.pillTextActive]}>Cuadrícula</Text>
        </TapButton>
        <TapButton onPress={() => setShowStrokeGuides(v => !v)} style={[styles.pill, showStrokeGuides && styles.pillActive]} role="button" simultaneousHandlers={scrollSimultaneousRef}>
          <Text pointerEvents="none" style={[styles.pillText, showStrokeGuides && styles.pillTextActive]}>Líneas guía</Text>
        </TapButton>
      </View>

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

      {/* Toolbar + botón extra para ver imagen en modal (opcional) */}
      <View style={styles.toolbar} collapsable={false}>
        <TapButton onPress={() => { canvasRef.current?.undo(); Vibration.vibrate(10); }} role="button" style={styles.toolBtn} simultaneousHandlers={scrollSimultaneousRef}>
          <Text pointerEvents="none" style={styles.toolBtnText}>Deshacer</Text>
        </TapButton>
        <TapButton onPress={() => { canvasRef.current?.clear(); Vibration.vibrate(20); }} role="button" style={styles.toolBtn} simultaneousHandlers={scrollSimultaneousRef}>
          <Text pointerEvents="none" style={styles.toolBtnText}>Borrar todo</Text>
        </TapButton>
        {/* Botón rápido para modal (además de la tarjeta) */}
        <TapButton onPress={() => Vibration.vibrate(1)} style={styles.toolBtnAlt} role="button" simultaneousHandlers={scrollSimultaneousRef}>
          <OrderImageModalButtonInner kana={kana} />
        </TapButton>
      </View>

      {/* Nota じ/ぢ y ず/づ */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>¿じ(ji) o ぢ(ji)? ¿ず(zu) o づ(zu)?</Text>
        <Text style={styles.infoText}>
          • En japonés estándar, <Text style={{fontWeight:"900"}}>じ/ぢ</Text> suenan igual (ji) y <Text style={{fontWeight:"900"}}>ず/づ</Text> suenan igual (zu).{"\n"}
          • Usa normalmente <Text style={{fontWeight:"900"}}>じ</Text> y <Text style={{fontWeight:"900"}}>ず</Text>.{"\n"}
          • Escribe <Text style={{fontWeight:"900"}}>ぢ/づ</Text> cuando provienen de <Text style={{fontWeight:"900"}}>ち/つ</Text> por <Text style={{fontStyle:"italic"}}>rendaku</Text> o repetición: はなぢ, つづく, ちぢむ, みかづき.
        </Text>
      </View>
    </ScrollView>
  );
}

/* Botón compacto que abre el mismo modal de la imagen (para la toolbar) */
function OrderImageModalButtonInner({ kana }: { kana: KanaKey }) {
  const src = STROKE_ORDER_IMAGE[kana];
  const { width } = useWindowDimensions();
  const W = Math.min(width - 32, 520);
  const [open, setOpen] = useState(false);
  if (!src) return <Text style={styles.toolBtnTextAlt}>Ver orden (imagen)</Text>;
  return (
    <>
      <Text style={styles.toolBtnTextAlt}>Ver orden (imagen)</Text>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { width: W, maxWidth: 560 }]}>
            <ExpoImage source={src} style={{ width: "100%", height: W * 0.9, borderRadius: 12 }} contentFit="contain" />
            <TapButton onPress={() => setOpen(false)} style={[styles.smallBtnAlt, { marginTop: 10 }]}>
              <Text style={styles.smallBtnTextAlt} pointerEvents="none">Cerrar</Text>
            </TapButton>
          </View>
        </View>
      </Modal>
    </>
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
    flexDirection: "row", gap: 10, justifyContent: "space-between",
    paddingHorizontal: 16, marginTop: 6, zIndex: 10, elevation: 10,
  },
  selectorRowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16, marginTop: 6 },

  kanaBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 12, minHeight: 48,
    alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#111",
  },
  kanaBtnSmall: {
    width: "30%", borderRadius: 14, paddingVertical: 10, minHeight: 56,
    alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#111",
  },
  kanaBtnActive: {
    transform: [{ translateY: -2 }],
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 5 },
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

  pillsRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, marginBottom: 6, marginTop: 6, zIndex: 10, elevation: 10 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: "#C4B69B",
    backgroundColor: "#FFFDF9", marginRight: 8, marginBottom: 8, minHeight: 44, minWidth: 88, alignItems: "center", justifyContent: "center",
  },
  pillActive: { backgroundColor: "#111827", borderColor: "#111827" },
  pillText: { color: "#3B2B1B", fontWeight: "700" },
  pillTextActive: { color: "#fff" },

  sliderRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 6 },
  sliderLabel: { fontWeight: "800", color: "#111827", marginRight: 6 },
  sliderValue: { width: 44, textAlign: "right", fontWeight: "800", color: "#111827", marginLeft: 6 },

  /* Tarjeta de imagen */
  imageWrap: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB", borderRadius: 14, padding: 10, marginHorizontal: 16 },

  lottieControls: { flexDirection: "row", marginTop: 8, justifyContent: "center" },
  smallBtn: { backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#111827" },
  smallBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  smallBtnAlt: { backgroundColor: "#F3F4F6", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#D1D5DB" },
  smallBtnTextAlt: { color: "#111827", fontWeight: "800", fontSize: 12 },

  /* Lienzo toolbar */
  toolbar: { flexDirection: "row", alignSelf: "center", marginTop: 10, zIndex: 10, elevation: 10, flexWrap: "wrap", gap: 8 },
  toolBtn: {
    backgroundColor: "#111827", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    minHeight: 48, minWidth: 120, alignItems: "center", justifyContent: "center", marginHorizontal: 6,
  },
  toolBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  toolBtnAlt: { backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: "#D1D5DB" },
  toolBtnTextAlt: { color: "#111827", fontWeight: "900", fontSize: 14 },

  infoCard: { marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
  infoTitle: { fontWeight: "900", marginBottom: 6, color: "#111827" },
  infoText: { color: "#374151" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 10, alignItems: "center" },
});
