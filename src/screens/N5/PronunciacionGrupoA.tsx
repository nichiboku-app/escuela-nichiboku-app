// src/screens/N5/PronunciacionGrupoA.tsx
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

type KanaKey = "a" | "i" | "u" | "e" | "o";

type KanaItem = {
  key: KanaKey;
  hira: string;
  romaji: string;
  example: { jp: string; romaji: string; es: string };
  // MP3 locales (clave para buscar en LOCAL_PHRASE/LOCAL_PHRASE_SLOW)
  phraseKey?: KanaKey;
  // MP3 remotos (si prefieres Firebase/URLs)
  phraseUri?: string;
  phraseSlowUri?: string;
};

// ---------- Mapea claves -> require() estático de MP3 locales ----------
// Asegúrate de que estos archivos EXISTEN o comentarlos para evitar errores en build.
const LOCAL_PHRASE: Partial<Record<KanaKey, number>> = {
  a: require("../../../assets/audio/n5/grupoA/a.mp3"),
  i: require("../../../assets/audio/n5/grupoA/i.mp3"),
  u: require("../../../assets/audio/n5/grupoA/u.mp3"),
  e: require("../../../assets/audio/n5/grupoA/e.mp3"),
  o: require("../../../assets/audio/n5/grupoA/o.mp3"),
};

// Opcional: versiones lentas si las grabas
const LOCAL_PHRASE_SLOW: Partial<Record<KanaKey, number>> = {
  // a: require("../../../assets/audio/n5/grupoA/a_phrase_slow.mp3"),
  // i: require("../../../assets/audio/n5/grupoA/i_phrase_slow.mp3"),
  // u: require("../../../assets/audio/n5/grupoA/u_phrase_slow.mp3"),
  // e: require("../../../assets/audio/n5/grupoA/e_phrase_slow.mp3"),
  // o: require("../../../assets/audio/n5/grupoA/o_phrase_slow.mp3"),
};

const DATA: KanaItem[] = [
  { key: "a", hira: "あ", romaji: "a", example: { jp: "あめ", romaji: "ame", es: "lluvia" }, phraseKey: "a" },
  { key: "i", hira: "い", romaji: "i", example: { jp: "いぬ", romaji: "inu", es: "perro" }, phraseKey: "i" },
  { key: "u", hira: "う", romaji: "u", example: { jp: "うみ", romaji: "umi", es: "mar" }, phraseKey: "u" },
  { key: "e", hira: "え", romaji: "e", example: { jp: "えき", romaji: "eki", es: "estación" }, phraseKey: "e" },
  { key: "o", hira: "お", romaji: "o", example: { jp: "おちゃ", romaji: "ocha", es: "té" }, phraseKey: "o" },
];

