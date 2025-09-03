// src/screens/N5/TrazosGrupoA.tsx
import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import type { RootStackParamList } from "../../../types";

/* ============ Tipos ============ */
type Nav = NativeStackNavigationProp<RootStackParamList>;
type KanaKey = "a" | "i" | "u" | "e" | "o";

/* ============ Config ============ */
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

// puntos para numeritos 1,2,3…
const ORDER_HINTS: Record<KanaKey, { x: number; y: number }[]> = {
  a: [{ x: 0.30, y: 0.17 }, { x: 0.33, y: 0.35 }, { x: 0.67, y: 0.55 }],
  i: [{ x: 0.52, y: 0.18 }, { x: 0.56, y: 0.35 }],
  u: [{ x: 0.56, y: 0.24 }, { x: 0.45, y: 0.60 }],
  e: [{ x: 0.46, y: 0.19 }, { x: 0.43, y: 0.58 }],
  o: [{ x: 0.65, y: 0.18 }, { x: 0.45, y: 0.46 }, { x: 0.64, y: 0.64 }],
};

// líneas guía opcionales (superposición)
const GUIDE_STROKES: Record<KanaKey, string[]> = {
  a: ["M 120 70 L 240 70", "M 160 90 C 130 150, 130 220, 210 250", "M 220 110 C 260 150, 270 185, 250 205"],
  i: ["M 190 80 L 230 95", "M 205 95 C 180 130, 180 220, 225 255"],
  u: ["M 210 95 C 185 115, 195 130, 225 140", "M 170 160 C 140 210, 185 260, 240 230 C 265 215, 260 195, 248 180"],
  e: ["M 170 80 L 260 80", "M 170 110 C 150 150, 230 170, 245 135 M 165 210 C 205 235, 265 215, 245 185"],
  o: ["M 245 75 L 225 88", "M 205 105 C 165 145, 165 215, 225 245 C 265 260, 295 215, 265 185", "M 265 185 C 255 195, 250 205, 250 205"],
};

// contorno fallback si no carga la fuente
const OUTLINES: Record<KanaKey, string> = {
  a: "M 120 70 L 240 70 M 160 90 C 130 150, 130 220, 210 250 M 220 110 C 260 150, 270 185, 250 205",
  i: "M 190 80 L 230 95 M 205 95 C 180 130, 180 220, 225 255",
  u: "M 210 95 C 185 115, 195 130, 225 140 M 170 160 C 140 210, 185 260, 240 230 C 265 215, 260 195, 248 180",
  e: "M 170 80 L 260 80 M 170 110 C 150 150, 230 170, 245 135 M 165 210 C 205 235, 265 215, 245 185",
  o: "M 245 75 L 225 88 M 205 105 C 165 145, 165 215, 225 245 C 265 260, 295 215, 265 185",
};

const ICON_TIPS = require("../../../assets/icons/hiragana/A_trazos.webp");

// usa tus imágenes (extensiones como las tengas)
const STROKE_ORDER_IMAGE: Record<KanaKey, any> = {
  a: require("../../../assets/strokeorder/images/hiragana-a.webp"),
  i: require("../../../assets/strokeorder/images/hiragana-i.webp"),
  u: require("../../../assets/strokeorder/images/hiragana-u.webp"),
  e: require("../../../assets/strokeorder/images/hiragana-e.webp"),
  o: require("../../../assets/strokeorder/images/hiragana-o.webp"),
};

/* ============ Lienzo de práctica ============ */
type Stroke = { color: string; width: number; d: string };

