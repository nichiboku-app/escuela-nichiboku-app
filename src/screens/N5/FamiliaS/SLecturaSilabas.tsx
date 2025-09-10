import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

/* ===== Tipos ===== */
type KanaKeySZ =
  | "sa" | "shi" | "su" | "se" | "so"
  | "za" | "ji"  | "zu" | "ze" | "zo";

type ItemSZ = {
  key: KanaKeySZ;
  hira: string;
  romaji: string;
  example: { jp: string; romaji: string; es: string };
  audioKey: KanaKeySZ; // clave para buscar mp3 local
};

/* ===== MP3 locales (ya generados con gTTS) ===== */
// Grupo S
const LOCAL_S: Partial<Record<Extract<KanaKeySZ,
  "sa" | "shi" | "su" | "se" | "so"
>, number>> = {
  sa:  require("../../../../assets/audio/n5/grupoS/sa.mp3"),
  shi: require("../../../../assets/audio/n5/grupoS/shi.mp3"),
  su:  require("../../../../assets/audio/n5/grupoS/su.mp3"),
  se:  require("../../../../assets/audio/n5/grupoS/se.mp3"),
  so:  require("../../../../assets/audio/n5/grupoS/so.mp3"),
};
// Grupo Z
const LOCAL_Z: Partial<Record<Extract<KanaKeySZ,
  "za" | "ji" | "zu" | "ze" | "zo"
>, number>> = {
  za:  require("../../../../assets/audio/n5/grupoZ/za.mp3"),
  ji:  require("../../../../assets/audio/n5/grupoZ/ji.mp3"),
  zu:  require("../../../../assets/audio/n5/grupoZ/zu.mp3"),
  ze:  require("../../../../assets/audio/n5/grupoZ/ze.mp3"),
  zo:  require("../../../../assets/audio/n5/grupoZ/zo.mp3"),
};

const LOCAL_ALL: Partial<Record<KanaKeySZ, number>> = { ...LOCAL_S, ...LOCAL_Z };

/* ===== Datos (S y Z) ===== */
const DATA: ItemSZ[] = [
  { key: "sa",  hira: "さ", romaji: "sa",  example: { jp: "さかな", romaji: "sakana", es: "pez" },      audioKey: "sa" },
  { key: "shi", hira: "し", romaji: "shi", example: { jp: "しま",   romaji: "shima",  es: "isla" },    audioKey: "shi" },
  { key: "su",  hira: "す", romaji: "su",  example: { jp: "すし",   romaji: "sushi",  es: "sushi" },   audioKey: "su" },
  { key: "se",  hira: "せ", romaji: "se",  example: { jp: "せんせい", romaji: "sensei", es: "maestro" }, audioKey: "se" },
  { key: "so",  hira: "そ", romaji: "so",  example: { jp: "そら",   romaji: "sora",   es: "cielo" },   audioKey: "so" },

  { key: "za",  hira: "ざ", romaji: "za",  example: { jp: "ざる",   romaji: "zaru",   es: "cesta" },   audioKey: "za" },
  { key: "ji",  hira: "じ", romaji: "ji",  example: { jp: "じしょ", romaji: "jisho",  es: "diccionario" }, audioKey: "ji" },
  { key: "zu",  hira: "ず", romaji: "zu",  example: { jp: "ずぼん", romaji: "zubon",  es: "pantalón" }, audioKey: "zu" },
  { key: "ze",  hira: "ぜ", romaji: "ze",  example: { jp: "ぜんぶ", romaji: "zenbu",  es: "todo" },    audioKey: "ze" },
  { key: "zo",  hira: "ぞ", romaji: "zo",  example: { jp: "ぞう",   romaji: "zou",    es: "elefante" }, audioKey: "zo" },
];

/* ===== Utiles de audio ===== */
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

