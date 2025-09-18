import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useB3Score } from "../../../context/B3ScoreContext";

/* ===== Helpers ===== */
const digitsKana: Record<number, string> = {
  0: "れい", 1: "いち", 2: "に", 3: "さん", 4: "よん",
  5: "ご", 6: "ろく", 7: "なな", 8: "はち", 9: "きゅう",
};
function numberReading(n: number): string {
  if (n === 0) return "れい";
  if (n === 100) return "ひゃく";
  const t = Math.floor(n / 10), u = n % 10;
  let tens = "";
  if (t === 1) tens = "じゅう";
  else if (t > 1) tens = digitsKana[t] + "じゅう";
  const unit = u === 0 ? "" : digitsKana[u];
  return tens + unit;
}
function ageReading(n: number): string {
  if (n === 0) return "れいさい";
  if (n === 20) return "はたち";
  if (n === 100) return "ひゃくさい";
  const last = n % 10, tens = Math.floor(n / 10);
  if (last === 0) {
    if (n === 10) return "じゅっさい";
    if (tens >= 3) return digitsKana[tens] + "じゅっさい";
    if (tens === 2) return "にじゅっさい";
    if (tens === 1) return "じゅっさい";
  }
  let tensPart = "";
  if (tens === 1) tensPart = "じゅう";
  else if (tens > 1) tensPart = digitsKana[tens] + "じゅう";
  let unit = digitsKana[last];
  if (last === 1) unit = "いっ";
  if (last === 8) unit = "はっ";
  return tensPart + unit + "さい";
}
function tsuCounter(n: number): string {
  const map: Record<number, string> = {
    1: "ひとつ", 2: "ふたつ", 3: "みっつ", 4: "よっつ", 5: "いつつ",
    6: "むっつ", 7: "ななつ", 8: "やっつ", 9: "ここのつ", 10: "とお",
  };
  if (n >= 1 && n <= 10) return map[n];
  return `${numberReading(n)}こ`;
}
function peopleCounter(n: number): string {
  const map: Record<number, string> = {
    1: "ひとり", 2: "ふたり", 3: "さんにん", 4: "よにん", 5: "ごにん",
    6: "ろくにん", 7: "ななにん", 8: "はちにん", 9: "きゅうにん", 10: "じゅうにん",
  };
  if (map[n]) return map[n];
  return `${numberReading(n)}にん`;
}
type CounterType = "sai" | "tsu" | "nin";
const COUNTER_LABEL: Record<CounterType, string> = {
  sai: "Edad（〜歳）", tsu: "Cosas（〜つ）", nin: "Personas（〜人）",
};
const ICON_BY_TYPE: Record<CounterType, string> = { sai: "🎂", tsu: "🍎", nin: "🧒" };
const readingFor = (t: CounterType, n: number) => t === "sai" ? ageReading(n) : t === "tsu" ? tsuCounter(n) : peopleCounter(n);
const labelES = (t: CounterType, n: number) => t === "sai" ? `${n} años` : t === "tsu" ? `${n} cosa${n===1?"":"s"}` : `${n} persona${n===1?"":"s"}`;