function TraceCanvas({
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
}: {
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
}) {
  const { width } = useWindowDimensions();
  const SIZE = Math.min(width - 32, 360);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [localCount, setLocalCount] = useState(0);
  const drawingRef = useRef(false);

  useEffect(() => { reportCount(localCount); }, [localCount, reportCount]);

  useEffect(() => {
    setStrokes([]); setCurrentPath(""); setLocalCount(0);
  }, [resetKey]);

  const safeToggleScroll = (enabled: boolean) => requestAnimationFrame(() => toggleScroll(enabled));

  const onStart = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    drawingRef.current = true; safeToggleScroll(false);
    setCurrentPath(`M ${locationX} ${locationY}`);
  };
  const onMove = (e: GestureResponderEvent) => {
    if (!drawingRef.current) return;
    const { locationX, locationY } = e.nativeEvent;
    setCurrentPath((p) => p + ` L ${locationX} ${locationY}`);
  };
  const finishStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false; safeToggleScroll(true);
    if (!currentPath) return;
    setStrokes((prev) => prev.concat({ color: inkColor, width: strokeWidth, d: currentPath }));
    setLocalCount((n) => n + 1);
    setCurrentPath("");
  };

  const undo = () => { setStrokes((prev) => prev.slice(0, -1)); setLocalCount((n) => Math.max(0, n - 1)); };
  const clear = () => { setStrokes([]); setCurrentPath(""); setLocalCount(0); };

  const gridLines = useMemo(() => Array.from({ length: 3 }, (_, i) => ((i + 1) * SIZE) / 4), [SIZE]);
  const fontSize = SIZE * 0.72;
  const hints = ORDER_HINTS[kana];

  return (
    <View style={{ alignSelf: "center" }}>
      <Svg
        width={SIZE} height={SIZE}
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

        {/* Guía principal (glifo o contorno) */}
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

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Pressable onPress={undo} style={styles.toolBtn}><Text style={styles.toolBtnText}>Deshacer</Text></Pressable>
        <Pressable onPress={clear} style={styles.toolBtn}><Text style={styles.toolBtnText}>Borrar</Text></Pressable>
      </View>
    </View>
  );
}

/* ============ Tarjeta de imagen (reemplaza al player) ============ */
function StrokeOrderImageCard({ kana }: { kana: KanaKey }) {
  const src = STROKE_ORDER_IMAGE[kana];
  const { width } = useWindowDimensions();
  const W = Math.min(width - 32, 520);
  const H = 220;
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.imageWrap}>
      <ExpoImage source={src} style={{ width: "100%", height: H, borderRadius: 12 }} contentFit="contain" />
      <View style={styles.lottieControls}>
        <Pressable onPress={() => setOpen(true)} style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>Ampliar imagen</Text>
        </Pressable>
      </View>
      <Text style={styles.imageHint}>Orden de trazos (imagen)</Text>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          <View style={[styles.modalCard, { width: W, maxWidth: 560 }]}>
            <ExpoImage source={src} style={{ width: "100%", height: W * 0.9, borderRadius: 12 }} contentFit="contain" />
            <Pressable onPress={() => setOpen(false)} style={[styles.smallBtnAlt, { marginTop: 10 }]}>
              <Text style={styles.smallBtnTextAlt}>Cerrar</Text>
            </Pressable>
          </View>
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}

/* ============ Botón tipo pill ============ */
function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

