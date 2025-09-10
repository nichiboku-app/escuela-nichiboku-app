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
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds"; // 👈 ruta desde /FamiliaS

type KanaS = "sa" | "shi" | "su" | "se" | "so";
type ExampleItem = {
  id: string;
  kana: KanaS;
  jp: string;
  romaji: string;
  es: string;
};

const ALL_EXAMPLES: ExampleItem[] = [
  // sa
  { id: "sa_sakana", kana: "sa", jp: "さかな", romaji: "sakana", es: "pez / pescado" },
  { id: "sa_sakura", kana: "sa", jp: "さくら", romaji: "sakura", es: "flor de cerezo" },
  { id: "sa_sake",   kana: "sa", jp: "さけ",   romaji: "sake",   es: "sake (bebida)" },
  { id: "sa_satou",  kana: "sa", jp: "さとう", romaji: "satou",  es: "azúcar" },

  // shi
  { id: "shi_shio",   kana: "shi", jp: "しお",   romaji: "shio",   es: "sal" },
  { id: "shi_shima",  kana: "shi", jp: "しま",   romaji: "shima",  es: "isla" },
  { id: "shi_shigoto",kana: "shi", jp: "しごと", romaji: "shigoto",es: "trabajo" },
  { id: "shi_shinbun",kana: "shi", jp: "しんぶん", romaji: "shinbun", es: "periódico" },

  // su
  { id: "su_sushi", kana: "su", jp: "すし",   romaji: "sushi", es: "sushi" },
  { id: "su_suika", kana: "su", jp: "すいか", romaji: "suika", es: "sandía" },
  { id: "su_suna",  kana: "su", jp: "すな",   romaji: "suna",  es: "arena" },
  { id: "su_suzu",  kana: "su", jp: "すず",   romaji: "suzu",  es: "campanita" },

  // se
  { id: "se_sensei", kana: "se", jp: "せんせい", romaji: "sensei", es: "maestro/a" },
  { id: "se_sekai",  kana: "se", jp: "せかい",   romaji: "sekai",  es: "mundo" },
  { id: "se_semi",   kana: "se", jp: "せみ",     romaji: "semi",   es: "cigarra" },
  { id: "se_seki",   kana: "se", jp: "せき",     romaji: "seki",   es: "asiento" },

  // so
  { id: "so_sora", kana: "so", jp: "そら",  romaji: "sora", es: "cielo" },
  { id: "so_soto", kana: "so", jp: "そと",  romaji: "soto", es: "afuera" },
  { id: "so_soba", kana: "so", jp: "そば",  romaji: "soba", es: "fideos soba" },
  { id: "so_sore", kana: "so", jp: "それ",  romaji: "sore", es: "eso" },
];

// ===== Utils =====
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sampleIncorrectOptions(pool: ExampleItem[], correct: ExampleItem, count = 3): ExampleItem[] {
  const others = pool.filter(x => x.id !== correct.id);
  return shuffle(others).slice(0, count);
}

const RED   = "#B32133";
const INK   = "#111827";
const PAPER = "#faf7f0";

