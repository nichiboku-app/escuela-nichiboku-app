import { NotoSansJP_700Bold, useFonts } from "@expo-google-fonts/noto-sans-jp";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import type { RootStackParamList } from "../../../types";

/* ===== Tipos / Nav ===== */
type Nav = NativeStackNavigationProp<RootStackParamList>;
type KanaRow = "k" | "g";

type VocabItem = {
  id: string;
  jp: string;
  reading?: string;
  romaji: string;
  es: string;
  note?: string;
  kanaRow: KanaRow;
};

/* ===== Dataset (K/G) ===== */
const DATA: VocabItem[] = [
  // K row
  { id: "1", jp: "かさ", romaji: "kasa", es: "paraguas", kanaRow: "k" },
  { id: "2", jp: "かぎ", romaji: "kagi", es: "llave", kanaRow: "k" },
  { id: "3", jp: "き", romaji: "ki", es: "árbol", note: "木 (kanji)", kanaRow: "k" },
  { id: "4", jp: "くち", romaji: "kuchi", es: "boca", kanaRow: "k" },
  { id: "5", jp: "くるま", romaji: "kuruma", es: "auto", note: "車 (kanji)", kanaRow: "k" },
  { id: "6", jp: "けいさつ", romaji: "keisatsu", es: "policía", kanaRow: "k" },
  { id: "7", jp: "こども", romaji: "kodomo", es: "niño/niña", kanaRow: "k" },
  { id: "8", jp: "ことば", romaji: "kotoba", es: "palabra/idioma", kanaRow: "k" },
  // G row
  { id: "9",  jp: "がくせい", romaji: "gakusei", es: "estudiante", kanaRow: "g" },
  { id: "10", jp: "ぎんこう", romaji: "ginkō", es: "banco", kanaRow: "g", note: "こう = kō (larga)" },
  { id: "11", jp: "ごはん", romaji: "gohan", es: "arroz/comida", kanaRow: "g" },
  { id: "12", jp: "ごご", romaji: "gogo", es: "p.m. (tarde)", kanaRow: "g" },
  { id: "13", jp: "げんき", romaji: "genki", es: "animado/sano", kanaRow: "g" },
  { id: "14", jp: "ぐんて", romaji: "gunte", es: "guantes (trabajo)", kanaRow: "g" },
];

/* ===== Constantes meta/racha ===== */
const DAILY_GOAL = 5;
const STREAK_TARGET = 5;
const STORAGE_KEYS = {
  todayLearned: (dateKey: string) => `vocab.k.5x5.learned.${dateKey}`, // JSON string[] de ids
  lastDate: "vocab.k.5x5.lastDate",
  streak: "vocab.k.5x5.streak",
  badgeUnlocked: "badge.k-5x5.unlocked",
};

function dateKeyToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function dateKeyYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ===== Check visual (checkbox redondito) ===== */
function RoundCheck({ checked }: { checked: boolean }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="11" stroke={checked ? "#10B981" : "#9CA3AF"} strokeWidth={2} fill={checked ? "#10B981" : "transparent"} />
      {checked && (
        <Path d="M7 12.5l3 3 7-7" stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </Svg>
  );
}

/* ===== Pantalla ===== */
export default function VocabularioGrupoK() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [fontsLoaded] = useFonts({ NotoSansJP_700Bold });

  const [query, setQuery] = useState("");
  const [row, setRow] = useState<KanaRow>("k");

  const [learnedToday, setLearnedToday] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const todayKey = dateKeyToday();

  /* ---- Carga de estado persistido ---- */
  useEffect(() => {
    (async () => {
      const [idsStr, lastDate, streakStr, badgeStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.todayLearned(todayKey)),
        AsyncStorage.getItem(STORAGE_KEYS.lastDate),
        AsyncStorage.getItem(STORAGE_KEYS.streak),
        AsyncStorage.getItem(STORAGE_KEYS.badgeUnlocked),
      ]);

      setLearnedToday(idsStr ? JSON.parse(idsStr) : []);
      setStreak(streakStr ? Number(streakStr) : 0);
      setBadgeUnlocked(badgeStr === "1");

      // Reset/continuidad de racha según fecha
      const yday = dateKeyYesterday();
      if (lastDate && lastDate !== todayKey) {
        if (lastDate === yday) {
          // continúa racha (se incrementará cuando cumpla meta de hoy)
        } else {
          // se rompió racha → solo persistimos 0 si había racha previa
          await AsyncStorage.setItem(STORAGE_KEYS.streak, "0");
          setStreak(0);
        }
      }
      await AsyncStorage.setItem(STORAGE_KEYS.lastDate, todayKey);
    })();
  }, [todayKey]);

  /* ---- Guardar cambios diarios ---- */
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.todayLearned(todayKey), JSON.stringify(learnedToday));
  }, [learnedToday, todayKey]);

  /* ---- Cuando cumple meta de hoy, subir racha y checar logro ---- */
  useEffect(() => {
    (async () => {
      if (learnedToday.length >= DAILY_GOAL) {
        // solo incrementar racha una vez por día (marcamos con un flag por fecha)
        const flagKey = `${STORAGE_KEYS.todayLearned(todayKey)}.goalDone`;
        const done = await AsyncStorage.getItem(flagKey);
        if (!done) {
          // si ayer fue la fecha previa, +1; si no, racha = 1
          const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.lastDate);
          const next = lastDate === dateKeyYesterday() ? streak + 1 : 1;
          setStreak(next);
          await AsyncStorage.setItem(STORAGE_KEYS.streak, String(next));
          await AsyncStorage.setItem(flagKey, "1");

          // logro
          if (next >= STREAK_TARGET && !badgeUnlocked) {
            setBadgeUnlocked(true);
            setShowCongrats(true);
            await AsyncStorage.setItem(STORAGE_KEYS.badgeUnlocked, "1");
          }
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnedToday.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DATA.filter(i =>
      i.kanaRow === row &&
      (q.length === 0 ||
        i.jp.includes(q) ||
        (i.reading ?? "").includes(q) ||
        i.romaji.toLowerCase().includes(q) ||
        i.es.toLowerCase().includes(q))
    );
  }, [query, row]);

  const { width } = useWindowDimensions();
  const cardW = Math.min(width - 32, 680);

  const toggleLearned = (id: string) => {
    setLearnedToday(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const renderItem = ({ item }: { item: VocabItem }) => {
    const checked = learnedToday.includes(item.id);
    return (
      <Pressable onPress={() => toggleLearned(item.id)} style={[styles.card, { width: cardW, borderColor: checked ? "#10B981" : "#E5E7EB" }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.jp, fontsLoaded && { fontFamily: "NotoSansJP_700Bold" }]}>{item.jp}</Text>
          {item.reading ? <Text style={styles.reading}>{item.reading}</Text> : null}
          <View style={{ marginLeft: "auto" }}>
            <RoundCheck checked={checked} />
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.romaji}>{item.romaji}</Text>
          <Text style={styles.es}>{item.es}</Text>
          {item.note ? <Text style={styles.note}>Nota: {item.note}</Text> : null}
        </View>
      </Pressable>
    );
  };

  const progress = Math.min(1, learnedToday.length / DAILY_GOAL);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Vocabulario — Grupo K</Text>
        <Text style={styles.subtitle}>ka・ki・ku・ke・ko y ga・gi・gu・ge・go</Text>
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        <View style={styles.pillsRow}>
          <Pressable onPress={() => setRow("k")} style={[styles.pill, row === "k" && styles.pillActive]} hitSlop={12}>
            <Text style={[styles.pillText, row === "k" && styles.pillTextActive]}>Fila K</Text>
          </Pressable>
          <Pressable onPress={() => setRow("g")} style={[styles.pill, row === "g" && styles.pillActive]} hitSlop={12}>
            <Text style={[styles.pillText, row === "g" && styles.pillTextActive]}>Fila G (が/ぎ/ぐ/げ/ご)</Text>
          </Pressable>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar (jp/romaji/es)…"
          placeholderTextColor="#9CA3AF"
          style={styles.search}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Meta del día + progreso + racha */}
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>Meta de hoy</Text>
        <Text style={styles.goalSubtitle}>Aprende {DAILY_GOAL} palabras</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {learnedToday.length}/{DAILY_GOAL} hoy · Racha: {streak}/{STREAK_TARGET}
          {badgeUnlocked ? "  — 🏆 Logro desbloqueado" : ""}
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}
        data={filtered}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No hay resultados para tu búsqueda.</Text>}
      />

      {/* Modal de logro */}
      <Modal visible={showCongrats} transparent animationType="fade" onRequestClose={() => setShowCongrats(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.congratsTitle}>¡Logro desbloqueado! 🎉</Text>
            <Text style={styles.congratsText}>5 palabras × 5 días — Grupo K</Text>
            <Pressable onPress={() => setShowCongrats(false)} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ===== Estilos ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: { padding: 20, backgroundColor: "#a41034" },
  title: { color: "#fff", fontWeight: "900", fontSize: 22 },
  subtitle: { color: "#FBE8E8", marginTop: 6 },

  controls: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#C4B69B", backgroundColor: "#FFFDF9" },
  pillActive: { backgroundColor: "#111827", borderColor: "#111827" },
  pillText: { color: "#3B2B1B", fontWeight: "700" },
  pillTextActive: { color: "#fff" },

  search: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
  },

  goalCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
  },
  goalTitle: { fontWeight: "900", color: "#111827" },
  goalSubtitle: { color: "#374151", marginTop: 2, marginBottom: 8 },
  progressBar: { height: 10, backgroundColor: "#E5E7EB", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#10B981" },
  progressText: { marginTop: 6, fontWeight: "700", color: "#111827" },

  card: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    alignSelf: "center",
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 6 },
  jp: { fontSize: 28, fontWeight: "900", color: "#111827" },
  reading: { fontSize: 14, color: "#6B7280", marginBottom: 2 },
  cardBody: {},
  romaji: { fontSize: 14, fontWeight: "800", color: "#374151" },
  es: { fontSize: 16, color: "#111827", marginTop: 2 },
  note: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  empty: { textAlign: "center", color: "#6B7280", marginTop: 24 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 18, alignItems: "center", width: "90%", maxWidth: 360 },
  congratsTitle: { fontSize: 20, fontWeight: "900", color: "#111827" },
  congratsText: { marginTop: 6, color: "#374151" },
  modalBtn: { marginTop: 12, backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  modalBtnText: { color: "#fff", fontWeight: "900" },
});
