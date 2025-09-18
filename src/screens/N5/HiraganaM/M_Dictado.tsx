// src/screens/N5/HiraganaM/M_Dictado.tsx
import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* =================== Tipos =================== */
type KanaKey = "ma" | "mi" | "mu" | "me" | "mo";
type KanaItem = {
  key: KanaKey;
  char: string;
  romaji: string;
  audio: any; // require local
};
type XY = { x: number; y: number };

/* =================== Hints (coordenadas 0..1) y conteo =================== */
/** Ajusta estos puntos si quieres mover el numerito de inicio de cada trazo. */
const HINTS_M: Record<string, XY[]> = {
  // M — ま・み・む・め・も
  "ま": [
    { x: 0.22, y: 0.28 }, // ① barra/curva superior (inicio izq)
    { x: 0.46, y: 0.22 }, // ② vertical central (arriba)
    { x: 0.58, y: 0.50 }, // ③ bucle/curva derecha
  ],
  "み": [
    { x: 0.22, y: 0.34 }, // ① curva alta
    { x: 0.38, y: 0.48 }, // ② ondulación media
    { x: 0.28, y: 0.64 }, // ③ remate inferior
  ],
  "む": [
    { x: 0.18, y: 0.34 }, // ① barra superior
    { x: 0.50, y: 0.36 }, // ② caída izquierda del óvalo
    { x: 0.50, y: 0.78 }, // ③ subida derecha (cierra gota)
  ],
  "め": [
    { x: 0.24, y: 0.26 }, // ① barra superior
    { x: 0.36, y: 0.26 }, // ② vertical/bucle
    { x: 0.30, y: 0.60 }, // ③ arrastre inferior
  ],
  "も": [
    { x: 0.18, y: 0.28 }, // ① barra superior
    { x: 0.52, y: 0.24 }, // ② vertical
    { x: 0.30, y: 0.56 }, // ③ barra media
  ],
};
const STROKE_COUNT_M: Record<string, number> = {
  "ま": 3,
  "み": 3,
  "む": 3,
  "め": 3,
  "も": 3,
};

/* =================== One-shot player para audio del kana =================== */
function useOneShotSound() {
  const soundRef = useRef<Audio.Sound | null>(null);

  const unload = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current = null;
      }
    } catch {}
  }, []);

  const play = useCallback(
    async (source: any, { onEnd }: { onEnd?: () => void } = {}) => {
      await unload();
      try {
        const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((st) => {
          const s = st as AVPlaybackStatusSuccess;
          if (s.isLoaded && s.didJustFinish) onEnd?.();
        });
        await sound.playAsync();
      } catch (e) {
        console.warn("No se pudo reproducir audio del kana:", e);
      }
    },
    [unload]
  );

  useEffect(() => {
    return () => { unload(); };
  }, [unload]);

  return { play, unload };
}

/* =================== Datos (audios de la familia M) =================== */
const KANA_M: KanaItem[] = [
  { key: "ma", char: "ま", romaji: "ma", audio: require("../../../../assets/audio/hiragana/m/ma.mp3") },
  { key: "mi", char: "み", romaji: "mi", audio: require("../../../../assets/audio/hiragana/m/mi.mp3") },
  { key: "mu", char: "む", romaji: "mu", audio: require("../../../../assets/audio/hiragana/m/mu.mp3") },
  { key: "me", char: "め", romaji: "me", audio: require("../../../../assets/audio/hiragana/m/me.mp3") },
  { key: "mo", char: "も", romaji: "mo", audio: require("../../../../assets/audio/hiragana/m/mo.mp3") },
];