/* ============ Pantalla ============ */
export default function TrazosGrupoA() {
  const navigation = useNavigation<Nav>();
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });

  const [kana, setKana] = useState<KanaKey>("a");
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

  useEffect(() => {
    setCount(0);
    setResetKey((n) => n + 1);
  }, [kana]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }} scrollEnabled={scrollEnabled}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Trazos — Grupo A</Text>
        <Text style={styles.subtitle}>Practica あ・い・う・え・お con guía y cuadrícula</Text>
      </View>

      {/* Selector */}
      <Text style={styles.sectionTitle}>Elige el carácter</Text>
      <View style={styles.selectorRow}>
        {KANA_LIST.map((k) => (
          <Pressable
            key={k.key}
            onPress={() => setKana(k.key)}
            style={[styles.kanaBtn, { backgroundColor: k.color }, kana === k.key && styles.kanaBtnActive]}
          >
            <Text style={styles.kanaGlyph}>{k.glyph}</Text>
            <Text style={styles.kanaLabel}>{k.label}</Text>
          </Pressable>
        ))}
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

      {/* AQUÍ va la imagen que cambia con la letra */}
      <View style={{ marginHorizontal: 16, marginTop: 6 }}>
        <StrokeOrderImageCard kana={kana} />
      </View>

      {/* Opciones */}
      <Text style={styles.sectionTitle}>Opciones</Text>
      <View style={styles.pillsRow}>
        <Pill label="Guía" active={showGuide} onPress={() => setShowGuide((v) => !v)} />
        <Pill label="Cuadrícula" active={showGrid} onPress={() => setShowGrid((v) => !v)} />
        <Pill label="Pincel fino" active={strokeWidth === 6} onPress={() => setStrokeWidth(6)} />
        <Pill label="Pincel medio" active={strokeWidth === 10} onPress={() => setStrokeWidth(10)} />
        <Pill label="Pincel grueso" active={strokeWidth === 16} onPress={() => setStrokeWidth(16)} />
        <Pill label="Líneas guía" active={showStrokeGuides} onPress={() => setShowStrokeGuides((v) => !v)} />
      </View>
      <View style={styles.pillsRow}>
        <Pill label="Tinta negra" active={inkColor === "#111827"} onPress={() => setInkColor("#111827")} />
        <Pill label="Rojo" active={inkColor === "#B91C1C"} onPress={() => setInkColor("#B91C1C")} />
        <Pill label="Azul" active={inkColor === "#1D4ED8"} onPress={() => setInkColor("#1D4ED8")} />
        <Pill label="Verde" active={inkColor === "#047857"} onPress={() => setInkColor("#047857")} />
      </View>

      {/* Slider opacidad para líneas guía */}
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

      {/* Consejos finales */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Consejos</Text>
        <Text style={styles.infoText}>
          • Mantén el orden de los trazos.{"\n"}
          • Practica lento al inicio y luego a velocidad natural.{"\n"}
          • Suelta la presión al final para un acabado limpio.{"\n"}
          • Repite 3–5 veces cada carácter antes de pasar al siguiente.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}
        onPress={() => navigation.navigate("PronunciacionGrupoA")}
      >
        <Text style={styles.nextText}>Siguiente: Pronunciación del grupo A ➜</Text>
      </Pressable>
    </ScrollView>
  );
}

/* ============ Estilos ============ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { padding: 20, backgroundColor: "#a41034" },
  title: { color: "#fff", fontWeight: "900", fontSize: 22 },
  subtitle: { color: "#FBE8E8", marginTop: 6 },

  sectionTitle: { fontSize: 18, fontWeight: "800", marginTop: 18, marginBottom: 8, marginLeft: 16 },

  selectorRow: { flexDirection: "row", gap: 10, justifyContent: "space-between", paddingHorizontal: 16 },
  kanaBtn: { flex: 1, borderRadius: 14, paddingVertical: 10, alignItems: "center", borderWidth: 3, borderColor: "#111" },
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
    flexDirection: "row", gap: 12, alignItems: "center",
  },
  tipsTitle: { fontWeight: "900", marginBottom: 4, color: "#3B2B1B" },
  tipItem: { color: "#4B3A28" },

  counterPill: { backgroundColor: "#111827", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, alignItems: "center", minWidth: 76 },
  counterText: { color: "#fff", fontWeight: "900", fontSize: 16, lineHeight: 16 },
  counterSub: { color: "#D1D5DB", fontSize: 10 },

  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, marginBottom: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#C4B69B", backgroundColor: "#FFFDF9" },
  pillActive: { backgroundColor: "#111827", borderColor: "#111827" },
  pillText: { color: "#3B2B1B", fontWeight: "700" },
  pillTextActive: { color: "#fff" },

  sliderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 16, marginTop: 6 },
  sliderLabel: { fontWeight: "800", color: "#111827" },
  sliderValue: { width: 44, textAlign: "right", fontWeight: "800", color: "#111827" },

  toolbar: { flexDirection: "row", gap: 10, alignSelf: "center", marginTop: 10 },
  toolBtn: { backgroundColor: "#111827", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  toolBtnText: { color: "#fff", fontWeight: "800" },

  // Tarjeta de imagen / modal
  imageWrap: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB", borderRadius: 14, padding: 8 },
  lottieControls: { flexDirection: "row", gap: 8, marginTop: 8, justifyContent: "center" },
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
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 10, alignItems: "center" },
});