// ---- Modo audio (compatible con SDKs recientes) ----
async function ensurePlaybackMode() {
  await Audio.setIsEnabledAsync(true);
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}
async function ensureRecordMode() {
  await Audio.setIsEnabledAsync(true);
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

export default function PronunciacionGrupoA() {
  // ====== audio global ======
  useEffect(() => {
    ensurePlaybackMode().catch(() => {});
    return () => { try { Speech.stop(); } catch {} };
  }, []);

  // ====== TTS (respaldo si no hay MP3) ======
  const [jaVoiceId, setJaVoiceId] = useState<string | null>(null);
  useEffect(() => {
    Speech.getAvailableVoicesAsync()
      .then(vs => setJaVoiceId(vs.find(v => v.language?.toLowerCase().startsWith("ja"))?.identifier ?? null))
      .catch(() => {});
  }, []);

  const speak = useCallback(async (text: string, slow = false) => {
    try {
      await ensurePlaybackMode();
      Speech.stop();
      Vibration.vibrate(6);
      Speech.speak(text, {
        language: "ja-JP",
        voice: jaVoiceId ?? undefined,
        pitch: 1.0,
        rate: slow ? 0.7 : 1.0,
      });
    } catch {}
  }, [jaVoiceId]);

  // ====== Reproductor MP3 (controla una sola instancia) ======
  const soundRef = useRef<Audio.Sound | null>(null);

  const stopAndUnload = useCallback(async () => {
    const s = soundRef.current;
    if (!s) return;
    try {
      await s.stopAsync();
    } catch {}
    try {
      await s.unloadAsync();
    } catch {}
    soundRef.current = null;
  }, []);

  const playSource = useCallback(async (source: number | { uri: string }) => {
    await ensurePlaybackMode();
    await stopAndUnload();
    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      isMuted: false,
      volume: 1.0,
    });
    soundRef.current = sound;
    sound.setOnPlaybackStatusUpdate((st) => {
      if (st.isLoaded && st.didJustFinish) {
        stopAndUnload();
      }
    });
  }, [stopAndUnload]);

  // ====== Lógica de reproducción por item ======
  const playKana = useCallback(async (item: KanaItem, slow = false) => {
    // 1) MP3 remoto explícito
    if (slow && item.phraseSlowUri) {
      return playSource({ uri: item.phraseSlowUri });
    }
    if (!slow && item.phraseUri) {
      return playSource({ uri: item.phraseUri });
    }

    // 2) MP3 local por clave
    const key = item.phraseKey ?? item.key;
    const srcLocal = slow ? LOCAL_PHRASE_SLOW[key] : LOCAL_PHRASE[key];
    if (srcLocal) {
      return playSource(srcLocal);
    }

    // 3) Respaldo TTS
    const frase = `${item.hira}、${item.example.jp}`;
    return speak(frase, slow);
  }, [playSource, speak]);

  // ====== Grabación (práctica) ======
  const recordingRef = useRef<Audio.Recording | null>(null);
  const startingRef = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playbackUri, setPlaybackUri] = useState<string | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);

  const startRecording = useCallback(async () => {
    if (startingRef.current || recordingRef.current) return;
    try {
      startingRef.current = true;
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permiso requerido", "Activa el micrófono para grabar tu voz.");
        return;
      }
      await ensureRecordMode();
      await stopAndUnload(); // asegúrate de no estar reproduciendo nada

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();

      recordingRef.current = rec;
      setIsRecording(true);
      setPlaybackUri(null);
      Vibration.vibrate(10);
    } catch (e) {
      console.warn("[REC] start error", e);
    } finally {
      startingRef.current = false;
    }
  }, [stopAndUnload]);

  const stopRecording = useCallback(async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI() || null;
      setPlaybackUri(uri);
    } catch (e) {
      console.warn("[REC] stop error", e);
    } finally {
      recordingRef.current = null;
      setIsRecording(false);
      await ensurePlaybackMode();
      Vibration.vibrate(10);
    }
  }, []);

  const playRecording = useCallback(async () => {
    if (!playbackUri || isPlayingBack) return;
    try {
      await ensurePlaybackMode();
      await stopAndUnload();
      const { sound } = await Audio.Sound.createAsync(
        { uri: playbackUri },
        { shouldPlay: true, isMuted: false, volume: 1.0 }
      );
      soundRef.current = sound;
      setIsPlayingBack(true);
      sound.setOnPlaybackStatusUpdate(async (st) => {
        if (!st.isLoaded) return;
        if (st.didJustFinish) {
          setIsPlayingBack(false);
          await stopAndUnload();
        }
      });
    } catch (e) {
      setIsPlayingBack(false);
      console.warn("[PLAY] error", e);
    }
  }, [playbackUri, isPlayingBack, stopAndUnload]);

  // ====== UI ======
  const renderItem = ({ item }: { item: KanaItem }) => (
    <View style={styles.card}>
      <Text style={styles.kana}>{item.hira}</Text>
      <Text style={styles.romaji}>{item.romaji}</Text>

      <View style={styles.examples}>
        <Text style={styles.exampleJP}>{item.example.jp}</Text>
        <Text style={styles.exampleRomaji}>
          {item.example.romaji} — {item.example.es}
        </Text>
      </View>

      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={() => playKana(item, false)}
          onLongPress={() => playKana(item, true)}
        >
          <Text style={styles.btnText}>Reproducir{"\n"}(mantén para Lento)</Text>
        </Pressable>
      </View>
    </View>
  );

  const isDisabled = !playbackUri || isPlayingBack;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pronunciación — Grupo A</Text>
      <Text style={styles.subtitle}>
        Toca “Reproducir” para escuchar el sonido y un ejemplo. Mantén presionado para oírlo lento.
      </Text>

      <FlatList
        data={DATA}
        keyExtractor={(it) => it.key}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <View style={styles.practiceBox}>
        <Text style={styles.practiceTitle}>Práctica rápida</Text>
        <Text style={styles.practiceHint}>
          Mantén presionado “Grabar” y di el sonido (por ejemplo “あ” o “あめ”).
        </Text>

        <View style={styles.row}>
          <Pressable
            onPressIn={startRecording}
            onPressOut={stopRecording}
            style={({ pressed }) => [
              styles.recBtn,
              isRecording && styles.recActive,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.recText}>
              {isRecording ? "Grabando…" : "🎙️ Mantén para Grabar"}
            </Text>
          </Pressable>

          <Pressable
            disabled={isDisabled}
            onPress={playRecording}
            style={[styles.playbackBtn, isDisabled && { opacity: 0.6 }]}
          >
            <Text style={styles.playbackText}>
              {isPlayingBack ? "Reproduciendo…" : "▶️ Escuchar mi grabación"}
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.footerNote}>
        Tip: practica con ritmo “a-i-u-e-o”, abriendo bien en “a” y cerrando en “u”.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#faf7f0", paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginTop: 4 },
  subtitle: { textAlign: "center", fontSize: 13, color: "#444", marginTop: 6, marginBottom: 10 },
  listContent: { paddingBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  kana: { fontSize: 56, textAlign: "center", lineHeight: 64 },
  romaji: { fontSize: 16, textAlign: "center", color: "#666", marginTop: 4 },
  examples: { marginTop: 10, alignItems: "center" },
  exampleJP: { fontSize: 20, lineHeight: 26 },
  exampleRomaji: { fontSize: 13, color: "#666", marginTop: 2 },
  row: { flexDirection: "row", justifyContent: "center", columnGap: 10, marginTop: 12 },
  btn: { backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, minWidth: 160 },
  btnPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  practiceBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  practiceTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  practiceHint: { fontSize: 12, color: "#666", textAlign: "center" },
  recBtn: { backgroundColor: "#b91c1c", flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  recActive: { backgroundColor: "#ef4444" },
  recText: { color: "#fff", fontWeight: "700" },
  playbackBtn: { backgroundColor: "#111827", flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  playbackText: { color: "#fff", fontWeight: "700" },
  footerNote: { textAlign: "center", fontSize: 12, color: "#555", marginBottom: 12 },
});
