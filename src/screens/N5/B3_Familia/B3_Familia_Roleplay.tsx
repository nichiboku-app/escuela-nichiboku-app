import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const INK = "#1F2937";
const CRIMSON = "#B32133";

function speakJA(t: string) {
  Speech.speak(t, { language: "ja-JP", rate: 0.95 });
}
function speakLinesJA(lines: string[], i = 0) {
  if (i >= lines.length) return;
  Speech.speak(lines[i], { language: "ja-JP", rate: 0.95, onDone: () => speakLinesJA(lines, i + 1) });
}

/* ---------- datos ---------- */
type Pair = { es: string; politeKana: string; politeRomaji: string; mineKana: string; mineRomaji: string };

const FAMILY_PAIRS: Pair[] = [
  { es: "padre",         politeKana: "おとうさん", politeRomaji: "otōsan",   mineKana: "ちち",     mineRomaji: "chichi" },
  { es: "madre",         politeKana: "おかあさん", politeRomaji: "okāsan",   mineKana: "はは",     mineRomaji: "haha" },
  { es: "hermano mayor", politeKana: "おにいさん", politeRomaji: "onīsan",   mineKana: "あに",     mineRomaji: "ani" },
  { es: "hermana mayor", politeKana: "おねえさん", politeRomaji: "onēsan",   mineKana: "あね",     mineRomaji: "ane" },
  { es: "hermano menor", politeKana: "おとうとさん", politeRomaji: "otōto-san", mineKana: "おとうと", mineRomaji: "otōto" },
  { es: "hermana menor", politeKana: "いもうとさん", politeRomaji: "imōto-san", mineKana: "いもうと", mineRomaji: "imōto" },
  { es: "esposo",        politeKana: "ごしゅじん／だんなさん", politeRomaji: "goshujin / danna-san", mineKana: "おっと", mineRomaji: "otto" },
  { es: "esposa",        politeKana: "おくさん",   politeRomaji: "okusan",   mineKana: "つま",     mineRomaji: "tsuma" },
  { es: "hijo/a; hijos", politeKana: "おこさん",   politeRomaji: "okosan",   mineKana: "こども",   mineRomaji: "kodomo" },
  { es: "padres",        politeKana: "ごりょうしん", politeRomaji: "goryōshin", mineKana: "りょうしん", mineRomaji: "ryōshin" },
  { es: "familia",       politeKana: "ごかぞく",   politeRomaji: "gokazoku", mineKana: "かぞく",   mineRomaji: "kazoku" },
];

const AGE_EXAMPLES = [
  { ja: "ちちは ごじゅっさい です。", romaji: "chichi wa gojussai desu.", es: "Mi papá tiene 50 años." },
  { ja: "あねは にじゅうさんさい です。", romaji: "ane wa nijūsan-sai desu.", es: "Mi hermana mayor tiene 23 años." },
  { ja: "おとうとは じゅうろくさい です。", romaji: "otōto wa jūroku-sai desu.", es: "Mi hermano menor tiene 16 años." },
  { ja: "そふは ななじゅういっさい です。", romaji: "sofu wa nanajū-issai desu.", es: "Mi abuelo tiene 71 años." },
  { ja: "こどもは はっさい です。", romaji: "kodomo wa hassai desu.", es: "Mi niño tiene 8 años." },
];

/* ---------- actividad: construir oraciones (7) ---------- */
type BuildTask = { tokens: string[]; romaji: string; es: string };

const BUILD_TASKS: BuildTask[] = [
  { tokens: ["ちち","は","ごじゅっさい","です","。"],    romaji: "chichi wa gojussai desu.", es: "Mi papá tiene 50 años." },
  { tokens: ["はは","は","よんじゅうはっさい","です","。"], romaji: "haha wa yonjū-hassai desu.", es: "Mi mamá tiene 48 años." },
  { tokens: ["あに","は","にじゅうごさい","です","。"],   romaji: "ani wa nijūgo-sai desu.", es: "Mi hermano mayor tiene 25 años." },
  { tokens: ["あね","は","にじゅうさんさい","です","。"], romaji: "ane wa nijūsan-sai desu.", es: "Mi hermana mayor tiene 23 años." },
  { tokens: ["いもうと","は","じゅうよんさい","です","。"], romaji: "imōto wa jūyon-sai desu.", es: "Mi hermana menor tiene 14 años." },
  { tokens: ["おとうと","は","じゅうななさい","です","。"], romaji: "otōto wa jūnana-sai desu.", es: "Mi hermano menor tiene 17 años." },
  { tokens: ["そふ","は","ななじゅういっさい","です","。"], romaji: "sofu wa nanajū-issai desu.", es: "Mi abuelo tiene 71 años." },
];

