// src/screens/N5/HiraganaM/M_PracticaVoz.tsx
import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* =================== STT opcional (react-native-voice) =================== */
let Voice: any = null;
try {
  // Si no está instalado, este require fallará y seguimos sin STT.
  // @ts-ignore
  Voice = require("react-native-voice")?.default ?? require("react-native-voice");
} catch {}

/* =================== Tipos y datos =================== */
type KanaKey = "ma" | "mi" | "mu" | "me" | "mo";
type KanaItem = { key: KanaKey; char: string; romaji: string; audio: any };

const KANA_M: KanaItem[] = [
  { key: "ma", char: "ま", romaji: "ma", audio: require("../../../../assets/audio/hiragana/m/ma.mp3") },
  { key: "mi", char: "み", romaji: "mi", audio: require("../../../../assets/audio/hiragana/m/mi.mp3") },
  { key: "mu", char: "む", romaji: "mu", audio: require("../../../../assets/audio/hiragana/m/mu.mp3") },
  { key: "me", char: "め", romaji: "me", audio: require("../../../../assets/audio/hiragana/m/me.mp3") },
  { key: "mo", char: "も", romaji: "mo", audio: require("../../../../assets/audio/hiragana/m/mo.mp3") },
];

const onlyKana = (s: string) =>
  (s || "").replace(/\s+/g, "").replace(/[。、．，.]/g, "").toLowerCase();

// Hiragana → Katakana simple (para comparar si STT devuelve katakana)
const H2K: Record<string, string> = { ま: "マ", み: "ミ", む: "ム", め: "メ", も: "モ" };
const hiraToKata = (s: string) => s.split("").map((ch) => H2K[ch] ?? ch).join("");

/* =================== Player one-shot para las muestras =================== */
function useOneShot() {
  const ref = useRef<Audio.Sound | null>(null);

  const unload = useCallback(async () => {
    try {
      if (ref.current) {
        await ref.current.unloadAsync();
        ref.current.setOnPlaybackStatusUpdate(null);
        ref.current = null;
      }
    } catch {}
  }, []);

  const play = useCallback(
    async (source: any, { onEnd }: { onEnd?: () => void } = {}) => {
      await unload();
      try {
        const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
        ref.current = sound;
        sound.setOnPlaybackStatusUpdate((st) => {
          const s = st as AVPlaybackStatusSuccess;
          if (s.isLoaded && s.didJustFinish) onEnd?.();
        });
        await sound.playAsync();
      } catch (e) {
        console.warn("[oneShot] play error:", e);
      }
    },
    [unload]
  );

  useEffect(() => () => void unload(), [unload]);
  return { play };
}