/* ===== Screen ===== */
export default function B3_NumerosEdad_Contadores() {
  const { total, addPoints } = useB3Score(); // ⭐ total global y suma con tope 100
  const [type, setType] = useState<CounterType>("sai");
  const [showGuide, setShowGuide] = useState(true);

  // TTS
  const [jpVoice, setJpVoice] = useState<string | undefined>();
  const [hasJaVoice, setHasJaVoice] = useState(false);
  const warnedOnce = useRef(false);

  useEffect(() => {
    (async () => {
      try { await Audio.setAudioModeAsync({ playsInSilentModeIOS: true }); } catch {}
      try {
        const voices: any[] = await Speech.getAvailableVoicesAsync();
        const v = voices.find((x) => (x.language || "").toLowerCase().startsWith("ja")) ||
                  voices.find((x) => (x.identifier || x.voiceURI || "").toLowerCase().includes("ja"));
        const id = (v?.identifier as string) ?? (v?.voiceURI as string) ?? undefined;
        setJpVoice(id); setHasJaVoice(!!v);
      } catch {}
    })();
    return () => Speech.stop();
  }, []);

  const maybeWarn = () => {
    if (hasJaVoice) return;
    if (!warnedOnce.current) {
      warnedOnce.current = true;
      Alert.alert(
        "Instala voz japonesa",
        Platform.OS === "android"
          ? "Ajustes → Administración general → Idioma y entrada → Salida de texto a voz → Motor de Google → Instalar datos de voz → 日本語."
          : "iOS: Ajustes → Accesibilidad → Contenido hablado → Voces → Japonés."
      );
    }
  };

  const speakJP = (t: string) => {
    Speech.stop();
    const opts: any = { language: "ja-JP", rate: 1.0, pitch: 1.05 };
    if (jpVoice) opts.voice = jpVoice;
    if (!hasJaVoice) maybeWarn();
    Speech.speak(t, opts);
  };
  const speakBoth = (jp: string, es: string) => {
    Speech.stop();
    const jpOpts: any = { language: "ja-JP", rate: 1.0, pitch: 1.05 };
    if (jpVoice) jpOpts.voice = jpVoice;
    if (!hasJaVoice) maybeWarn();
    Speech.speak(jp, {
      ...jpOpts,
      onDone: () => Speech.speak(es, { language: "es-MX", rate: 1.0 }),
      onError: () => Speech.speak(es, { language: "es-MX", rate: 1.0 }),
    });
  };

  /* ===== Aprende 1–10 ===== */
  const miniTable = useMemo(() => {
    const rows = [];
    for (let i = 1; i <= 10; i++) rows.push({ n: i, jp: readingFor(type, i), es: labelES(type, i) });
    return rows;
  }, [type]);

  /* ===== Quiz ===== */
  const [qNumber, setQNumber] = useState(1 + Math.floor(Math.random() * 10)); // 1–10
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [localScore, setLocalScore] = useState(0); // opcional: marcador de esta pantalla
  const correct = readingFor(type, qNumber);

  useEffect(() => {
    const pool = new Set<number>(); pool.add(qNumber);
    while (pool.size < 4) pool.add(1 + Math.floor(Math.random() * 10));
    const arr = Array.from(pool);
    const opts = arr.map((n) => readingFor(type, n));
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    setChoices(opts); setSelected(null); setIsCorrect(null);
  }, [qNumber, type]);

  const submitChoice = (c: string) => {
    const ok = c === correct;
    setSelected(c); setIsCorrect(ok);
    if (ok) {
      speakJP(correct);
      const gained = addPoints("contadores", 10); // ⭐ suma respetando tope 100
      setLocalScore((s) => s + gained);
    }
  };
  const nextQuestion = () => setQNumber(1 + Math.floor(Math.random() * 10));

  /* ===== Modo libre ===== */
  const [freeN, setFreeN] = useState("5");
  const parsedN = Math.max(0, Math.min(100, parseInt(freeN || "0", 10) || 0));
  const freeRead = readingFor(type, parsedN);
  const freeLabel = labelES(type, parsedN);
  const freeJPLabel = type === "sai" ? `${parsedN}歳` : type === "nin" ? `${parsedN}人` : `${parsedN}つ`;

  /* ===== UI ===== */
  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Encabezado */}
      <View style={s.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Contadores — 歳・つ・人</Text>
          <Text style={s.subtitle}>Aprende y practica los contadores básicos con audio.</Text>
        </View>

        {/* ⭐ Total global 0–100 */}
        <View style={s.totalBadge}>
          <Ionicons name="star" size={14} color="#C6A15B" />
          <Text style={s.totalTxt}>{total} / 100</Text>
        </View>
      </View>

      {/* Banner TTS */}
      {!hasJaVoice && (
        <View style={[s.section, s.banner]}>
          <Ionicons name="warning-outline" size={18} color="#8a6d00" />
          <Text style={s.bannerTxt}>Si no se oye japonés, instala la voz ja-JP (Texto a voz).</Text>
          <Pressable
            style={s.bannerBtn}
            onPress={() => (Platform.OS === "android" ? Linking.openSettings() : Linking.openURL("app-settings:"))}
          >
            <Text style={s.bannerBtnTxt}>Abrir Ajustes</Text>
          </Pressable>
        </View>
      )}

      {/* Selector */}
      <View style={[s.section, s.modeRow]}>
        <Chip label="Edad（歳）" active={type === "sai"} onPress={() => setType("sai")} />
        <Chip label="Cosas（〜つ）" active={type === "tsu"} onPress={() => setType("tsu")} />
        <Chip label="Personas（人）" active={type === "nin"} onPress={() => setType("nin")} />
      </View>

      {/* Guía */}
      <View style={[s.section, s.card]}>
        <Pressable style={s.helpHeader} onPress={() => setShowGuide((v) => !v)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
            <Ionicons name="book-outline" size={18} color="#B32133" />
            <Text style={s.h1}>Guía rápida</Text>
          </View>
          <Ionicons name={showGuide ? "chevron-up" : "chevron-down"} size={18} color="#6B7280" />
        </Pressable>
        {showGuide && (
          <View style={{ marginTop: 8 }}>
            <Text style={s.p}><Text style={s.bold}>Edad（歳）</Text>: 1歳＝いっさい, 8歳＝はっさい, 10歳＝じゅっさい, 20歳＝はたち, 100歳＝ひゃくさい.</Text>
            <Text style={s.p}><Text style={s.bold}>Cosas（〜つ）</Text>: ひとつ…とお (1–10). Para más de 10 en N5: 〜こ.</Text>
            <Text style={s.p}><Text style={s.bold}>Personas（人）</Text>: ひとり, ふたり, さんにん, よにん…</Text>
            <Text style={s.pSmall}>Tip: Anota número, lectura y una frase en tu cuaderno.</Text>
          </View>
        )}
      </View>

      {/* Aprende 1–10 */}
      <View style={[s.section, s.card]}>
        <View style={s.rowBetween}>
          <Text style={s.h1}>Aprende（1–10）— {COUNTER_LABEL[type]}</Text>
          <Pressable onPress={() => speakJP(`${ICON_BY_TYPE[type]} ${COUNTER_LABEL[type]}`)}>
            <Ionicons name="musical-notes" size={18} color="#B32133" />
          </Pressable>
        </View>

        <View style={s.table}>
          <View style={[s.tableRow, s.tableHead]}>
            <Text style={[s.th, { flex: 0.2 }]}>#</Text>
            <Text style={[s.th, { flex: 0.5 }]}>Lectura (JP)</Text>
            <Text style={[s.th, { flex: 0.3 }]}>Español</Text>
          </View>
          {miniTable.map((r) => (
            <View key={r.n} style={s.tableRow}>
              <Text style={[s.td, { flex: 0.2 }]}>{r.n}</Text>
              <View style={[s.tdRow, { flex: 0.5 }]}>
                <Text style={s.tdJP}>{r.jp}</Text>
                <Pressable style={s.spkBtnSm} onPress={() => speakJP(r.jp)}>
                  <Ionicons name="musical-notes" size={14} color="#B32133" />
                </Pressable>
              </View>
              <Text style={[s.td, { flex: 0.3 }]}>{r.es}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quiz */}
      <View style={[s.section, s.card]}>
        <View style={s.rowBetween}>
          <Text style={s.h1}>Quiz — {COUNTER_LABEL[type]}</Text>
          <View style={s.badge}>
            <Ionicons name="trophy-outline" size={14} color="#C6A15B" />
            <Text style={s.badgeTxt}>{localScore} pt</Text>
          </View>
        </View>

        <View style={{ marginTop: 8, marginBottom: 6 }}>
          {type === "sai" ? (
            <Text style={s.p}>¿Cómo se lee <Text style={s.bold}>{qNumber}歳</Text>?</Text>
          ) : type === "nin" ? (
            <Text style={s.p}>¿Cómo se lee <Text style={s.bold}>{qNumber}人</Text>?</Text>
          ) : (
            <Text style={s.p}>¿Cómo se lee <Text style={s.bold}>{qNumber}つ</Text>?</Text>
          )}
          <View style={s.iconsWrap}>
            {Array.from({ length: Math.min(qNumber, 10) }).map((_, i) => (
              <Text style={s.icon} key={i}>{ICON_BY_TYPE[type]}</Text>
            ))}
          </View>
        </View>

        <View style={s.grid}>
          {choices.map((c) => {
            const active = selected === c;
            const stateStyle =
              selected && c === correct ? s.chipCorrect :
              active && isCorrect === false ? s.chipWrong : undefined;
            return (
              <Pressable
                key={c + Math.random()}
                style={[s.chip, stateStyle as any]}
                disabled={!!selected || total >= 100} // ⭐ no deja seleccionar si ya llegó al tope global
                onPress={() => submitChoice(c)}
              >
                <Text style={[s.chipTxt, selected && c === correct ? s.chipTxtOn : undefined]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>

        {selected && (
          <View style={s.feedback}>
            {isCorrect ? (
              <Text style={[s.p, s.ok]}>¡Bien! {correct} ✓</Text>
            ) : (
              <Text style={[s.p, s.bad]}>Ups, la correcta es {correct}.</Text>
            )}
            <View style={s.rowBetween}>
              <Text style={s.pSmall}>
                Total global: <Text style={s.bold}>{total} / 100</Text>
                {total >= 100 ? " （tope alcanzado）" : ""}
              </Text>
              <Pressable style={s.btn} onPress={nextQuestion}>
                <Text style={s.btnTxt}>Siguiente</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Modo libre */}
      <View style={[s.section, s.card]}>
        <Text style={s.h1}>Modo libre — {COUNTER_LABEL[type]}</Text>
        <Text style={s.pSmall}>Escribe un número y escucha la lectura.</Text>

        <View style={s.freeRow}>
          <TextInput
            value={freeN}
            onChangeText={setFreeN}
            keyboardType="number-pad"
            placeholder="número"
            style={s.input}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.freeJP}>
              {freeJPLabel} → <Text style={s.bold}>{freeRead}</Text>
            </Text>
            <Text style={s.pSmall}>{freeLabel}</Text>
          </View>
          <View style={s.freeBtns}>
            <Pressable onPress={() => speakJP(freeRead)} style={s.spkBtn}>
              <Ionicons name="musical-notes" size={18} color="#B32133" />
            </Pressable>
            <Pressable onPress={() => speakBoth(freeRead, freeLabel)} style={s.spkBtn}>
              <Ionicons name="volume-high" size={18} color="#B32133" />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

/* ===== Chips selector ===== */
function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillTxt, active && styles.pillTxtActive]}>{label}</Text>
    </Pressable>
  );
}

/* ===== Estilos ===== */
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

const s = StyleSheet.create({
  container: { padding: 20, backgroundColor: PAPER },
  section: { marginTop: 12 },

  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 22, fontWeight: "900", color: INK, marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6B7280" },

  totalBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#FFFDF3",
    borderWidth: 1, borderColor: "#F3E8C9", borderRadius: 999,
  },
  totalTxt: { color: "#6B7280", fontWeight: "900" },

  banner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FFF6D6", borderWidth: 1, borderColor: "#F3E2A0",
    padding: 12, borderRadius: 14,
  },
  bannerTxt: { flex: 1, color: "#8a6d00", lineHeight: 20 },
  bannerBtn: { backgroundColor: CRIMSON, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  bannerBtnTxt: { color: "#fff", fontWeight: "900" },

  modeRow: { flexDirection: "row", gap: 10 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },

  helpHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  h1: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#374151", lineHeight: 22, marginTop: 6 },
  pSmall: { color: "#6B7280", fontSize: 12, lineHeight: 18, marginTop: 4 },
  bold: { fontWeight: "900", color: INK },

  table: { marginTop: 10, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, overflow: "hidden" },
  tableHead: { backgroundColor: "#fafafa" },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderColor: "#F3F4F6" },
  th: { fontWeight: "900", color: INK },
  td: { color: "#374151" },
  tdRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tdJP: { color: INK, fontWeight: "900" },
  spkBtnSm: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "#f2c9cf", backgroundColor: "#fff5f5" },

  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  iconsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  icon: { fontSize: 20 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  chip: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14,
  },
  chipTxt: { color: INK, fontWeight: "900" },
  chipCorrect: { backgroundColor: "#e8f9ef", borderColor: "#bfead0" },
  chipWrong: { backgroundColor: "#fde8ea", borderColor: "#f3c1c7" },
  chipTxtOn: { color: "#0f5132" },

  feedback: { marginTop: 10 },
  btn: { backgroundColor: CRIMSON, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  btnTxt: { color: "#fff", fontWeight: "900" },

  freeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  input: {
    width: 84, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff", textAlign: "center",
  },
  freeJP: { color: INK, fontWeight: "900", marginBottom: 4 },
  freeBtns: { gap: 8, flexDirection: "row" },
  spkBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff5f5", borderWidth: 1, borderColor: "#f2c9cf",
  },
});

/* Chips del selector */
const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff",
  },
  pillActive: { backgroundColor: "#fde8ec", borderColor: "#f2c9cf" },
  pillTxt: { color: "#6B7280", fontWeight: "700" },
  pillTxtActive: { color: CRIMSON },
});