/* ---------- componente ---------- */
export default function B3_Familia_Roleplay() {
  const [showRomaji, setShowRomaji] = useState(true);
  const [showES, setShowES] = useState(false);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>Familia japonesa: guía y tips</Text>

      {/* 1) Contexto cultural */}
      <View style={s.card}>
        <Text style={s.h2}>¿Por qué hay dos palabras para “mi” vs “tu” familia?</Text>
        <Text style={s.p}>
          En japonés se distingue entre <Text style={s.bold}>adentro (うち)</Text> y <Text style={s.bold}>afuera (そと)</Text>.
          Para la <Text style={s.bold}>familia de otra persona</Text> se usan formas <Text style={s.bold}>corteses</Text> y
          prefijos <Text style={s.bold}>ご／お</Text>; para <Text style={s.bold}>mi propia familia</Text> se usan formas <Text style={s.bold}>humildes</Text>.
        </Text>
        <Text style={s.note}>Ej.: “tu padre” = <Text style={s.bold}>おとうさん</Text>; “mi padre” = <Text style={s.bold}>ちち</Text>.</Text>
      </View>

      {/* 2) Tabla comparativa */}
      <View style={s.card}>
        <Text style={s.h2}>Cortés vs. Mi familia</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <ToggleBtn onPress={() => setShowRomaji(v => !v)} active={showRomaji} icon="text-outline" label={showRomaji ? "Ocultar rōmaji" : "Mostrar rōmaji"} />
          <ToggleBtn onPress={() => setShowES(v => !v)} active={showES} icon="translate-outline" label={showES ? "Ocultar ES" : "Mostrar ES"} />
        </View>

        <View style={{ marginTop: 10, gap: 10 }}>
          {FAMILY_PAIRS.map((p, i) => (
            <PairRow key={i} pair={p} showRomaji={showRomaji} showES={showES} />
          ))}
        </View>

        <Text style={s.note}>
          No uses <Text style={s.bold}>さん</Text> con tu propia familia cuando hablas de ti: di <Text style={s.bold}>ちち</Text>, no “ちちさん”.
        </Text>
      </View>

      {/* 3) Edad + familia (ejemplos) */}
      <View style={s.card}>
        <Text style={s.h2}>Oraciones con edad y familia</Text>
        <Text style={s.p}>Recuerda: 1さい＝いっさい, 8さい＝はっさい, 10さい＝じゅっさい／じっさい, 20さい＝はたち.</Text>

        <View style={{ marginTop: 8, gap: 8 }}>
          {AGE_EXAMPLES.map((ex, i) => (
            <ExampleLine key={i} ja={ex.ja} romaji={ex.romaji} es={ex.es} showRomaji={showRomaji} showES={showES} />
          ))}
        </View>
      </View>

      {/* 4) ACTIVIDAD: Construye la oración */}
      <SentenceBuildActivity tasks={BUILD_TASKS} />

    </ScrollView>
  );
}