/* =================== Pantalla =================== */
export default function M_PracticaVoz() {
  const [selected, setSelected] = useState<KanaItem>(KANA_M[0]);

  // reproducción de muestra
  const { play } = useOneShot();

  // grabación
  const recRef = useRef<Audio.Recording | null>(null);
  const [recURI, setRecURI] = useState<string | null>(null);
  const [recTimeMs, setRecTimeMs] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);

  // SFX de acierto/error
  const { playCorrect, playWrong } = useFeedbackSounds();

  // STT (si existe)
  const sttAvailable = !!Voice;
  const [recognized, setRecognized] = useState<string>("");
  const [matchResult, setMatchResult] = useState<"idle" | "ok" | "bad">("idle");

  /* -------- permisos y modo de audio -------- */
  useEffect(() => {
    (async () => {
      try {
        await Audio.requestPermissionsAsync(); // mic
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.warn("[audio] setAudioMode error:", e);
      }
    })();
  }, []);

  /* -------- STT handlers (opcional) -------- */
  useEffect(() => {
    if (!Voice) return;

    const onResults = (e: any) => setRecognized((e?.value?.[0] ?? "") as string);
    const onError = (e: any) => console.warn("[STT] error:", e);

    Voice.onSpeechResults = onResults;
    Voice.onSpeechError = onError;

    return () => {
      try {
        Voice.destroy?.();
        Voice.removeAllListeners?.();
      } catch {}
    };
  }, []);

  /* -------- reproducción de muestra -------- */
  const playSample = useCallback(async () => {
    await play(selected.audio);
  }, [play, selected]);

  /* -------- grabar -------- */
  const startRecording = useCallback(async () => {
    if (isRecording) return;

    setMatchResult("idle");
    setRecognized("");
    setRecURI(null);
    setRecTimeMs(0);

    // STT en vivo (opcional)
    if (sttAvailable) {
      try { await Voice.stop?.(); } catch {}
      try { await Voice.start?.("ja-JP"); } catch (e) { console.warn("[STT] start error:", e); }
    }

    const rec = new Audio.Recording();
    rec.setOnRecordingStatusUpdate((st) => {
      if (!st.canRecord) return;
      setRecTimeMs(st.durationMillis ?? 0);
    });

    try {
      // ✅ preset multiplataforma
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();

      recRef.current = rec;
      setIsRecording(true);
    } catch (e) {
      console.warn("[rec] start error:", e);
    }
  }, [isRecording, sttAvailable]);

  const stopRecording = useCallback(async () => {
    if (!isRecording || !recRef.current) return;
    try {
      await recRef.current.stopAndUnloadAsync();
      const uri = recRef.current.getURI();
      setRecURI(uri ?? null);
    } catch (e) {
      console.warn("[rec] stop error:", e);
    } finally {
      recRef.current = null;
      setIsRecording(false);
      if (sttAvailable) {
        try { await Voice.stop?.(); } catch {}
      }
    }
  }, [isRecording, sttAvailable]);

  /* -------- reproducir mi grabación -------- */
  const playRecording = useCallback(async () => {
    if (!recURI) return;
    setIsPlayingBack(true);
    let sound: Audio.Sound | null = null;
    try {
      const created = await Audio.Sound.createAsync({ uri: recURI }, { shouldPlay: true });
      sound = created.sound;
      sound.setOnPlaybackStatusUpdate((st) => {
        const s = st as AVPlaybackStatusSuccess;
        if (s.isLoaded && s.didJustFinish) {
          setIsPlayingBack(false);
          setTimeout(() => sound?.unloadAsync().catch(() => {}), 0);
        }
      });
    } catch (e) {
      console.warn("[rec] playback error:", e);
      setIsPlayingBack(false);
      try { await sound?.unloadAsync(); } catch {}
    }
  }, [recURI]);

  /* -------- evaluar (si hay STT) -------- */
  const evaluate = useCallback(async () => {
    if (!sttAvailable) return;

    const got = onlyKana(recognized);
    const expectedKana = onlyKana(selected.char);
    const expectedRomaji = onlyKana(selected.romaji);

    const ok =
      got === expectedKana ||
      got === hiraToKata(expectedKana) ||
      got === expectedRomaji;

    setMatchResult(ok ? "ok" : "bad");
    if (ok) await playCorrect();
    else await playWrong();
  }, [recognized, selected, sttAvailable, playCorrect, playWrong]);

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Práctica con voz — Grupo M (ま・み・む・め・も)</Text>
      <Text style={s.subtitle}>
        1) Escucha la muestra · 2) Di la sílaba · 3) Reproduce tu grabación · {sttAvailable ? "4) Evalúa (STT)" : "Opcional: instala STT"}
      </Text>

      {/* Selector */}
      <View style={s.selector}>
        {KANA_M.map((k) => {
          const active = selected.key === k.key;
          return (
            <Pressable
              key={k.key}
              onPress={() => { setSelected(k); setMatchResult("idle"); setRecognized(""); }}
              style={[s.selBtn, active && s.selBtnActive]}
            >
              <Text style={[s.selKana, active && s.selKanaActive]}>{k.char}</Text>
              <Text style={[s.selRomaji, active && s.selKanaActive]}>{k.romaji}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Controles */}
      <View style={s.row}>
        <Pressable style={[s.btn, s.btnDark]} onPress={playSample}>
          <Text style={s.btnText}>🔊 Muestra ({selected.char})</Text>
        </Pressable>

        {!isRecording ? (
          <Pressable style={[s.btn, s.btnGold]} onPress={startRecording}>
            <Text style={s.btnText}>● Grabar</Text>
          </Pressable>
        ) : (
          <Pressable style={[s.btn, s.btnStop]} onPress={stopRecording}>
            <Text style={s.btnText}>■ Detener</Text>
          </Pressable>
        )}

        <Pressable
          style={[s.btn, s.btnOutline]}
          onPress={playRecording}
          disabled={!recURI || isPlayingBack}
        >
          <Text style={[s.btnText, s.btnTextDark]}>
            {isPlayingBack ? "Reproduciendo…" : "▶︎ Mi grabación"}
          </Text>
        </Pressable>
      </View>

      {/* Evaluación (si hay STT) */}
      {sttAvailable && (
        <View style={s.evalRow}>
          <Pressable
            style={[s.btn, s.btnDark, { flex: 1 }]}
            onPress={evaluate}
            disabled={!recognized}
          >
            <Text style={s.btnText}>Evaluar</Text>
          </Pressable>
          <Text
            style={[
              s.badge,
              matchResult === "ok" && s.badgeOk,
              matchResult === "bad" && s.badgeBad,
            ]}
          >
            {matchResult === "idle"
              ? "—"
              : matchResult === "ok"
              ? "✅ Correcto"
              : "✖️ Intenta de nuevo"}
          </Text>
        </View>
      )}

      {/* Curiosidad de Japón */}
      <Text style={s.trivia}>
        Curiosidad: en Japón los trenes son tan puntuales que, si se retrasan,
        a veces entregan un certificado de tardanza para presentarlo en el trabajo o la escuela.
      </Text>
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

  selector: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  selBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: FRAME,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 74,
    backgroundColor: "#fff",
  },
  selBtnActive: { backgroundColor: "#111827" },
  selKana: { fontSize: 28, fontWeight: "900", color: BLACK, lineHeight: 28 },
  selKanaActive: { color: "#fff" },
  selRomaji: { fontSize: 12, color: "#6b7280", marginTop: 2, fontWeight: "800" },

  row: { flexDirection: "row", gap: 10, marginTop: 8, flexWrap: "wrap" },

  btn: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: FRAME,
  },
  btnDark: { backgroundColor: BLACK },
  btnGold: { backgroundColor: GOLD },
  btnStop: { backgroundColor: "#DC2626", borderColor: "#7F1D1D" },
  btnOutline: { backgroundColor: "#fff" },
  btnText: { color: "#fff", fontWeight: "900", letterSpacing: 0.3 },
  btnTextDark: { color: BLACK },

  evalRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: FRAME,
    backgroundColor: "#fff",
    fontWeight: "900",
    color: BLACK,
    minWidth: 130,
    textAlign: "center",
  },
  badgeOk: { backgroundColor: "#ecfdf5", borderColor: "#16a34a", color: "#065f46" },
  badgeBad: { backgroundColor: "#fef2f2", borderColor: "#dc2626", color: "#991b1b" },

  trivia: {
    marginTop: 14,
    color: "#4b5563",
    fontSize: 12.5,
    lineHeight: 18,
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
});
