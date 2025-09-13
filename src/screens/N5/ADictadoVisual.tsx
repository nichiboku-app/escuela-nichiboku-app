import { Asset } from "expo-asset";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

// (Opcional) si ya tienes este hook para sonidos de acierto/error, descomenta la línea siguiente.
// import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

type VisualItem = {
  id: string;
  img: any;          // require("...webp/png")
  jp: string;        // palabra en japonés (hiragana/katakana/kanji según corresponda)
  romaji?: string;   // romaji opcional
  es?: string;       // español opcional
  cat?: string;      // categoría opcional
};

type RouteParams = {
  items?: VisualItem[];
  title?: string;
  totalRounds?: number;
  optionsPerRound?: number; // default 4
};

const PAD = 16; // padding lateral del contenedor

// ====== Datos de ejemplo (cámbialos por tus imágenes) ======
const SAMPLE_ITEMS: VisualItem[] = [
  {
    id: "ame",
    img: require("../../../assets/images/dictado/ame_lluvia.webp"),
    jp: "あめ",
    romaji: "ame",
    es: "lluvia",
    cat: "Clima",
  },
  {
    id: "kasa",
    img: require("../../../assets/images/dictado/kasa_paraguas.webp"),
    jp: "かさ",
    romaji: "kasa",
    es: "paraguas",
    cat: "Objetos",
  },
  {
    id: "inu",
    img: require("../../../assets/images/dictado/inu_perro.webp"),
    jp: "いぬ",
    romaji: "inu",
    es: "perro",
    cat: "Animales",
  },
  {
    id: "neko",
    img: require("../../../assets/images/dictado/neko_gato.webp"),
    jp: "ねこ",
    romaji: "neko",
    es: "gato",
    cat: "Animales",
  },
  {
    id: "mizu",
    img: require("../../../assets/images/dictado/mizu_agua.webp"),
    jp: "みず",
    romaji: "mizu",
    es: "agua",
    cat: "Bebidas/Comida",
  },
  {
    id: "yama",
    img: require("../../../assets/images/dictado/yama_montana.webp"),
    jp: "やま",
    romaji: "yama",
    es: "montaña",
    cat: "Naturaleza",
  },
];

// ====== Utilidades ======
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRound(
  bank: VisualItem[],
  optionsPerRound = 4
): { answer: VisualItem; choices: VisualItem[] } {
  const answer = bank[Math.floor(Math.random() * bank.length)];
  const pool = shuffle(bank.filter((x) => x.id !== answer.id)).slice(0, optionsPerRound - 1);
  return { answer, choices: shuffle([answer, ...pool]) };
}

function speakJP(text: string) {
  Speech.stop();
  // tasa y pitch suaves para claridad
  Speech.speak(text, { language: "ja-JP", rate: 0.92, pitch: 1.0 });
}