/* =================== Frame tipo “Roleplay” (guía + numeritos) =================== */
function TraceFrame({
  char,
  size = 240,
  showGrid = true,
  showGuide = true,
}: {
  char: string;
  size?: number;
  showGrid?: boolean;
  showGuide?: boolean;
}) {
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });
  const hints = HINTS_M[char] || [];
  const count = STROKE_COUNT_M[char] ?? hints.length;

  const grid = [1, 2, 3].map((i) => (i * size) / 4);
  const fontSize = size * 0.62;

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

        {showGuide && fontsLoaded && (
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

        {hints.map((h, i) => {
          const cx = h.x * size;
          const cy = h.y * size;
          const active = i === 0; // si quieres resaltar el 1º, cámbialo
          return (
            <G key={`hint-${i}`} opacity={0.96}>
              <Circle cx={cx} cy={cy} r={12} fill={active ? "#111827" : "#B32133"} />
              <SvgText
                x={cx}
                y={cy + 1}
                fontSize={12}
                fontWeight="bold"
                fill="#fff"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {i + 1}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      <Text style={{ textAlign: "center", marginTop: 6, fontWeight: "800", color: "#111827" }}>
        {count ? `${count} trazos` : "Trazos"}
      </Text>
    </View>
  );
}

/* =================== Pantalla principal =================== */
export default function M_Dictado() {
  const [currentPrompt, setCurrentPrompt] = useState<KanaItem | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"idle" | "ok" | "bad">("idle");
  const [isChecking, setIsChecking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalKana, setModalKana] = useState<KanaItem | null>(null);

  const { play: playOne, unload } = useOneShotSound();
  const { playCorrect, playWrong } = useFeedbackSounds();

  const randomKana = useCallback(() => KANA_M[Math.floor(Math.random() * KANA_M.length)], []);

  const newPrompt = useCallback(async () => {
    setResult("idle");
    const k = randomKana();
    setCurrentPrompt(k);
    setIsPlaying(true);
    await playOne(k.audio, { onEnd: () => setIsPlaying(false) });
  }, [playOne, randomKana]);

  const replay = useCallback(async () => {
    if (!currentPrompt) return;
    setIsPlaying(true);
    await playOne(currentPrompt.audio, { onEnd: () => setIsPlaying(false) });
  }, [currentPrompt, playOne]);

  const checkAnswer = useCallback(async () => {
    if (!currentPrompt || isChecking) return;
    setIsChecking(true);

    const normalized = answer.trim().toLowerCase();
    const ok = normalized === currentPrompt.romaji || normalized === currentPrompt.char;

    setResult(ok ? "ok" : "bad");
    if (ok) await playCorrect();
    else await playWrong();

    setTimeout(() => {
      setAnswer("");
      setIsChecking(false);
    }, 600);
  }, [answer, currentPrompt, isChecking, playCorrect, playWrong]);

  const headerStatus = useMemo(() => {
    if (result === "ok") return "✅ ¡Correcto!";
    if (result === "bad") return "✖️ Intenta de nuevo";
    return "—";
  }, [result]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    return () => { unload(); };
  }, [unload]);

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Dictado — Grupo M (ま・み・む・め・も)</Text>
      <Text style={s.subtitle}>
        Presiona <Text style={s.bold}>Nuevo dictado</Text> para reproducir un audio y escribe su{" "}
        <Text style={s.bold}>romaji</Text> o <Text style={s.bold}>kana</Text>.
      </Text>

      {/* Estado */}
      <View style={s.stateBox}>
        <Text style={s.stateTxt}>Estado: {headerStatus}</Text>
        <Text style={s.stateSmall}>
          Actual: {currentPrompt ? `${currentPrompt.char} (${currentPrompt.romaji})` : "—"}
        </Text>
        {isPlaying && <Text style={s.stateSmall}>🔊 Reproduciendo…</Text>}
      </View>

      {/* Controles */}
      <View style={s.row}>
        <Pressable style={[s.btn, s.btnBlack]} onPress={newPrompt}>
          <Text style={s.btnTxt}>🔄 Nuevo dictado (con audio)</Text>
        </Pressable>
        <Pressable style={[s.btn, s.btnGold]} onPress={replay} disabled={!currentPrompt || isPlaying}>
          <Text style={s.btnTxt}>🔊 Reproducir audio</Text>
        </Pressable>
      </View>

      <View style={s.answerBox}>
        <Text style={s.label}>Tu respuesta</Text>
        <TextInput
          style={s.input}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Ej. ma o ま"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isChecking}
          returnKeyType="send"
          onSubmitEditing={checkAnswer}
        />
        <Pressable style={[s.btn, s.btnGold]} onPress={checkAnswer} disabled={!currentPrompt || isChecking}>
          <Text style={s.btnTxt}>Comprobar</Text>
        </Pressable>
      </View>

      {/* Tarjetas */}
      <Text style={[s.h2, { marginTop: 22 }]}>Cómo se escribe cada letra</Text>
      <Text style={s.caption}>Toca una tarjeta para abrir el frame de trazos (estilo Roleplay).</Text>

      <View style={s.grid}>
        {KANA_M.map((k) => (
          <Pressable key={k.key} style={[s.card, s.cardFrame]} onPress={() => setModalKana(k)}>
            <Text style={s.cardKana}>{k.char}</Text>
            <Text style={s.cardSub}>{k.romaji.toUpperCase()}</Text>
            <Text style={s.cardHint}>Ver trazos ›</Text>
          </Pressable>
        ))}
      </View>

      {/* Modal — TraceFrame */}
      <Modal visible={!!modalKana} animationType="slide" transparent>
        <View style={sf.modalWrap}>
          <View style={sf.modalCard}>
            <Text style={sf.modalTitle}>Trazos — {modalKana?.char} ({modalKana?.romaji})</Text>
            {modalKana && (
              <TraceFrame
                char={modalKana.char}
                size={260}
                showGrid={true}
                showGuide={true}
              />
            )}
            <View style={{ height: 8 }} />
            <Pressable style={[s.btn, s.btnBlack]} onPress={() => setModalKana(null)}>
              <Text style={s.btnTxt}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* =================== Estilos =================== */
const FRAME = "#0C0C0C";
const BLACK = "#111827";
const GOLD = "#E7A725";

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 36, gap: 12, backgroundColor: "#FFFFFF" },
  title: { fontSize: 22, fontWeight: "900", color: BLACK },
  subtitle: { fontSize: 13.5, color: "#374151" },
  bold: { fontWeight: "900" },

  stateBox: {
    borderWidth: 2,
    borderColor: FRAME,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    gap: 4,
  },
  stateTxt: { fontSize: 14.5, fontWeight: "800", color: BLACK },
  stateSmall: { fontSize: 12.5, color: "#4B5563" },

  row: { flexDirection: "row", gap: 10, marginTop: 8, flexWrap: "wrap" },
  btn: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnBlack: { backgroundColor: BLACK, borderWidth: 3, borderColor: FRAME },
  btnGold: { backgroundColor: GOLD, borderWidth: 3, borderColor: FRAME },
  btnTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.3 },

  answerBox: {
    marginTop: 12,
    gap: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: FRAME,
    padding: 12,
    backgroundColor: "#FFFDF8",
  },
  label: { fontSize: 13, fontWeight: "800", color: "#374151" },
  input: {
    borderWidth: 2,
    borderColor: FRAME,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "800",
    color: BLACK,
    backgroundColor: "#FFFFFF",
  },

  h2: { fontSize: 18, fontWeight: "900", color: BLACK },
  caption: { fontSize: 12.5, color: "#6B7280", marginBottom: 8 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    flexBasis: "48%",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: FRAME,
    padding: 14,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardFrame: { alignItems: "center", justifyContent: "center" },
  cardKana: { fontSize: 28, fontWeight: "900", color: BLACK },
  cardSub: { fontSize: 12, color: "#4B5563", marginTop: 2 },
  cardHint: { marginTop: 8, fontWeight: "800", color: BLACK },
});

const sf = StyleSheet.create({
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#0C0C0C",
    backgroundColor: "#FFFFFF",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#111827", marginBottom: 10 },
});
