import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    Vibration,
    View,
} from "react-native";

// ====== Tipos ======
type Kana = "a" | "i" | "u" | "e" | "o";
type ExampleItem = {
  id: string;
  kana: Kana;
  jp: string;
  romaji: string;
  es: string;
  audioKey?: string;   // clave para LOCAL_WORD_RES
  audioUri?: string;   // alternativo: URL remota (no usada aquí)
};

// ====== Datos ======
const ALL_EXAMPLES: ExampleItem[] = [
  // a
  { id: "a_ame", kana: "a", jp: "あめ", romaji: "ame", es: "lluvia", audioKey: "a_ame" },
  { id: "a_asa", kana: "a", jp: "あさ", romaji: "asa", es: "mañana", audioKey: "a_asa" },
  { id: "a_ai",  kana: "a", jp: "あい", romaji: "ai",  es: "amor",   audioKey: "a_ai"  },
  // i
  { id: "i_inu", kana: "i", jp: "いぬ", romaji: "inu", es: "perro", audioKey: "i_inu" },
  { id: "i_ie",  kana: "i", jp: "いえ", romaji: "ie",  es: "casa",  audioKey: "i_ie"  },
  { id: "i_isu", kana: "i", jp: "いす", romaji: "isu", es: "silla", audioKey: "i_isu" },
  // u
  { id: "u_umi", kana: "u", jp: "うみ", romaji: "umi", es: "mar",   audioKey: "u_umi" },
  { id: "u_ushi",kana: "u", jp: "うし", romaji: "ushi",es: "vaca",  audioKey: "u_ushi" },
  { id: "u_uta", kana: "u", jp: "うた", romaji: "uta", es: "canción", audioKey: "u_uta" },
  // e
  { id: "e_eki", kana: "e", jp: "えき", romaji: "eki", es: "estación", audioKey: "e_eki" },
  { id: "e_enpitsu", kana: "e", jp: "えんぴつ", romaji: "enpitsu", es: "lápiz", audioKey: "e_enpitsu" },
  { id: "e_e",   kana: "e", jp: "え",   romaji: "e",   es: "dibujo", audioKey: "e_e" },
  // o
  { id: "o_ocha", kana: "o", jp: "おちゃ", romaji: "ocha", es: "té", audioKey: "o_ocha" },
  { id: "o_onigiri", kana: "o", jp: "おにぎり", romaji: "onigiri", es: "bolita de arroz", audioKey: "o_onigiri" },
  { id: "o_okane", kana: "o", jp: "おかね", romaji: "okane", es: "dinero", audioKey: "o_okane" },
];

// ====== MP3 locales (require estático) ======
const LOCAL_WORD_RES: Record<string, number> = {
  a_ame: require("../../../assets/audio/n5/grupoA/examples/a_ame.mp3"),
  a_asa: require("../../../assets/audio/n5/grupoA/examples/a_asa.mp3"),
  a_ai: require("../../../assets/audio/n5/grupoA/examples/a_ai.mp3"),
  i_inu: require("../../../assets/audio/n5/grupoA/examples/i_inu.mp3"),
  i_ie: require("../../../assets/audio/n5/grupoA/examples/i_ie.mp3"),
  i_isu: require("../../../assets/audio/n5/grupoA/examples/i_isu.mp3"),
  u_umi: require("../../../assets/audio/n5/grupoA/examples/u_umi.mp3"),
  u_ushi: require("../../../assets/audio/n5/grupoA/examples/u_ushi.mp3"),
  u_uta: require("../../../assets/audio/n5/grupoA/examples/u_uta.mp3"),
  e_eki: require("../../../assets/audio/n5/grupoA/examples/e_eki.mp3"),
  e_enpitsu: require("../../../assets/audio/n5/grupoA/examples/e_enpitsu.mp3"),
  e_e: require("../../../assets/audio/n5/grupoA/examples/e_e.mp3"),
  o_ocha: require("../../../assets/audio/n5/grupoA/examples/o_ocha.mp3"),
  o_onigiri: require("../../../assets/audio/n5/grupoA/examples/o_onigiri.mp3"),
  o_okane: require("../../../assets/audio/n5/grupoA/examples/o_okane.mp3"),
};

// ====== Audio mode helper ======
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

