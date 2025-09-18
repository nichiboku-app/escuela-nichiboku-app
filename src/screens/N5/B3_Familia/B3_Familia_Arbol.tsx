import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useFeedbackSounds } from "../../../hooks/useFeedbackSounds";

/* ============ colores ============ */
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

/* ============ helpers audio ============ */
const speakJA = (t: string) => {
  if (!t) return;
  Speech.speak(t, { language: "ja-JP", rate: 0.95 });
};

/* =======================================================================================
 *  ACTIVIDAD 1 — COMPLETA EL ÁRBOL
 * =======================================================================================
*/
type TargetKey =
  | "abuelo" | "abuela"
  | "padre" | "madre"
  | "hermanoMayor" | "yo" | "hermanaMenor" | "hermanoMenor" | "primo";

const TARGETS: { key: TargetKey; title: string; hintJP?: string; correct: string }[] = [
  { key: "abuelo",        title: "abuelo",         hintJP: "———",   correct: "そふ" },
  { key: "abuela",        title: "abuela",         hintJP: "そぼ",   correct: "そぼ" },
  { key: "padre",         title: "padre",          hintJP: "———",   correct: "ちち" },
  { key: "madre",         title: "madre",          hintJP: "———",   correct: "はは" },
  { key: "hermanoMayor",  title: "hermano mayor",  hintJP: "———",   correct: "あに" },
  { key: "yo",            title: "yo",             hintJP: "わたし", correct: "わたし" },
  { key: "hermanaMenor",  title: "hermana menor",  hintJP: "———",   correct: "いもうと" },
  { key: "hermanoMenor",  title: "hermano menor",  hintJP: "おとうと", correct: "おとうと" },
  { key: "primo",         title: "primo/a",        hintJP: "———",   correct: "いとこ" },
];

const OPTIONS_1 = [
  "あに", "おとうと", "はは", "いもうと", "そふ", "わたし", "ちち", "そぼ", "いとこ",
];

