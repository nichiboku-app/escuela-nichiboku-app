import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { Image as ExpoImage } from "expo-image";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    Vibration,
    View,
    useWindowDimensions,
} from "react-native";
import { State as RNGHState, TapGestureHandler } from "react-native-gesture-handler";
import type { RootStackParamList } from "../../../../types";

/* ===== Navegación ===== */
type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ===== Data familia N ===== */
export type KanaKey = "na" | "ni" | "nu" | "ne" | "no";

const KANA: { key: KanaKey; glyph: string; romaji: string; color: string; sample?: string }[] = [
  { key: "na", glyph: "な", romaji: "na", color: "#B32133", sample: "なつ (natsu) = verano" },
  { key: "ni", glyph: "に", romaji: "ni", color: "#8B4513", sample: "にほん (nihon) = Japón" },
  { key: "nu", glyph: "ぬ", romaji: "nu", color: "#1D4ED8", sample: "ぬの (nuno) = tela" },
  { key: "ne", glyph: "ね", romaji: "ne", color: "#047857", sample: "ねこ (neko) = gato" },
  { key: "no", glyph: "の", romaji: "no", color: "#7C3AED", sample: "のむ (nomu) = beber" },
];

/* ===== Fallback fonético en inglés (cuando no hay voz ja-JP) ===== */
const FALLBACK_EN: Record<KanaKey, string> = {
  na: "nah",
  ni: "nee",
  nu: "noo",   // evita que lo lea como “new”
  ne: "neh",   // evita “knee”
  no: "noh",   // evita “naw”
};

/* ===== Imágenes de orden de trazo ===== */
const STROKE_ORDER_IMAGE: Partial<Record<KanaKey, any>> = {
  na: require("../../../../assets/images/Familian/na.webp"),
  ni: require("../../../../assets/images/Familian/ni.webp"),
  nu: require("../../../../assets/images/Familian/nu.webp"),
  ne: require("../../../../assets/images/Familian/ne.webp"),
  no: require("../../../../assets/images/Familian/no.webp"),
};

/* ===== Hook: sonidos de feedback (correcto / incorrecto) ===== */
function useQuizSfx() {
  const correctRef = useRef<Audio.Sound | null>(null);
  const wrongRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const [correct, wrong] = await Promise.all([
          Audio.Sound.createAsync(require("../../../../assets/sounds/correct.mp3")),
          Audio.Sound.createAsync(require("../../../../assets/sounds/wrong.mp3")),
        ]);
        if (!mounted) {
          correct.sound.unloadAsync();
          wrong.sound.unloadAsync();
          return;
        }
        correctRef.current = correct.sound;
        wrongRef.current = wrong.sound;
        await correctRef.current.setVolumeAsync(0.7);
        await wrongRef.current.setVolumeAsync(0.7);
      } catch (e) {
        console.warn("SFX init error", e);
      }
    })();
    return () => {
      mounted = false;
      correctRef.current?.unloadAsync();
      wrongRef.current?.unloadAsync();
    };
  }, []);

  const playCorrect = useCallback(async () => {
    try { await correctRef.current?.replayAsync(); } catch {}
  }, []);
  const playWrong = useCallback(async () => {
    try { await wrongRef.current?.replayAsync(); } catch {}
  }, []);

  return { playCorrect, playWrong };
}