/* ---------- actividad UI ---------- */
function SentenceBuildActivity({ tasks }: { tasks: BuildTask[] }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [shuffled, setShuffled] = useState<number[]>(() => shuffleIndexes(tasks[0].tokens.length));
  const [feedback, setFeedback] = useState<"idle" | "ok" | "nope">("idle");
  const [showRomaji, setShowRomaji] = useState(false);
  const [showES, setShowES] = useState(true);

  const t = tasks[idx];
  const correct = t.tokens.join("");

  function poolIndexes() {
    return shuffled.filter(i => !selected.includes(i));
  }

  function tapPool(i: number) {
    setSelected(s => (s.includes(i) ? s : [...s, i]));
    setFeedback("idle");
  }
  function tapBuilt(i: number) {
    setSelected(s => s.filter(x => x !== i));
    setFeedback("idle");
  }

  function check() {
    const built = selected.map(i => t.tokens[i]).join("");
    if (built === correct) {
      setFeedback("ok");
      speakJA(built);
    } else {
      setFeedback("nope");
    }
  }
  function reset() {
    setSelected([]);
    setFeedback("idle");
  }
  function showAnswer() {
    setSelected(t.tokens.map((_, i) => i));
    setFeedback("ok");
    speakJA(correct);
  }
  function next() {
    const nextIdx = (idx + 1) % tasks.length;
    setIdx(nextIdx);
    setSelected([]);
    setFeedback("idle");
    setShuffled(shuffleIndexes(tasks[nextIdx].tokens.length));
  }
  function prev() {
    const prevIdx = (idx - 1 + tasks.length) % tasks.length;
    setIdx(prevIdx);
    setSelected([]);
    setFeedback("idle");
    setShuffled(shuffleIndexes(tasks[prevIdx].tokens.length));
  }

  const built = selected.map(i => t.tokens[i]).join("");

  return (
    <View style={act.card}>
      <Text style={s.h2}>Actividad: acomoda la oración ({idx + 1}/{tasks.length})</Text>
      {showES ? <Text style={s.note}>Pista (ES): {t.es}</Text> : null}
      {showRomaji ? <Text style={s.note}>Rōmaji: {t.romaji}</Text> : null}

      {/* Zona construida */}
      <View style={act.builtBox}>
        {selected.length === 0 ? (
          <Text style={{ color: "#9CA3AF" }}>Toca los chips para formar la oración…</Text>
        ) : (
          selected.map(i => (
            <Pressable key={i} onPress={() => tapBuilt(i)} style={[act.chip, act.chipBuilt]}>
              <Text style={act.chipTxt}>{t.tokens[i]}</Text>
            </Pressable>
          ))
        )}
      </View>

      {/* Pool de tokens */}
      <View style={act.pool}>
        {poolIndexes().map(i => (
          <Pressable key={i} onPress={() => tapPool(i)} style={act.chip}>
            <Text style={act.chipTxt}>{t.tokens[i]}</Text>
          </Pressable>
        ))}
      </View>

      {/* Controles */}
      <View style={act.controls}>
        <PrimaryBtn icon="checkmark-circle-outline" label="Comprobar" onPress={check} />
        <OutlineBtn icon="refresh-outline" label="Reiniciar" onPress={reset} />
        <OutlineBtn icon="bulb-outline" label="Respuesta" onPress={showAnswer} />
      </View>

      {/* Navegación + toggles */}
      <View style={[act.controls, { marginTop: 6 }]}>
        <OutlineBtn icon="arrow-back-outline" label="Anterior" onPress={prev} />
        <OutlineBtn icon="text-outline" label={showRomaji ? "Ocultar rōmaji" : "Mostrar rōmaji"} onPress={() => setShowRomaji(v => !v)} />
        <OutlineBtn icon="translate-outline" label={showES ? "Ocultar ES" : "Mostrar ES"} onPress={() => setShowES(v => !v)} />
        <PrimaryBtn icon="arrow-forward-outline" label="Siguiente" onPress={next} />
      </View>

      {/* Feedback */}
      {feedback !== "idle" ? (
        <Text style={[act.feedback, feedback === "ok" ? { color: "#059669" } : { color: "#B32133" }]}>
          {feedback === "ok" ? "¡Correcto! 🎉" : "Casi… revisa el orden."}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
        <OutlineBtn icon="volume-high-outline" label="Escuchar" onPress={() => speakJA(built || correct)} />
      </View>
    </View>
  );
}

function shuffleIndexes(n: number) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ---------- piezas ---------- */

function PairRow({ pair, showRomaji, showES }: { pair: Pair; showRomaji: boolean; showES: boolean }) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.left}>
        <Text style={rowStyles.tag}>Cortés</Text>
        <View style={rowStyles.line}>
          <Text style={rowStyles.jp}>{pair.politeKana}</Text>
          <IconBtn onPress={() => speakJA(pair.politeKana)} />
        </View>
        {showRomaji ? <Text style={rowStyles.romaji}>{pair.politeRomaji}</Text> : null}
      </View>

      <View style={rowStyles.mid}>
        <Text style={rowStyles.es}>{pair.es}</Text>
        {showES ? <Text style={rowStyles.esNote}>Uso común en español</Text> : null}
      </View>

      <View style={rowStyles.right}>
        <Text style={[rowStyles.tag, { backgroundColor: "#f1f5ff", borderColor: "#dbeafe", color: "#1d4ed8" }]}>Mi familia</Text>
        <View style={rowStyles.line}>
          <Text style={rowStyles.jp}>{pair.mineKana}</Text>
          <IconBtn onPress={() => speakJA(pair.mineKana)} />
        </View>
        {showRomaji ? <Text style={rowStyles.romaji}>{pair.mineRomaji}</Text> : null}
      </View>
    </View>
  );
}