export default function ADictadoVisual({
  route,
}: {
  route?: { params?: RouteParams };
}) {
  const params = route?.params ?? {};
  const ITEMS = (params.items && params.items.length ? params.items : SAMPLE_ITEMS) as VisualItem[];
  const TOTAL_ROUNDS = params.totalRounds ?? 8;
  const OPTIONS_PER_ROUND = params.optionsPerRound ?? 4;

  // (Opcional) feedback de acierto/error
  // const { playCorrect, playWrong } = useFeedbackSounds?.() ?? {};

  // Estado
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [busy, setBusy] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [answer, setAnswer] = useState<VisualItem | null>(null);
  const [choices, setChoices] = useState<VisualItem[]>([]);

  const [ttsOn, setTtsOn] = useState(true);
  const [showHints, setShowHints] = useState(false); // muestra texto bajo cada imagen
  const [showRomaji, setShowRomaji] = useState(true);

  // animación sutil al responder
  const pulse = useRef(new Animated.Value(0)).current;
  const animatePulse = useCallback(() => {
    pulse.setValue(0);
    Animated.timing(pulse, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  // Precarga SOLO de imágenes (no hay MP3)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await Promise.all(ITEMS.map((it) => Asset.fromModule(it.img).downloadAsync()));
        if (mounted) {
          startFirstRound();
        }
      } catch (e) {
        console.warn("Error precargando imágenes", e);
        Alert.alert("Imágenes", "No se pudieron precargar algunas imágenes.");
        startFirstRound();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      // detener cualquier TTS al salir
      Speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startFirstRound = useCallback(() => {
    const { answer: ans, choices: ch } = pickRound(ITEMS, OPTIONS_PER_ROUND);
    setAnswer(ans);
    setChoices(ch);
    setRound(1);
    setScore(0);
    setLives(3);
    // pronunciar automáticamente
    setTimeout(() => {
      if (ttsOn) speakJP(ans.jp);
    }, 180);
  }, [ITEMS, OPTIONS_PER_ROUND, ttsOn]);

  const nextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) {
      setShowResult(true);
      return;
    }
    const { answer: ans, choices: ch } = pickRound(ITEMS, OPTIONS_PER_ROUND);
    setAnswer(ans);
    setChoices(ch);
    setRound((r) => r + 1);
    setTimeout(() => {
      if (ttsOn) speakJP(ans.jp);
    }, 160);
  }, [round, TOTAL_ROUNDS, ITEMS, OPTIONS_PER_ROUND, ttsOn]);

  const onReplay = useCallback(() => {
    if (answer && ttsOn && !busy) {
      speakJP(answer.jp);
    }
  }, [answer, ttsOn, busy]);

  const onSkip = useCallback(() => {
    if (busy) return;
    Vibration.vibrate(15);
    const newLives = Math.max(0, lives - 1);
    setLives(newLives);
    if (newLives <= 0) setShowResult(true);
    else nextRound();
  }, [busy, lives, nextRound]);

  const onPick = useCallback(
    (picked: VisualItem) => {
      if (!answer || busy) return;
      const correct = picked.id === answer.id;

      if (correct) {
        Vibration.vibrate(18);
        // playCorrect?.();
        setScore((s) => s + 100);
      } else {
        Vibration.vibrate([0, 40, 80, 40]);
        // playWrong?.();
        setLives((l) => Math.max(0, l - 1));
      }

      animatePulse();

      setTimeout(() => {
        if (!correct && lives - 1 <= 0) {
          setShowResult(true);
        } else {
          nextRound();
        }
      }, 420);
    },
    [answer, busy, lives, nextRound, animatePulse]
  );

  const resetGame = useCallback(() => {
    setShowResult(false);
    startFirstRound();
  }, [startFirstRound]);

  const progressPct = useMemo(() => Math.min(1, round / TOTAL_ROUNDS), [round, TOTAL_ROUNDS]);

  if (loading || !answer) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingTxt}>Cargando materiales…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Image
        source={require("../../../assets/images/home_backgroundbamboo.webp")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Encabezado */}
        <View style={styles.topbar}>
          <Text style={styles.title}>{params.title ?? "Dictado Visual (TTS)"}</Text>
        </View>

        {/* Estado */}
        <View style={styles.statusRow}>
          <Pill label={`Puntos: ${score}`} />
          <Pill label={`Vidas: ${"❤️".repeat(lives)}${"🤍".repeat(Math.max(0, 3 - lives))}`} />
          <Pill label={`Ronda: ${Math.min(round, TOTAL_ROUNDS)}/${TOTAL_ROUNDS}`} />
        </View>

        {/* Progreso */}
        <View style={styles.progressOuter}>
          <View style={[styles.progressInner, { width: `${progressPct * 100}%` }]} />
        </View>

        {/* Controles */}
        <View style={styles.controlsRow}>
          <Toggle label={`TTS ${ttsOn ? "ON" : "OFF"}`} value={ttsOn} onToggle={() => setTtsOn(v => !v)} />
          <Toggle label={`Pistas ${showHints ? "ON" : "OFF"}`} value={showHints} onToggle={() => setShowHints(v => !v)} />
          <Toggle label={`Romaji ${showRomaji ? "ON" : "OFF"}`} value={showRomaji} onToggle={() => setShowRomaji(v => !v)} />
        </View>

        {/* Tarjeta central */}
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text style={styles.cardTitle}>Escucha y toca la imagen correcta</Text>

          <View style={styles.actionsRow}>
            <Pressable onPress={onReplay} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
              <Text style={styles.actionBtnTxt}>🔊 Reproducir</Text>
            </Pressable>
            <Pressable onPress={onSkip} style={({ pressed }) => [styles.actionBtnAlt, pressed && styles.pressed]}>
              <Text style={styles.actionBtnTxt}>⏭️ Saltar (-1 vida)</Text>
            </Pressable>
          </View>

          {/* Grid opciones 2×2 */}
          <View style={styles.grid}>
            {choices.map((opt) => {
              const hint = showHints
                ? (showRomaji && opt.romaji) ? opt.romaji :
                  opt.es ? opt.es : opt.jp
                : "";
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => onPick(opt)}
                  style={({ pressed }) => [styles.choice, pressed && styles.pressed]}
                >
                  <Image source={opt.img} style={styles.choiceImg} resizeMode="contain" />
                  {showHints ? <Text style={styles.choiceTxt}>{hint}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Modal resultado */}
      <Modal visible={showResult} transparent animationType="fade" onRequestClose={() => setShowResult(false)}>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>¡Fin!</Text>
            <Text style={styles.modalDesc}>Puntuación: {score}</Text>
            <Text style={styles.modalDesc}>Rondas: {TOTAL_ROUNDS}</Text>

            <View style={styles.modalBtns}>
              <Pressable onPress={resetGame} style={({ pressed }) => [styles.modalBtn, pressed && styles.pressed]}>
                <Text style={styles.modalBtnTxt}>🔁 Jugar de nuevo</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ===== UI pequeñas ===== */
function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}><Text style={styles.pillTxt}>{label}</Text></View>
  );
}