export default function SEjemplosGrupoS() {
  const { playCorrect, playWrong, ready: sndReady } = useFeedbackSounds();

  const [filter, setFilter] = useState<KanaS | "all">("all");
  const [showRomaji, setShowRomaji] = useState(true);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const tapLockRef = useRef(false);

  const pool = useMemo(
    () => (filter === "all" ? ALL_EXAMPLES : ALL_EXAMPLES.filter(x => x.kana === filter)),
    [filter]
  );

  const [order, setOrder] = useState<string[]>([]);
  useEffect(() => {
    setOrder(shuffle(pool.map(x => x.id)));
    setRoundIndex(0);
    setScore(0);
    setSelected(null);
    setIsFinished(false);
    tapLockRef.current = false;
  }, [pool]);

  const current: ExampleItem | null = useMemo(() => {
    const id = order[roundIndex];
    return pool.find(x => x.id === id) ?? null;
  }, [order, roundIndex, pool]);

  const options = useMemo(() => {
    if (!current) return [];
    const incorrect = sampleIncorrectOptions(pool, current, Math.min(3, pool.length - 1));
    return shuffle([current, ...incorrect]).map(opt => ({
      id: opt.id,
      label: opt.es,
      correct: opt.id === current.id,
    }));
  }, [current, pool]);

  const onPick = useCallback(async (optId: string) => {
    if (!current) return;
    if (selected) return;
    if (tapLockRef.current) return;
    tapLockRef.current = true;

    setSelected(optId);
    const isCorrect = optId === current.id;

    if (isCorrect) {
      setScore(s => s + 1);
      Vibration.vibrate(12);
      if (sndReady) { playCorrect().catch(() => {}); }
    } else {
      Vibration.vibrate([0, 30, 40, 30]);
      if (sndReady) { playWrong().catch(() => {}); }
    }
  }, [current, selected, sndReady, playCorrect, playWrong]);

  useEffect(() => {
    if (selected == null) return;
    const t = setTimeout(() => { tapLockRef.current = false; }, 0);
    return () => clearTimeout(t);
  }, [selected]);

  const next = useCallback(() => {
    if (roundIndex + 1 >= order.length) {
      setIsFinished(true);
    } else {
      setRoundIndex(i => i + 1);
      setSelected(null);
    }
  }, [roundIndex, order.length]);

  const restart = useCallback(() => {
    setOrder(shuffle(pool.map(x => x.id)));
    setRoundIndex(0);
    setScore(0);
    setSelected(null);
    setIsFinished(false);
    tapLockRef.current = false;
  }, [pool]);

  const Chip = ({ label, value }: { label: string; value: KanaS | "all" }) => {
    const active = filter === value;
    return (
      <Pressable onPressIn={() => setFilter(value)} style={[styles.chip, active && styles.chipActive]}>
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      </Pressable>
    );
  };

  if (!current) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <View style={[styles.card, { alignItems: "center" }]} pointerEvents="none">
          <ActivityIndicator />
          <Text style={{ marginTop: 8, fontWeight: "700" }}>Preparando pregunta…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz de ejemplos — Grupo S</Text>
      <Text style={styles.subtitle}>
        Elige el significado correcto. {showRomaji ? "Romaji visible" : "Romaji oculto"}
      </Text>

      {/* Filtros */}
      <View style={styles.filters}>
        <Chip label="Todos" value="all" />
        <Chip label="sa" value="sa" />
        <Chip label="shi" value="shi" />
        <Chip label="su" value="su" />
        <Chip label="se" value="se" />
        <Chip label="so" value="so" />
      </View>

      {/* Toggles */}
      <View style={styles.toggles}>
        <Pressable onPressIn={() => setShowRomaji(v => !v)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>{showRomaji ? "Ocultar romaji" : "Mostrar romaji"}</Text>
        </Pressable>
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>Puntaje: {score}/{order.length || 0}</Text>
        </View>
      </View>

      {isFinished ? (
        <View style={styles.card}>
          <Text style={styles.doneTitle}>¡Completado!</Text>
          <Text style={styles.doneText}>
            Obtuviste <Text style={{ fontWeight: "900" }}>{score}</Text> de {order.length}.
          </Text>

          <Pressable onPressIn={restart} style={[styles.primaryBtn, { marginTop: 14 }]}>
            <Text style={styles.primaryBtnText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.progress}>
            Pregunta {Math.min(roundIndex + 1, order.length || 1)} / {order.length || 1}
          </Text>
          <View style={{ alignItems: "center", marginTop: 6 }}>
            <Text style={styles.jp}>{current.jp}</Text>
            {showRomaji && <Text style={styles.romaji}>{current.romaji}</Text>}
          </View>

          <FlatList
            data={options}
            keyExtractor={it => it.id}
            contentContainerStyle={{ gap: 10, paddingTop: 12 }}
            renderItem={({ item }) => {
              const hasPicked = selected != null;
              const isPicked = selected === item.id;
              const isRight = item.correct;
              const stateStyle =
                hasPicked && (isRight ? styles.optCorrect : isPicked ? styles.optWrong : styles.optIdleAfter);
              return (
                <Pressable
                  disabled={hasPicked}
                  onPressIn={() => onPick(item.id)}
                  hitSlop={12}
                  style={({ pressed }) => [
                    styles.opt,
                    pressed && !hasPicked && styles.optPressed,
                    stateStyle,
                  ]}
                >
                  <Text style={styles.optText}>{item.label}</Text>
                </Pressable>
              );
            }}
          />

          <Pressable
            onPressIn={next}
            disabled={selected == null}
            style={[
              styles.primaryBtn,
              { marginTop: 12, opacity: selected == null ? 0.5 : 1 },
            ]}
          >
            <Text style={styles.primaryBtnText}>
              {roundIndex + 1 >= order.length ? "Terminar" : "Siguiente"}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAPER, paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  subtitle: { textAlign: "center", fontSize: 12, color: "#555", marginTop: 6, marginBottom: 10 },

  filters: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#e5e7eb" },
  chipActive: { backgroundColor: INK },
  chipText: { color: INK, fontWeight: "700" },
  chipTextActive: { color: "#fff" },

  toggles: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 8 },
  toggleBtn: { backgroundColor: INK, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  toggleText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  scorePill: { backgroundColor: "#f3f4f6", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  scoreText: { fontWeight: "800", color: "#374151" },

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
    marginTop: 10,
  },

  progress: { fontSize: 12, color: "#6b7280", fontWeight: "700" },
  jp: { fontSize: 36, lineHeight: 44 },
  romaji: { fontSize: 14, color: "#666", marginTop: 2 },

  opt: { backgroundColor: "#111827", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  optText: { color: "#fff", textAlign: "center", fontWeight: "800" },
  optPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  optCorrect: { backgroundColor: "#059669" },
  optWrong: { backgroundColor: "#DC2626" },
  optIdleAfter: { backgroundColor: "#374151" },

  doneTitle: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  doneText: { textAlign: "center", marginTop: 6, color: "#374151" },

  primaryBtn: { backgroundColor: RED, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900" },
});