export default function SLecturaSilabas() {
  const [ready, setReady] = useState(false);
  const [jaVoiceId, setJaVoiceId] = useState<string | null>(null);

  const soundsRef = useRef<Partial<Record<KanaKeySZ, Audio.Sound>>>({});
  const currentRef = useRef<Audio.Sound | null>(null);
  const busyRef = useRef(false);

  /* Precarga de MP3 locales */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensurePlaybackMode();

        // precargar voces TTS disponibles (opcional)
        try {
          const vs = await Speech.getAvailableVoicesAsync();
          const ja = vs.find(v => v.language?.toLowerCase().startsWith("ja"));
          setJaVoiceId(ja?.identifier ?? null);
        } catch {}

        // precarga real de audios
        for (const it of DATA) {
          const mod = LOCAL_ALL[it.audioKey];
          if (!mod) continue;
          const asset = Asset.fromModule(mod);
          await asset.downloadAsync();
          const uri = asset.localUri || asset.uri;

          const s = new Audio.Sound();
          await s.loadAsync({ uri }, { shouldPlay: false, volume: 1.0 });
          soundsRef.current[it.audioKey] = s;
        }

        if (!cancelled) setReady(true);
      } catch (e) {
        console.warn("[SLecturaSilabas] preload error:", e);
        if (!cancelled) setReady(true); // dejamos usar TTS fallback
      }
    })();

    return () => {
      cancelled = true;
      (async () => {
        // limpiar sonidos
        const all = Object.values(soundsRef.current).filter(Boolean) as Audio.Sound[];
        try {
          for (const s of all) { try { await s.unloadAsync(); } catch {} }
        } finally {
          soundsRef.current = {};
        }
        try { Speech.stop(); } catch {}
      })();
    };
  }, []);

  const stopCurrent = useCallback(async () => {
    const cur = currentRef.current;
    if (!cur) return;
    try { await cur.stopAsync(); } catch {}
    currentRef.current = null;
  }, []);

  /* Reproducir: sílaba sola (TTS) */
  const speakKana = useCallback(async (text: string) => {
    try {
      await ensurePlaybackMode();
      Vibration.vibrate(6);
      Speech.stop();
      Speech.speak(text, { language: "ja-JP", voice: jaVoiceId ?? undefined, rate: 1.0, pitch: 1.0 });
    } catch {}
  }, [jaVoiceId]);

  /* Reproducir: ejemplo completo (MP3 si existe; si no, TTS fallback) */
  const playExample = useCallback(async (item: ItemSZ) => {
    const s = soundsRef.current[item.audioKey];

    if (s) {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        await ensurePlaybackMode();
        await stopCurrent();
        currentRef.current = s;
        await s.playFromPositionAsync(0);
      } finally {
        setTimeout(() => { busyRef.current = false; }, 140);
      }
      return;
    }

    // Fallback TTS: "さ。さかな。"
    const frase = `${item.hira}。${item.example.jp}。`;
    return speakKana(frase);
  }, [speakKana, stopCurrent]);

  /* UI */
  const renderItem = ({ item }: { item: ItemSZ }) => (
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
          onPressIn={() => speakKana(item.hira)}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnText}>▶︎ Sílaba</Text>
        </Pressable>

        <Pressable
          onPressIn={() => ready && playExample(item)}
          disabled={!ready}
          style={({ pressed }) => [
            styles.btnDark,
            (!ready || pressed) && styles.btnPressed,
          ]}
        >
          <Text style={styles.btnText}>
            {ready ? "▶︎ Ejemplo completo" : "Cargando…"}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lectura de sílabas — Familias S / Z</Text>
      <Text style={styles.subtitle}>
        Toca “Sílaba” para oír solo el sonido, o “Ejemplo completo” para escuchar la frase.
      </Text>

      <FlatList
        data={DATA}
        keyExtractor={(it) => it.key}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

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
        Tip: repite en voz alta, primero despacio (“さ… さかな”), luego continuo (“さ。さかな。”).
      </Text>
    </View>
  );
}

/* ===== Estilos ===== */
const INK = "#111827";
const PAPER = "#faf7f0";
const RED = "#B32133";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAPER, paddingHorizontal: 16, paddingTop: 12 },
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
  btn: { backgroundColor: RED, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, minWidth: 120 },
  btnDark: { backgroundColor: INK, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, minWidth: 160 },
  btnPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },

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