function ActivityCompleteTree() {
  const { playCorrect, playWrong } = useFeedbackSounds();
  const [board, setBoard] = useState<Record<TargetKey, string | null>>(
    () => Object.fromEntries(TARGETS.map(t => [t.key, null])) as any
  );
  const [mark, setMark] = useState<Record<TargetKey, "ok" | "bad" | null>>(
    () => Object.fromEntries(TARGETS.map(t => [t.key, null])) as any
  );
  const [active, setActive] = useState<TargetKey | null>(null);

  const reset = () => {
    setBoard(Object.fromEntries(TARGETS.map(t => [t.key, null])) as any);
    setMark(Object.fromEntries(TARGETS.map(t => [t.key, null])) as any);
    setActive(null);
  };

  const chooseOption = (opt: string) => {
    if (!active) return;
    const tgt = TARGETS.find(t => t.key === active)!;
    const ok = opt === tgt.correct;
    setBoard(prev => ({ ...prev, [active]: opt }));
    setMark(prev => ({ ...prev, [active]: ok ? "ok" : "bad" }));
    ok ? playCorrect() : playWrong();
  };

  const readTree = () => {
    const seq = TARGETS.map(t => board[t.key] ?? t.hintJP ?? "").filter(Boolean);
    seq.forEach((l, i) => setTimeout(() => speakJA(l), i * 800));
  };

  return (
    <View style={styles.section}>
      <Text style={styles.h1}>Actividad 1 — Completa el árbol</Text>
      <Text style={styles.p}>
        Toca un recuadro y elige la opción correcta. El árbol incluye <Text style={styles.bold}>abuelos, padres, hermanos y primos</Text>.
      </Text>

      <View style={styles.treeWrap}>
        <View style={styles.treeRow}>
          <TreeCard title="abuelo" hint={TARGETS[0].hintJP!} value={board.abuelo} mark={mark.abuelo} onPress={() => setActive("abuelo")} />
          <TreeCard title="abuela" hint={TARGETS[1].hintJP!} value={board.abuela} mark={mark.abuela} onPress={() => setActive("abuela")} />
        </View>
        <View style={styles.treeRow}>
          <TreeCard title="padre" hint={TARGETS[2].hintJP!} value={board.padre} mark={mark.padre} onPress={() => setActive("padre")} />
          <TreeCard title="madre" hint={TARGETS[3].hintJP!} value={board.madre} mark={mark.madre} onPress={() => setActive("madre")} />
        </View>
        <View style={[styles.treeRow, { gap: 10 }]}>
          <TreeCard title="hermano mayor" hint="———" value={board.hermanoMayor} mark={mark.hermanoMayor} onPress={() => setActive("hermanoMayor")} />
          <TreeCard title="yo" hint="わたし" fixed value={board.yo} mark={mark.yo} onPress={() => setActive("yo")} />
          <TreeCard title="hermana menor" hint="———" value={board.hermanaMenor} mark={mark.hermanaMenor} onPress={() => setActive("hermanaMenor")} />
          <TreeCard title="hermano menor" hint="おとうと" value={board.hermanoMenor} mark={mark.hermanoMenor} onPress={() => setActive("hermanoMenor")} />
          <TreeCard title="primo/a" hint="———" value={board.primo} mark={mark.primo} onPress={() => setActive("primo")} />
        </View>
      </View>

      <View style={styles.optionsRow}>
        {OPTIONS_1.map((op) => (
          <Pressable key={op} style={[styles.option, active && styles.optionActive]} onPress={() => chooseOption(op)}>
            <Text style={styles.optionJP}>{op}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        <PrimaryBtn icon="refresh-outline" label="Nuevo tablero" onPress={reset} />
        <PrimaryBtn icon="volume-high-outline" label="Leer árbol" onPress={readTree} />
      </View>
    </View>
  );
}

function TreeCard({
  title, hint, value, mark, onPress, fixed,
}: {
  title: string; hint: string; value: string | null; mark: "ok" | "bad" | null; onPress: () => void; fixed?: boolean;
}) {
  const border = mark === "ok" ? "#86EFAC" : mark === "bad" ? "#FCA5A5" : "#E5E7EB";
  const bg     = mark === "ok" ? "#ECFDF5" : mark === "bad" ? "#FEF2F2" : "#fff";

  return (
    <Pressable onPress={onPress} disabled={fixed} style={[styles.nodeCard, { borderColor: border, backgroundColor: bg }]}>
      <Text style={styles.nodeLabel}>{title}</Text>
      <Text style={styles.nodeHint}>{value ?? hint}</Text>
      {value ? (
        <Pressable onPress={() => speakJA(value)} style={styles.soundBtn}>
          <Ionicons name="volume-high-outline" size={14} color={CRIMSON} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

/* =======================================================================================
 *  ACTIVIDAD 2 — CONSTRUYE TU FAMILIA (DRAG & DROP PERSISTENTE)
 * =======================================================================================
*/
type ZoneKey =
  | "padre" | "madre" | "abuelo" | "abuela" | "hermano1" | "hermano2" | "primo";

const ZONES: { key: ZoneKey; label: string }[] = [
  { key: "padre", label: "padre" },
  { key: "madre", label: "madre" },
  { key: "abuelo", label: "abuelo" },
  { key: "abuela", label: "abuela" },
  { key: "hermano1", label: "hermano/a 1" },
  { key: "hermano2", label: "hermano/a 2" },
  { key: "primo", label: "primo/a" },
];

type Token = { id: string; jp: string; ro: string; expects: ZoneKey | "hermano" | "primo" };
const TOKENS: Token[] = [
  { id: "t1", jp: "ちち", ro: "chichi", expects: "padre" },
  { id: "t2", jp: "はは", ro: "haha", expects: "madre" },
  { id: "t3", jp: "そふ", ro: "sofu", expects: "abuelo" },
  { id: "t4", jp: "そぼ", ro: "sobo", expects: "abuela" },
  { id: "t5", jp: "あに", ro: "ani", expects: "hermano" },
  { id: "t6", jp: "おとうと", ro: "otōto", expects: "hermano" },
  { id: "t7", jp: "いもうと", ro: "imōto", expects: "hermano" },
  { id: "t8", jp: "いとこ", ro: "itoko", expects: "primo" },
];

const zoneOk = (zone: ZoneKey, token: Token) => {
  if (token.expects === "hermano") return zone === "hermano1" || zone === "hermano2";
  if (token.expects === "primo")   return zone === "primo";
  return token.expects === zone;
};

function DraggableToken({
  token, onDrop, zoneAt, setHover,
}: {
  token: Token;
  onDrop: (zone: ZoneKey | null, token: Token) => void;
  zoneAt: (x: number, y: number) => ZoneKey | null;
  setHover: (z: ZoneKey | null) => void;
}) {
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const dragging = useRef(false);
  const [active, setActive] = useState(false);
  const lastAbs = useRef({ x: 0, y: 0 });

  const reset = () => {
    Animated.parallel([
      Animated.spring(tx, { toValue: 0, useNativeDriver: true }),
      Animated.spring(ty, { toValue: 0, useNativeDriver: true }),
    ]).start(() => setActive(false));
    setHover(null);
    dragging.current = false;
  };

  return (
    <PanGestureHandler
      activeOffsetX={[-8, 8]}
      activeOffsetY={[-8, 8]}
      onGestureEvent={(e) => {
        const { translationX, translationY, absoluteX, absoluteY } = e.nativeEvent as any;
        if (!dragging.current) return;
        tx.setValue(translationX);
        ty.setValue(translationY);
        lastAbs.current = { x: absoluteX, y: absoluteY };
        setHover(zoneAt(absoluteX, absoluteY));
      }}
      onHandlerStateChange={(e) => {
        const s = e.nativeEvent.state;
        if (s === State.BEGAN) {
          dragging.current = true;
          setActive(true);
        }
        if (s === State.END || s === State.CANCELLED || s === State.FAILED) {
          const drop = zoneAt(lastAbs.current.x, lastAbs.current.y);
          onDrop(drop, token);
          reset();
        }
      }}
    >
      <Animated.View style={[styles.token, active && styles.tokenDragging, { transform: [{ translateX: tx }, { translateY: ty }] }]}>
        <Text style={styles.tokenJP}>{token.jp}</Text>
        <Text style={styles.tokenRo}>{token.ro}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
}

function ZoneChip({
  token, onRemove,
}: { token: Token; onRemove: () => void }) {
  const scale = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }, [scale]);
  return (
    <Animated.View style={[styles.zoneToken, { transform: [{ scale }] }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={styles.tokenJP}>{token.jp}</Text>
        <Text style={styles.tokenRo}>{token.ro}</Text>
        <Pressable onPress={() => speakJA(token.jp)} style={styles.soundTiny}>
          <Ionicons name="volume-high-outline" size={14} color={CRIMSON} />
        </Pressable>
      </View>
      <Pressable onPress={onRemove} style={styles.removeBtn}>
        <Ionicons name="close" size={14} color="#6B7280" />
      </Pressable>
    </Animated.View>
  );
}

function ActivityBuildYourFamily() {
  const { playCorrect, playWrong } = useFeedbackSounds();

  // coordenadas absolutas de cada zona
  const zoneLayout = useRef<Record<ZoneKey, { x: number; y: number; w: number; h: number }>>({} as any);
  const zoneRefs = useRef<Record<ZoneKey, View | null>>({
    padre: null, madre: null, abuelo: null, abuela: null, hermano1: null, hermano2: null, primo: null,
  });
  const measureZones = () => {
    (Object.keys(zoneRefs.current) as ZoneKey[]).forEach((k) => {
      zoneRefs.current[k]?.measureInWindow?.((x, y, w, h) => (zoneLayout.current[k] = { x, y, w, h }));
    });
  };
  useEffect(() => { const id = setTimeout(measureZones, 300); return () => clearTimeout(id); }, []);

  const zoneAt = (x: number, y: number): ZoneKey | null => {
    for (const k of Object.keys(zoneLayout.current) as ZoneKey[]) {
      const r = zoneLayout.current[k];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return k;
    }
    return null;
  };

  const [bag, setBag] = useState<Token[]>(TOKENS);
  const [placed, setPlaced] = useState<Record<ZoneKey, Token | null>>({
    padre: null, madre: null, abuelo: null, abuela: null, hermano1: null, hermano2: null, primo: null,
  });
  const [hover, setHover] = useState<ZoneKey | null>(null);
  const [flash, setFlash] = useState<Record<ZoneKey, "ok" | "bad" | null>>({
    padre: null, madre: null, abuelo: null, abuela: null, hermano1: null, hermano2: null, primo: null,
  });

  const handleDrop = (z: ZoneKey | null, token: Token) => {
    if (!z) return; // soltó fuera
    const ok = zoneOk(z, token);
    setFlash((p) => ({ ...p, [z]: ok ? "ok" : "bad" }));
    setTimeout(() => setFlash((p) => ({ ...p, [z]: null })), 550);

    if (ok) {
      const prev = placed[z];
      setPlaced((p) => ({ ...p, [z]: token }));             // ✅ queda guardado en la zona
      setBag((b) => {
        const without = b.filter((t) => t.id !== token.id); // saca de fichas
        return prev ? [...without, prev] : without;         // si había una, regresa a fichas
      });
      playCorrect();
    } else {
      playWrong();
    }
  };

  const removeFromZone = (z: ZoneKey) => {
    const t = placed[z];
    if (!t) return;
    setPlaced((p) => ({ ...p, [z]: null }));
    setBag((b) => [...b, t]);
    setTimeout(measureZones, 80);
  };

  const totalFamily = 1 + Object.values(placed).filter(Boolean).length;
  const sayFamily = () => {
    const NIN: Record<number, string> = {
      1: "ひとり", 2: "ふたり", 3: "さんにん", 4: "よにん", 5: "ごにん",
      6: "ろくにん", 7: "ななにん", 8: "はちにん", 9: "きゅうにん", 10: "じゅうにん",
    };
    const reading = NIN[Math.min(totalFamily, 10)] || "たくさん";
    Speech.speak(`わたしの かぞくは ${reading} です。`, { language: "ja-JP", rate: 0.95 });
  };

  const clearAll = () => {
    setBag(TOKENS);
    setPlaced({ padre: null, madre: null, abuelo: null, abuela: null, hermano1: null, hermano2: null, primo: null });
    setHover(null);
    setTimeout(measureZones, 100);
  };

  return (
    <View style={styles.section} onLayout={measureZones}>
      <Text style={styles.h1}>Actividad 2 — Construye tu familia</Text>
      <Text style={styles.p}>
        Arrastra las fichas a las zonas. Los cuadros se iluminan:
        <Text style={{ color: "#059669", fontWeight: "900" }}> verde</Text> correcto,
        <Text style={{ color: "#DC2626", fontWeight: "900" }}> rojo</Text> incorrecto.
        Luego presiona el altavoz para decir <Text style={styles.bold}>わたしの かぞくは 〜にん です</Text>.
      </Text>

      <View style={styles.builderRow}>
        {/* Fichas */}
        <View style={styles.pile}>
          <Text style={styles.h2}>Fichas</Text>
          <View style={styles.pileGrid}>
            {bag.map((t) => (
              <DraggableToken key={t.id} token={t} onDrop={handleDrop} zoneAt={zoneAt} setHover={setHover} />
            ))}
          </View>
        </View>

        {/* Zonas */}
        <View style={styles.drop}>
          <Text style={styles.h2}>Zonas</Text>
          <View style={styles.dropGrid}>
            {ZONES.map((z) => {
              const isHover = hover === z.key;
              const fb = flash[z.key];
              const bg =
                fb === "ok" ? "#ECFDF5" :
                fb === "bad" ? "#FEF2F2" :
                isHover ? "#F8FAFC" : "#fff";
              const border =
                fb === "ok" ? "#A7F3D0" :
                fb === "bad" ? "#FECACA" :
                isHover ? "#BFDBFE" : "#F3E7C9";
              return (
                <View
                  key={z.key}
                  ref={(r) => (zoneRefs.current[z.key] = r)}
                  onLayout={measureZones}
                  style={[styles.dropZone, { backgroundColor: bg, borderColor: border }]}
                >
                  <Text style={styles.zoneTitle}>{z.label}</Text>
                  <Text style={styles.zoneHint}>— suelta aquí —</Text>

                  {/* ✅ Token persistente en la zona */}
                  {placed[z.key] && (
                    <ZoneChip token={placed[z.key]!} onRemove={() => removeFromZone(z.key)} />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <PrimaryBtn icon="trash-outline" label="Limpiar" onPress={clearAll} />
        <PrimaryBtn icon="volume-high-outline" label={`${totalFamily}人 — Decir`} onPress={sayFamily} />
      </View>
    </View>
  );
}

/* =======================================================================================
 *  MINI GUÍA — CONTADOR ～人（にん）
 * =======================================================================================
*/
function NinMiniGuide() {
  const rows: Array<[string, string]> = [
    ["1人", "ひとり"], ["2人", "ふたり"], ["3人", "さんにん"], ["4人", "よにん"], ["5人", "ごにん"],
    ["6人", "ろくにん"], ["7人", "ななにん"], ["8人", "はちにん"], ["9人", "きゅうにん"], ["10人", "じゅうにん"],
  ];
  return (
    <View style={styles.section}>
      <Text style={styles.h1}>Mini guía — Contador ～人（にん）</Text>
      <Text style={styles.p}>
        Para contar personas usamos <Text style={styles.bold}>～人（にん）</Text>.
        Pregunta: <Text style={styles.bold}>なんにん かぞく ですか</Text> (“¿Cuántas personas hay en tu familia?”).
        <Text>{"\n"}</Text>Excepciones: <Text style={styles.bold}>1人＝ひとり</Text>, <Text style={styles.bold}>2人＝ふたり</Text>.
      </Text>

      <View style={styles.table}>
        {rows.map((r, i) => (
          <View key={i} style={[styles.tableRow, i === 0 && styles.tableHead]}>
            <Text style={[styles.td, { flex: 0.3, fontWeight: "900" }]}>{r[0]}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 0.7 }}>
              <Text style={[styles.td, { flex: 1 }]}>{r[1]}</Text>
              <Pressable style={styles.spkSmall} onPress={() => speakJA(r[1])}>
                <Ionicons name="musical-notes" size={14} color={CRIMSON} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/* =======================================================================================
 *  PANTALLA
 * =======================================================================================
*/
export default function B3_Familia_Arbol() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: PAPER }}>
      <ActivityCompleteTree />
      <ActivityBuildYourFamily />
      <NinMiniGuide />
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

/* =======================================================================================
 *  UI helpers — botones y estilos
 * =======================================================================================
*/
function PrimaryBtn({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.primary}>
      <Ionicons name={icon} size={18} color="#fff" />
      <Text style={styles.primaryTxt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, padding: 12, marginBottom: 12 },
  h1: { fontSize: 16, fontWeight: "900", color: INK },
  h2: { fontSize: 14, fontWeight: "900", color: INK, marginBottom: 6 },
  p: { color: "#374151", marginTop: 6, lineHeight: 20 },
  bold: { fontWeight: "900", color: INK },
  row: { flexDirection: "row", gap: 10, marginTop: 8 },

  /* Act.1 — árbol */
  treeWrap: { marginTop: 10, gap: 8 },
  treeRow: { flexDirection: "row", gap: 8 },
  nodeCard: {
    flex: 1, minHeight: 88, backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 10,
  },
  nodeLabel: { color: INK, fontWeight: "900" },
  nodeHint: { color: "#6B7280", marginTop: 6, fontSize: 16 },
  soundBtn: {
    position: "absolute", right: 8, bottom: 8,
    padding: 6, borderRadius: 999, backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf",
  },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  option: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 999 },
  optionActive: { borderColor: CRIMSON, backgroundColor: "#fff5f6" },
  optionJP: { color: INK, fontWeight: "900" },

  /* Act.2 — builder */
  builderRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  pile: { flex: 1, borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 12, padding: 10, backgroundColor: "#fff" },
  pileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  token: {
    alignSelf: "flex-start",
    borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#fff",
  },
  tokenDragging: { zIndex: 50, elevation: 6 },
  tokenJP: { color: INK, fontWeight: "900" },
  tokenRo: { color: "#6B7280", fontSize: 12 },

  drop: { flex: 1, borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 12, padding: 10, backgroundColor: "#fffdf8" },
  dropGrid: { gap: 8 },
  dropZone: {
    borderWidth: 1, borderColor: "#F3E7C9", backgroundColor: "#fff",
    padding: 10, borderRadius: 12, minHeight: 56, justifyContent: "center", marginBottom: 8,
  },
  zoneTitle: { color: INK, fontWeight: "900" },
  zoneHint: { color: "#9CA3AF", fontSize: 12 },

  /* Token persistente en zona */
  zoneToken: {
    marginTop: 6,
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  soundTiny: { padding: 6, borderRadius: 999, backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },
  removeBtn: { marginLeft: "auto", padding: 6 },

  /* tabla guía */
  table: { marginTop: 10, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, overflow: "hidden" },
  tableHead: { backgroundColor: "#fafafa" },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderColor: "#F3F4F6" },
  td: { color: "#374151" },

  /* botones */
  primary: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: CRIMSON, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  primaryTxt: { color: "#fff", fontWeight: "900" },
  spkSmall: { marginLeft: 8, padding: 6, borderRadius: 999, backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },
});