function Toggle({
  label, value, onToggle,
}: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.knob, value && styles.knobOn]} />
      <Text style={styles.toggleLabel}>{label}</Text>
    </Pressable>
  );
}

/* ===== Estilos ===== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7f2e6" },
  scroll: { padding: 35, paddingBottom: 28 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingTxt: { marginTop: 12, fontSize: 16 },

  topbar: { height: 48, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  title: {
    fontSize: 18, fontWeight: "800",
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)",
  },

  statusRow: { flexDirection: "row", gap: 8, marginVertical: 8, flexWrap: "wrap" },
  pill: {
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1, borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 999,
  },
  pillTxt: { fontSize: 13, fontWeight: "700" },

  progressOuter: {
    height: 10, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.08)",
    overflow: "hidden", marginBottom: 12,
  },
  progressInner: { height: "100%", backgroundColor: "rgba(180,35,35,0.9)" },

  controlsRow: { flexDirection: "row", gap: 10, marginBottom: 8, flexWrap: "wrap" },
  toggle: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#EDE5D7", borderRadius: 999,
  },
  toggleOn: { backgroundColor: "#C79A3E" },
  knob: { width: 16, height: 16, borderRadius: 999, backgroundColor: "#C9BBA5" },
  knobOn: { backgroundColor: "#FFF" },
  toggleLabel: { fontSize: 12, color: "#3B2F2F", fontWeight: "700" },

  card: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    marginTop: 86, // ya estabas bajando toda la tarjeta
  },
  cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10, textAlign: "center" },

  // ⬇️ más espacio entre botones y la cuadrícula
  actionsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },

  actionBtn: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 10,
    borderRadius: 10, backgroundColor: "#c71f37",
  },
  actionBtnAlt: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 10,
    borderRadius: 10, backgroundColor: "#2b4a3e",
  },
  actionBtnTxt: { color: "#fff", fontWeight: "800" },
  pressed: { opacity: 0.75 },

  // === Cuadrícula 2×2 (dos arriba y dos abajo) ===
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // 2 por fila
    marginTop: 25, // ↑ antes 8
  },
  choice: {
    width: "48%",               // 2 columnas
    borderRadius: 14,
    padding: 10,
    backgroundColor: "#fffdf7",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    marginBottom: 12,           // separación entre filas
  },
  choiceImg: {
    width: "100%",
    aspectRatio: 1,             // cuadrada
    height: undefined,
  },
  choiceTxt: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  modalWrap: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center", padding: 20,
  },
  modalCard: {
    width: "100%", maxWidth: 420, borderRadius: 18, padding: 18,
    backgroundColor: "#fffdf7", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "900", marginBottom: 6 },
  modalDesc: { fontSize: 15, marginBottom: 4 },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 12 },
  modalBtn: {
    flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, backgroundColor: "#c71f37",
  },
  modalBtnTxt: { color: "#fff", fontWeight: "900" },
});