/* ===== Hook: elegir voz japonesa disponible (con fallback) ===== */
function useJapaneseVoice() {
  const [voiceId, setVoiceId] = React.useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const jaEnhanced = voices.find(
          (v) =>
            (v.language?.toLowerCase().startsWith("ja") ||
              v.identifier?.toLowerCase().includes("ja")) &&
            v.quality === Speech.VoiceQuality.Enhanced
        );
        const jaAny =
          jaEnhanced ??
          voices.find(
            (v) =>
              v.language?.toLowerCase().startsWith("ja") ||
              v.identifier?.toLowerCase().includes("ja")
          );
        if (mounted) setVoiceId(jaAny?.identifier ?? null);
      } catch {
        if (mounted) setVoiceId(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return voiceId;
}

/* ===== Botón con TapGestureHandler ===== */
function TapButton({
  children,
  onPress,
  style,
  role,
  simultaneousHandlers,
}: {
  children?: React.ReactNode;
  onPress: () => void | Promise<void>;
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

/* ===== Tarjeta imagen orden de trazos con modal ===== */
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
      {src ? (
        <>
          <TapButton
            onPress={openWithHaptic}
            style={{ width: "100%", borderRadius: 12 }}
            simultaneousHandlers={simultaneousHandlers}
          >
            <ExpoImage source={src} style={{ width: "100%", height: H, borderRadius: 12 }} contentFit="contain" />
          </TapButton>
          <View style={styles.imageControls}>
            <TapButton onPress={openWithHaptic} style={styles.smallBtn} simultaneousHandlers={simultaneousHandlers}>
              <Text style={styles.smallBtnText} pointerEvents="none">Ampliar imagen</Text>
            </TapButton>
          </View>
        </>
      ) : (
        <Text style={styles.imageHint}>Agrega la imagen de orden de trazo para {kana.toUpperCase()}.</Text>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeWithHaptic}>
        <View style={styles.modalBackdrop}>
          <TapButton onPress={closeWithHaptic} style={{ flex: 1 }} />
          <View style={[styles.modalCard, { width: W, maxWidth: 560 }]}>
            {src && (
              <ExpoImage source={src} style={{ width: "100%", height: W * 0.9, borderRadius: 12 }} contentFit="contain" />
            )}
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

/* ===== UTIL ===== */
const shuffle = <T,>(arr: T[]) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ===== Pantalla: Lectura guiada + Quiz ===== */
export default function NLecturaGuiadaScreen() {
  const navigation = useNavigation<Nav>();
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });
  const { playCorrect, playWrong } = useQuizSfx();
  const jaVoiceId = useJapaneseVoice();

  // Estado de lectura guiada
  const [kanaIdx, setKanaIdx] = useState(0);
  const [showRomaji, setShowRomaji] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [rate, setRate] = useState(0.9); // velocidad TTS
  const [randomOrder, setRandomOrder] = useState(false);
  const [order, setOrder] = useState<number[]>(KANA.map((_, i) => i));

  // Estado del Quiz
  const [quizMode, setQuizMode] = useState<"off" | "playing" | "done">("off");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  const scrollRef = useRef<any>(null);
  const current = KANA[order[kanaIdx]];

  /* ====== TTS robusto con selección de voz ====== */
  const speak = useCallback(
    async (text: string, kanaKey?: KanaKey) => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        Speech.stop();

        if (jaVoiceId) {
          Speech.speak(text, {
            voice: jaVoiceId,
            language: "ja-JP",
            pitch: 1.05,
            rate,
          });
        } else {
          // Fallback fonético
          const fallback = kanaKey ? FALLBACK_EN[kanaKey] : "neh";
          Speech.speak(fallback, {
            language: "en-US",
            pitch: 1.0,
            rate: 0.9,
          });
        }
        Vibration.vibrate(6);
      } catch (e) {
        console.warn("Speech error", e);
      }
    },
    [jaVoiceId, rate]
  );

  // autoplay al cambiar de tarjeta
  useEffect(() => {
    if (autoPlay) speak(current.glyph, current.key);
    return () => { Speech.stop(); };
  }, [kanaIdx, autoPlay, current, speak]);

  /* ====== Controles lectura ====== */
  const next = () => setKanaIdx((i) => Math.min(order.length - 1, i + 1));
  const prev = () => setKanaIdx((i) => Math.max(0, i - 1));

  // mantener orden aleatorio si se activa
  useEffect(() => {
    setOrder(randomOrder ? shuffle(KANA.map((_, i) => i)) : KANA.map((_, i) => i));
    setKanaIdx(0);
  }, [randomOrder]);

  /* ====== Mini-Quiz ====== */
  const startQuiz = () => {
    Vibration.vibrate(8);
    setQuizMode("playing");
    setRound(1);
    setScore(0);
  };

  const finishQuiz = () => {
    Vibration.vibrate(12);
    setQuizMode("done");
  };

  const currentQuizKana = useMemo(() => {
    const pick = KANA[Math.floor(Math.random() * KANA.length)];
    const distractors = shuffle(KANA.filter(k => k.key !== pick.key)).slice(0, 2);
    const options = shuffle([pick.romaji, ...distractors.map(d => d.romaji)]);
    return { pick, options };
  }, [round, quizMode]);

  const selectAnswer = async (opt: string) => {
    const correct = opt === currentQuizKana.pick.romaji;
    if (correct) await playCorrect(); else await playWrong();
    Vibration.vibrate(correct ? 15 : 6);
    if (correct) setScore((s) => s + 1);
    if (round >= 5) finishQuiz(); else setRound((r) => r + 1);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 28 }}
      keyboardShouldPersistTaps="always"
      removeClippedSubviews={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Lectura guiada — Familia N</Text>
        <Text style={styles.subtitle}>Repasa な・に・ぬ・ね・の con audio, guía y mini-quiz</Text>
      </View>

      {/* Aviso si no hay voz japonesa */}
      {!jaVoiceId && (
        <View style={styles.voiceBanner}>
          <Text style={styles.voiceBannerTitle}>
            Para pronunciación natural, instala una voz japonesa (ja-JP).
          </Text>
          <Text style={styles.voiceBannerText}>
            • iOS: Ajustes → Accesibilidad → Contenido hablado → Voces → Añadir voz → Japonés{"\n"}
            • Android: Ajustes → Sistema → Idiomas y entrada → Salida TTS → Motor de Google → Descargar Japonés
          </Text>
        </View>
      )}

      {/* Tabs Lectura / Quiz */}
      <View style={styles.tabsRow}>
        <TapButton
          role="button"
          onPress={() => setQuizMode("off")}
          style={[styles.tabBtn, quizMode === "off" && styles.tabBtnActive]}
          simultaneousHandlers={scrollRef}
        >
          <Text style={[styles.tabText, quizMode === "off" && styles.tabTextActive]}>Lectura</Text>
        </TapButton>
        <TapButton
          role="button"
          onPress={() => startQuiz()}
          style={[styles.tabBtn, quizMode !== "off" && styles.tabBtnActive]}
          simultaneousHandlers={scrollRef}
        >
          <Text style={[styles.tabText, quizMode !== "off" && styles.tabTextActive]}>
            {quizMode === "playing" ? `Quiz ${round}/5` : quizMode === "done" ? "Resultado" : "Quiz"}
          </Text>
        </TapButton>
      </View>

      {/* ===== Lectura ===== */}
      {quizMode === "off" && (
        <>
          <View style={styles.flashCard}>
            <Text
              style={[styles.kanaGlyphBig, { fontFamily: fontsLoaded ? "NotoSansJP_700Bold" : undefined, color: current.color }]}
              onPress={() => speak(current.glyph, current.key)}
            >
              {current.glyph}
            </Text>
            {showRomaji && <Text style={styles.kanaRomaji}>{current.romaji}</Text>}
            {!!current.sample && <Text style={styles.sample}>{current.sample}</Text>}
          </View>

          <View style={styles.controlsRow}>
            <TapButton role="button" onPress={prev} style={styles.ctrlBtn} simultaneousHandlers={scrollRef}>
              <Text style={styles.ctrlText}>Anterior</Text>
            </TapButton>
            <TapButton
              role="button"
              onPress={() => speak(current.glyph, current.key)}
              style={styles.ctrlBtnDark}
              simultaneousHandlers={scrollRef}
            >
              <Text style={styles.ctrlTextDark}>Escuchar</Text>
            </TapButton>
            <TapButton role="button" onPress={next} style={styles.ctrlBtn} simultaneousHandlers={scrollRef}>
              <Text style={styles.ctrlText}>Siguiente</Text>
            </TapButton>
          </View>

          <View style={styles.pillsRow}>
            <TapButton role="button" onPress={() => { setShowRomaji(v => !v); Vibration.vibrate(6); }} style={[styles.pill, showRomaji && styles.pillActive]} simultaneousHandlers={scrollRef}>
              <Text style={[styles.pillText, showRomaji && styles.pillTextActive]}>{showRomaji ? "Ocultar romaji" : "Mostrar romaji"}</Text>
            </TapButton>
            <TapButton role="button" onPress={() => { setAutoPlay(v => !v); Vibration.vibrate(6); }} style={[styles.pill, autoPlay && styles.pillActive]} simultaneousHandlers={scrollRef}>
              <Text style={[styles.pillText, autoPlay && styles.pillTextActive]}>{autoPlay ? "Autoplay: ON" : "Autoplay: OFF"}</Text>
            </TapButton>
            <TapButton role="button" onPress={() => { setRandomOrder(v => !v); Vibration.vibrate(6); }} style={[styles.pill, randomOrder && styles.pillActive]} simultaneousHandlers={scrollRef}>
              <Text style={[styles.pillText, randomOrder && styles.pillTextActive]}>{randomOrder ? "Aleatorio" : "Orden fijo"}</Text>
            </TapButton>
          </View>

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Velocidad</Text>
            <Slider
              style={{ flex: 1, marginHorizontal: 12 }}
              minimumValue={0.6}
              maximumValue={1.2}
              step={0.01}
              value={rate}
              minimumTrackTintColor="#111827"
              maximumTrackTintColor="#D1D5DB"
              thumbTintColor="#111827"
              onValueChange={setRate}
            />
            <Text style={styles.sliderValue}>{rate.toFixed(2)}x</Text>
          </View>

          <Text style={styles.sectionTitle}>Orden de trazos (visual)</Text>
          <View style={{ marginHorizontal: 16 }}>
            <StrokeOrderImageCard kana={current.key} simultaneousHandlers={scrollRef} />
          </View>
        </>
      )}

      {/* ===== Quiz ===== */}
      {quizMode !== "off" && (
        <>
          {quizMode === "playing" && (
            <View style={styles.quizCard}>
              <Text style={[styles.quizGlyph, { fontFamily: fontsLoaded ? "NotoSansJP_700Bold" : undefined }]}>
                {currentQuizKana.pick.glyph}
              </Text>
              <Text style={styles.quizHint}>¿Cuál es la lectura correcta?</Text>

              <View style={styles.quizOptions}>
                {currentQuizKana.options.map((opt) => (
                  <TapButton
                    key={opt}
                    role="button"
                    onPress={() => selectAnswer(opt)}
                    style={styles.optionBtn}
                    simultaneousHandlers={scrollRef}
                  >
                    <Text style={styles.optionText}>{opt}</Text>
                  </TapButton>
                ))}
              </View>

              <Text style={styles.quizRound}>Ronda {round} / 5</Text>
            </View>
          )}

          {quizMode === "done" && (
            <View style={styles.quizResult}>
              <Text style={styles.resultTitle}>¡Resultado!</Text>
              <Text style={styles.resultScore}>{score} / 5</Text>
              <View style={styles.controlsRow}>
                <TapButton role="button" onPress={startQuiz} style={styles.ctrlBtnDark} simultaneousHandlers={scrollRef}>
                  <Text style={styles.ctrlTextDark}>Repetir quiz</Text>
                </TapButton>
                <TapButton role="button" onPress={() => setQuizMode("off")} style={styles.ctrlBtn} simultaneousHandlers={scrollRef}>
                  <Text style={styles.ctrlText}>Volver a lectura</Text>
                </TapButton>
              </View>
            </View>
          )}
        </>
      )}
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

  /* Banner falta voz japonesa */
  voiceBanner: {
    margin: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFF4E5",
    borderWidth: 1,
    borderColor: "#FACC15",
  },
  voiceBannerTitle: { color: "#7C2D12", fontWeight: "800" },
  voiceBannerText: { color: "#7C2D12", marginTop: 4 },

  tabsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  tabBtnActive: { backgroundColor: "#111827", borderColor: "#111827" },
  tabText: { fontWeight: "800", color: "#111827" },
  tabTextActive: { color: "#fff" },

  flashCard: {
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF8EF",
    alignItems: "center",
  },
  kanaGlyphBig: { fontSize: 110, textAlign: "center" },
  kanaRomaji: { fontSize: 20, fontWeight: "900", color: "#111827", marginTop: 8 },
  sample: { marginTop: 6, color: "#374151" },

  controlsRow: { flexDirection: "row", alignSelf: "center", marginTop: 14 },
  ctrlBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 110,
    alignItems: "center",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  ctrlText: { color: "#111827", fontWeight: "800" },
  ctrlBtnDark: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 110,
    alignItems: "center",
    marginHorizontal: 6,
  },
  ctrlTextDark: { color: "#fff", fontWeight: "800" },

  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C4B69B",
    backgroundColor: "#FFFDF9",
    minHeight: 44,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: { backgroundColor: "#111827", borderColor: "#111827" },
  pillText: { color: "#3B2B1B", fontWeight: "700" },
  pillTextActive: { color: "#fff" },

  sliderRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 8 },
  sliderLabel: { fontWeight: "800", color: "#111827", marginRight: 6 },
  sliderValue: { width: 56, textAlign: "right", fontWeight: "800", color: "#111827", marginLeft: 6 },

  imageWrap: { borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB", borderRadius: 14, padding: 10, marginTop: 10 },
  imageControls: { flexDirection: "row", marginTop: 8, justifyContent: "center" },
  smallBtn: { backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#111827" },
  smallBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  smallBtnAlt: { backgroundColor: "#F3F4F6", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#D1D5DB" },
  smallBtnTextAlt: { color: "#111827", fontWeight: "800", fontSize: 12 },
  imageHint: { textAlign: "center", color: "#374151", fontSize: 12, fontWeight: "800", opacity: 0.85 },

  /* Modal */
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

  /* QUIZ */
  quizCard: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF8EF",
  },
  quizGlyph: { fontSize: 88, textAlign: "center", color: "#111827" },
  quizHint: { textAlign: "center", marginTop: 6, color: "#374151" },
  quizOptions: { marginTop: 14, gap: 10 },
  optionBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  optionText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  quizRound: { textAlign: "center", color: "#6B7280", marginTop: 10 },

  quizResult: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  resultTitle: { fontWeight: "900", fontSize: 18, color: "#111827" },
  resultScore: { fontWeight: "900", fontSize: 34, color: "#111827", marginVertical: 8 },
});