function ExampleLine({ ja, romaji, es, showRomaji, showES }:{
  ja: string; romaji: string; es: string; showRomaji: boolean; showES: boolean;
}) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={s.line}>{ja}</Text>
        <IconBtn onPress={() => speakJA(ja)} />
      </View>
      {showRomaji ? <Text style={s.romaji}>{romaji}</Text> : null}
      {showES ? <Text style={s.es}>{es}</Text> : null}
    </View>
  );
}

function IconBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.iconBtn}>
      <Ionicons name="volume-high-outline" size={18} color={CRIMSON} />
    </Pressable>
  );
}

function PrimaryBtn({ icon, label, onPress }:{ icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.primary}>
      <Ionicons name={icon} size={18} color="#fff" />
      <Text style={btn.primaryTxt}>{label}</Text>
    </Pressable>
  );
}
function OutlineBtn({ icon, label, onPress }:{ icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.outline}>
      <Ionicons name={icon} size={18} color={CRIMSON} />
      <Text style={btn.outlineTxt}>{label}</Text>
    </Pressable>
  );
}
function ToggleBtn({ icon, label, onPress, active }:{
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; active: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[btn.outline, active && { borderColor: CRIMSON }]}>
      <Ionicons name={icon} size={18} color={CRIMSON} />
      <Text style={btn.outlineTxt}>{label}</Text>
    </Pressable>
  );
}

/* ---------- estilos ---------- */
const s = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "900", color: INK },

  card: {
    marginTop: 12,
    borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 12, padding: 12, backgroundColor: "#fff",
  },

  h2: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#374151", marginTop: 6, lineHeight: 20 },
  note: { marginTop: 8, color: "#6B7280", fontSize: 12 },

  /* líneas ejemplo */
  line: { color: INK, marginLeft: 6 },
  romaji: { color: "#374151", marginLeft: 6, marginTop: 2 },
  es: { color: "#6B7280", marginLeft: 6, marginTop: 2 },

  bulletTitle: { fontWeight: "900", color: INK, marginTop: 6 },
  bulletBody: { color: "#374151", marginTop: 2 },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 12, padding: 10, backgroundColor: "#fff" },
  left: { flex: 1 },
  mid: { width: 110, alignItems: "center", justifyContent: "center" },
  right: { flex: 1 },

  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 999, borderWidth: 1,
    borderColor: "#fde2e7", backgroundColor: "#fff5f6",
    color: CRIMSON, fontWeight: "900", fontSize: 11,
  },
  line: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  jp: { color: INK, fontWeight: "700" },
  romaji: { color: "#6B7280", fontSize: 12, marginTop: 2 },
  es: { color: INK, fontWeight: "800", textAlign: "center" },
  esNote: { color: "#9CA3AF", fontSize: 11, marginTop: 2 },
});

const btn = StyleSheet.create({
  iconBtn: { padding: 6, borderRadius: 999, backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },
  primary: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: CRIMSON, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  primaryTxt: { color: "#fff", fontWeight: "900" },
  outline: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  outlineTxt: { color: CRIMSON, fontWeight: "900" },
});

const act = StyleSheet.create({
  card: { marginTop: 12, borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 12, padding: 12, backgroundColor: "#fff" },
  builtBox: {
    minHeight: 50, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 8,
    backgroundColor: "#fffdf8", flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center",
    marginTop: 8,
  },
  pool: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#fff5f6",
    borderRadius: 999, borderWidth: 1, borderColor: "#f2c9cf",
  },
  chipBuilt: { backgroundColor: "#fde68a", borderColor: "#f59e0b" },
  chipTxt: { color: INK, fontWeight: "800" },
  controls: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  feedback: { marginTop: 8, fontWeight: "900" },
});