export default function EjemplosGrupoA() {
  const [filter, setFilter] = useState<Kana | "all">("all");
  const [showRomaji, setShowRomaji] = useState(true);
  const [showES, setShowES] = useState(true);

  const data = useMemo(
    () => (filter === "all" ? ALL_EXAMPLES : ALL_EXAMPLES.filter(x => x.kana === filter)),
    [filter]
  );

  // ====== Precarga REAL: crear Audio.Sound por cada ejemplo ======
  const [ready, setReady] = useState(false);
  const soundsRef = useRef<Record<string, Audio.Sound>>({});
  const currentRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensurePlaybackMode();
        // Secuencial para evitar picos de IO
        for (const [key, mod] of Object.entries(LOCAL_WORD_RES)) {
          const asset = Asset.fromModule(mod);
          await asset.downloadAsync();
          const uri = asset.localUri || asset.uri;
          const sound = new Audio.Sound();
          await sound.loadAsync({ uri }, { shouldPlay: false, volume: 1.0 });
          soundsRef.current[key] = sound;
        }
        if (!cancelled) setReady(true);
        console.log("[PRELOAD] Ejemplos cargados:", Object.keys(soundsRef.current).length);
      } catch (e) {
        console.warn("[PRELOAD] error", e);
        if (!cancelled) setReady(true); // dejamos pasar (habrá fallback TTS)
      }
    })();

    return () => {
      cancelled = true;
      // Descargar memoria al salir
      const unloadAll = async () => {
        await Promise.all(
          Object.values(soundsRef.current).map(async (s) => {
            try { await s.unloadAsync(); } catch {}
          })
        );
        soundsRef.current = {};
      };
      unloadAll();
    };
  }, []);

  // ====== TTS (fallback) ======
  const [jaVoiceId, setJaVoiceId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const ja = voices.find(v => v.language?.toLowerCase().startsWith("ja"));
        setJaVoiceId(ja?.identifier ?? null);
      } catch {}
    })();
  }, []);
  const speak = useCallback(async (text: string, slow = false) => {
    try {
      await ensurePlaybackMode();
      Speech.stop();
      Vibration.vibrate(6);
      Speech.speak(text, {
        language: "ja-JP",
        voice: jaVoiceId ?? undefined,
        rate: slow ? 0.7 : 1.0,
        pitch: 1.0,
      });
    } catch {}
  }, [jaVoiceId]);

  // ====== Reproducir (instantáneo) ======
  const stopCurrent = useCallback(async () => {
    const cur = currentRef.current;
    if (!cur) return;
    try { await cur.stopAsync(); } catch {}
    currentRef.current = null;
  }, []);

  const playExample = useCallback(async (item: ExampleItem, slow = false) => {
    // 1) si hay sound precargado, resetea y reproduce
    if (item.audioKey) {
      const s = soundsRef.current[item.audioKey];
      if (s) {
        await stopCurrent();
        currentRef.current = s;
        await s.setIsMutedAsync(false);
        await s.setVolumeAsync(1.0);
        await s.setPositionAsync(0);
        await s.playAsync();
        return;
      }
    }
    // 2) fallback TTS
    return speak(item.jp, slow);
  }, [speak, stopCurrent]);

  // UI
  const Chip = ({ label, value }: { label: string; value: Kana | "all" }) => {
    const active = filter === value;
    return (
      <Pressable onPress={() => setFilter(value)} style={[styles.chip, active && styles.chipActive]}>
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      </Pressable>
    );
  };

  const renderItem = ({ item }: { item: ExampleItem }) => (
    <View style={styles.card}>
      <View style={{ alignItems: "center" }}>
        <Text style={styles.jp}>{item.jp}</Text>
        {showRomaji && <Text style={styles.romaji}>{item.romaji}</Text>}
        {showES && <Text style={styles.es}>{item.es}</Text>}
      </View>

      <View style={styles.row}>
        <Pressable
          onPress={() => playExample(item, false)}
          onLongPress={() => playExample(item, true)}
          disabled={!ready}
          style={({ pressed }) => [
            styles.btn,
            (!ready || pressed) && styles.btnPressed,
          ]}
        >
          <Text style={styles.btnText}>
            {ready ? "▶️ Escuchar\n(mantén: lento)" : "Cargando audio…"}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejemplos — Grupo A</Text>
      <Text style={styles.subtitle}>
        Toca para escuchar cada palabra (mantén para lento). Puedes ocultar/mostrar romaji y traducción.
      </Text>

      {/* Filtros */}
      <View style={styles.filters}>
        <Chip label="Todos" value="all" />
        <Chip label="a" value="a" />
        <Chip label="i" value="i" />
        <Chip label="u" value="u" />
        <Chip label="e" value="e" />
        <Chip label="o" value="o" />
      </View>

      {/* Toggles */}
      <View style={styles.toggles}>
        <Pressable onPress={() => setShowRomaji(v => !v)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>{showRomaji ? "Ocultar romaji" : "Mostrar romaji"}</Text>
        </Pressable>
        <Pressable onPress={() => setShowES(v => !v)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>{showES ? "Ocultar español" : "Mostrar español"}</Text>
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Overlay de carga */}
      {!ready && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 8, fontWeight: "700" }}>Preparando audios…</Text>
            <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
              Esto se hace una sola vez por pantalla.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ====== Estilos ======
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#faf7f0", paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  subtitle: { textAlign: "center", fontSize: 12, color: "#555", marginTop: 6, marginBottom: 10 },

  filters: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#e5e7eb" },
  chipActive: { backgroundColor: "#111827" },
  chipText: { color: "#111827", fontWeight: "700" },
  chipTextActive: { color: "#fff" },

  toggles: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 8 },
  toggleBtn: { backgroundColor: "#111827", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  toggleText: { color: "#fff", fontWeight: "700", fontSize: 12 },

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

  jp: { fontSize: 32, lineHeight: 40 },
  romaji: { fontSize: 14, color: "#666", marginTop: 2 },
  es: { fontSize: 13, color: "#333", marginTop: 2 },

  row: { flexDirection: "row", justifyContent: "center", columnGap: 10, marginTop: 12 },
  btn: { backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, minWidth: 160 },
  btnPressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },

  // Overlay de carga
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
});
