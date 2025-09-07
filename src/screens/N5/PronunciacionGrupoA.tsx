import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
  phraseKey?: KanaKey;     // clave para buscar en LOCAL_PHRASE
  phraseUri?: string;      // opcional: remoto
};

const LOCAL_PHRASE: Partial<Record<KanaKey, number>> = {
  a: require("../../../assets/audio/n5/grupoA/a.mp3"),
  i: require("../../../assets/audio/n5/grupoA/i.mp3"),
  u: require("../../../assets/audio/n5/grupoA/u.mp3"),
  e: require("../../../assets/audio/n5/grupoA/e.mp3"),
  o: require("../../../assets/audio/n5/grupoA/o.mp3"),
};

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

const DATA: KanaItem[] = [
  { key: "a", hira: "あ", romaji: "a", example: { jp: "あめ", romaji: "ame", es: "lluvia" }, phraseKey: "a" },
  { key: "i", hira: "い", romaji: "i", example: { jp: "いぬ", romaji: "inu", es: "perro" }, phraseKey: "i" },
  { key: "u", hira: "う", romaji: "u", example: { jp: "うみ", romaji: "umi", es: "mar" }, phraseKey: "u" },
  { key: "e", hira: "え", romaji: "e", example: { jp: "えき", romaji: "eki", es: "estación" }, phraseKey: "e" },
  { key: "o", hira: "お", romaji: "o", example: { jp: "おちゃ", romaji: "ocha", es: "té" }, phraseKey: "o" },
];

export default function PronunciacionGrupoA() {
  // Precarga REAL
  const [ready, setReady] = useState(false);
  const soundsRef = useRef<Partial<Record<KanaKey, Audio.Sound>>>({});
  const currentRef = useRef<Audio.Sound | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensurePlaybackMode();
        for (const k of ["a", "i", "u", "e", "o"] as KanaKey[]) {
          const mod = LOCAL_PHRASE[k];
          if (!mod) continue;
          const asset = Asset.fromModule(mod);
          await asset.downloadAsync();
          const uri = asset.localUri || asset.uri;
          const sound = new Audio.Sound();
          await sound.loadAsync({ uri }, { shouldPlay: false, volume: 1.0 });
          soundsRef.current[k] = sound;
        }
        if (!cancelled) setReady(true);
      } catch (e) {
        console.warn("[PRELOAD] Pronunciación error", e);
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      const unloadAll = async () => {
        await Promise.all(
          (Object.values(soundsRef.current) as Audio.Sound[])
            .filter(Boolean)
            .map(async (s) => { try { await s.unloadAsync(); } catch {} })
        );
        soundsRef.current = {};
      };
      unloadAll();
      try { Speech.stop(); } catch {}
    };
  }, []);

  // TTS (respaldo normal)
  const [jaVoiceId, setJaVoiceId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const vs = await Speech.getAvailableVoicesAsync();
        const ja = vs.find(v => v.language?.toLowerCase().startsWith("ja"));
        setJaVoiceId(ja?.identifier ?? null);
      } catch {}
    })();
  }, []);
  const speak = useCallback(async (text: string) => {
    try {
      await ensurePlaybackMode();
      Speech.stop();
      Vibration.vibrate(6);
      Speech.speak(text, { language: "ja-JP", voice: jaVoiceId ?? undefined, rate: 1.0, pitch: 1.0 });
    } catch {}
  }, [jaVoiceId]);

  // Reproducir
  const stopCurrent = useCallback(async () => {
    const cur = currentRef.current;
    if (!cur) return;
    try { await cur.stopAsync(); } catch {}
    currentRef.current = null;
  }, []);

  const playFast = useCallback(async (item: KanaItem) => {
    const key = (item.phraseKey ?? item.key) as KanaKey;

    // remoto explícito
    if (item.phraseUri) {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        await ensurePlaybackMode();
        await stopCurrent();
        const { sound } = await Audio.Sound.createAsync(
          { uri: item.phraseUri },
          { shouldPlay: true, volume: 1.0 }
        );
        currentRef.current = sound;
        sound.setOnPlaybackStatusUpdate((st) => {
          if (st.isLoaded && st.didJustFinish) {
            try { sound.unloadAsync(); } catch {}
            if (currentRef.current === sound) currentRef.current = null;
          }
        });
      } finally {
        setTimeout(() => { busyRef.current = false; }, 120);
      }
      return;
    }

    // local precargado
    const s = soundsRef.current[key];
    if (s) {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        await ensurePlaybackMode();
        await stopCurrent();
        currentRef.current = s;
        await s.playFromPositionAsync(0);
      } finally {
        setTimeout(() => { busyRef.current = false; }, 120);
      }
      return;
    }

    // fallback TTS ("あ、あめ")
    const frase = `${item.hira}、${item.example.jp}`;
    return speak(frase);
  }, [speak, stopCurrent]);

  // Grabación (sin cambios funcionales)
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
      await stopCurrent();

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
  }, [stopCurrent]);

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
      await stopCurrent();
      const { sound } = await Audio.Sound.createAsync(
        { uri: playbackUri },
        { shouldPlay: true, isMuted: false, volume: 1.0 }
      );
      currentRef.current = sound;
      setIsPlayingBack(true);
      sound.setOnPlaybackStatusUpdate(async (st) => {
        if (!st.isLoaded) return;
        if (st.didJustFinish) {
          setIsPlayingBack(false);
          try { await sound.unloadAsync(); } catch {}
          if (currentRef.current === sound) currentRef.current = null;
        }
      });
    } catch (e) {
      setIsPlayingBack(false);
      console.warn("[PLAY] grabación error", e);
    }
  }, [playbackUri, isPlayingBack, stopCurrent]);

  // UI
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
          onPressIn={() => ready && playFast(item)}
          disabled={!ready}
          style={({ pressed }) => [styles.btn, (!ready || pressed) && styles.btnPressed]}
        >
          <Text style={styles.btnText}>{ready ? "▶️ Escuchar" : "Cargando…"}</Text>
        </Pressable>
      </View>
    </View>
  );

  const isDisabled = !playbackUri || isPlayingBack;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pronunciación — Grupo A</Text>
      <Text style={styles.subtitle}>
        Toca “Escuchar” para oír al instante.
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

      {!ready && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 8, fontWeight: "700" }}>Preparando audios…</Text>
            <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
              Solo la primera vez que abres esta pantalla.
            </Text>
          </View>
        </View>
      )}

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
  btn: { backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, minWidth: 140 },
  btnPressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
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

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  footerNote: { textAlign: "center", fontSize: 12, color: "#555", marginBottom: 12 },
});
