import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { RootStackParamList } from "../../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Topic = {
  key: string;
  title: string;
  jp: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof RootStackParamList | string;
  tags: string[];
};

// ---------- data ----------
const TOPICS: Topic[] = [
  { key:"numeros", title:"Números y edad", jp:"数字と年齢（すうじ・ねんれい）", subtitle:"contar objetos, decir años", icon:"calculator-outline", route:"B3_NumerosEdad", tags:["カード","クイズ"] },
  { key:"familia", title:"Familia", jp:"家族（かぞく）", subtitle:"ちち・はは・おとうさん…", icon:"people-outline", route:"B3_Familia", tags:["ボキャブ","ロールプレイ"] },
  { key:"profesiones", title:"Profesiones", jp:"職業（しょくぎょう）", subtitle:"roleplay: ¿qué haces?", icon:"briefcase-outline", route:"B3_Profesiones", tags:["ロールプレイ","アバター"] },
  { key:"objClase", title:"Objetos de clase", jp:"教室の物（きょうしつのもの）", subtitle:"memoria con imágenes", icon:"cube-outline", route:"B3_ObjetosClase", tags:["カード","メモリー"] },
  { key:"lugares", title:"Lugares de la ciudad", jp:"町の場所（まちのばしょ）", subtitle:"mapa interactivo", icon:"map-outline", route:"B3_LugaresCiudad", tags:["マップ","ロールプレイ"] },
  { key:"comida", title:"Comida y bebidas", jp:"食べ物・飲み物（たべもの／のみもの）", subtitle:"roleplay restaurante", icon:"restaurant-outline", route:"B3_ComidaBebidas", tags:["ロールプレイ","カード"] },
  { key:"colores", title:"Colores y adjetivos básicos", jp:"色・基本の形容詞（いろ／けいようし）", subtitle:"matching + quiz visual", icon:"color-palette-outline", route:"B3_ColoresAdjetivos", tags:["マッチング","クイズ"] },
  { key:"cortesia", title:"Expresiones de cortesía", jp:"ていねい表現（お願いします／ありがとうございます）", subtitle:"おねがいします・ありがとうございます", icon:"heart-outline", route:"B3_Cortesia", tags:["ロールプレイ","ボイス"] },
  { key:"preguntas", title:"Preguntas básicas", jp:"基本の質問（なに・だれ・どこ）", subtitle:"qué, quién, dónde", icon:"help-circle-outline", route:"B3_PreguntasBasicas", tags:["ロールプレイ","クイズ"] },
];

/* ==== audio helper ==== */
function speakJA(t: string) {
  if (!t) return;
  Speech.speak(t, { language: "ja-JP", rate: 0.95 });
}

// ---------- screen ----------
export default function B3VocabularioMenu() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      {/* 🌸 Lluvia de sakura en el fondo */}
      <SakuraRain count={16} />

      <ScrollView contentContainerStyle={s.c}>
        {/* Encabezado */}
        <View style={s.header}>
          <Text style={s.kicker}>語彙ブロック 3</Text>
          <Text style={s.title}>Vocabulario esencial</Text>
          <Text style={s.jpSub}>たのしく学ぼう！(¡Aprendamos con diversión!)</Text>

          <View style={s.tagsRow}>
            <Tag label="ロールプレイ" /><Tag label="アバター" /><Tag label="アニメカード" />
          </View>
        </View>

        {/* ⬇️ Mini-guía: は (wa) + です */}
        <MiniGuideWaDesu />

        {/* Tarjetas de temas */}
        {TOPICS.map(t => (
          <TopicCard
            key={t.key}
            icon={t.icon}
            title={t.title}
            jp={t.jp}
            subtitle={t.subtitle}
            tags={t.tags}
            onPress={() => navigation.navigate(t.route as any)}
          />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

/* ================= Mini-guía は + です ================= */
function MiniGuideWaDesu() {
  const [showRomaji, setShowRomaji] = useState(true);
  const [showES, setShowES] = useState(true);

  // Frases SOLO en kana (+ rōmaji/es opcionales)
  const EXAMPLES = [
    { ja: "わたし は がくせい です。", ro: "watashi wa gakusei desu.", es: "Yo soy estudiante." },
    { ja: "これは ほん です。", ro: "kore wa hon desu.", es: "Esto es un libro." },
    { ja: "いもうと は じゅうごさい です。", ro: "imōto wa jūgo-sai desu.", es: "Mi hermana menor tiene 15 años." },
    { ja: "おとうと は がくせい では ありません。", ro: "otōto wa gakusei dewa arimasen.", es: "Mi hermano menor no es estudiante." },
    { ja: "おかあさん は なんさい ですか。", ro: "okāsan wa nansai desu ka?", es: "¿Cuántos años tiene tu mamá?" },
  ];

  return (
<View style={s.card}>
  <Text style={s.h2}>Mini-guía: は (wa) + です</Text>

  <Text style={s.p}>
    <Text style={s.bold}>は</Text> es la <Text style={s.bold}>partícula de tema</Text> (se escribe は pero se pronuncia <Text style={s.kbd}>wa</Text>).
    {"\n"}El patrón base es <Text style={s.kbd}>A は B です</Text> → “en cuanto a A, B (es)”.
  </Text>

  <Text style={s.p}>
    <Text style={s.bold}>です</Text> es la forma cortés del verbo “ser/estar”.
    {"\n"}Negativo cortés: <Text style={s.kbd}>では ありません</Text> (también <Text style={s.kbd}>じゃ ありません</Text>).
    {"\n"}Pregunta: añade <Text style={s.kbd}>か</Text> al final → <Text style={s.kbd}>ですか</Text>.
  </Text>

  <Text style={[s.p, { marginTop: 6 }]}>
    A continuación se muestran ejemplos de las oraciones que haremos terminando esta unidad.
  </Text>

  <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
    <ToggleBtn icon="text-outline" label={showRomaji ? "Ocultar rōmaji" : "Mostrar rōmaji"} onPress={() => setShowRomaji(v => !v)} />
    <ToggleBtn icon="translate-outline" label={showES ? "Ocultar ES" : "Mostrar ES"} onPress={() => setShowES(v => !v)} />
  </View>

  <View style={{ marginTop: 8, gap: 8 }}>
    {EXAMPLES.map((e, i) => (
      <View key={i}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={s.line}>{e.ja}</Text>
          <IconBtn onPress={() => speakJA(e.ja)} />
        </View>
        {showRomaji ? <Text style={s.romaji}>{e.ro}</Text> : null}
        {showES ? <Text style={s.es}>{e.es}</Text> : null}
      </View>
    ))}
  </View>

  <Text style={s.note}>
    Tip: en japonés muchas veces <Text style={s.bold}>omitimos</Text> el sujeto si ya es claro por el contexto.
    Con <Text style={s.kbd}>は</Text> presentas el tema y con <Text style={s.kbd}>です</Text> afirmas de forma cortés.
  </Text>
</View>

  );
}

/* ================= components ================= */
function TopicCard({
  icon, title, jp, subtitle, tags, onPress,
}: { icon: keyof typeof Ionicons.glyphMap; title: string; jp: string; subtitle: string; tags: string[]; onPress: () => void; }) {
  const scale = useRef(new Animated.Value(1)).current;
  const shineX = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shineX, { toValue: 340, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ).start();
  }, [shineX]);

  const pressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  return (
    <Animated.View style={[s.card, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={{ padding: 2, borderRadius: 18 }}>
        <Animated.View pointerEvents="none" style={[s.shine, { transform: [{ translateX: shineX }, { rotateZ: "-18deg" }] }]} />
        <View style={s.cardInner}>
          <View style={s.cardIconBox}><Ionicons name={icon} size={24} color={CRIMSON} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{title}</Text>
            <Text style={s.cardJP}>{jp}</Text>
            <Text style={s.cardSub}>{subtitle}</Text>
            <View style={s.cardTags}>{tags.map((t, i) => (<Tag key={i} label={t} small />))}</View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Tag({ label, small }: { label: string; small?: boolean }) {
  return (
    <View style={[s.tag, small && s.tagSmall]}>
      <Text style={[s.tagTxt, small && s.tagTxtSmall]}>{label}</Text>
    </View>
  );
}

function ToggleBtn({ icon, label, onPress }:{
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={btn.outline}>
      <Ionicons name={icon} size={18} color={CRIMSON} />
      <Text style={btn.outlineTxt}>{label}</Text>
    </Pressable>
  );
}

function IconBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btn.iconBtn}>
      <Ionicons name="volume-high-outline" size={18} color={CRIMSON} />
    </Pressable>
  );
}

/** 🌸 petalitos cayendo en bucle (ligero, sin dependencias) */
function SakuraRain({ count = 12 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const size = 8 + Math.round(Math.random() * 10);
        const x = Math.round(Math.random() * (width - size));
        const delay = Math.round(Math.random() * 2500);
        const rotStart = Math.random() * 360;
        const duration = 6000 + Math.round(Math.random() * 2000);
        return { id: i, size, x, delay, rotStart, duration };
      }),
    [count, width],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {petals.map(p => (<Petal key={p.id} {...p} H={height} />))}
    </View>
  );
}

function Petal({ size, x, delay, rotStart, duration, H }:{
  size: number; x: number; delay: number; rotStart: number; duration: number; H: number;
}) {
  const y = useRef(new Animated.Value(-size - 20)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    const fall = () => {
      if (!alive) return;
      y.setValue(-size - 20);
      Animated.timing(y, { toValue: H + size + 20, duration, easing: Easing.linear, useNativeDriver: true })
        .start(() => { if (!alive) return; setTimeout(fall, Math.random() * 1000); });
    };
    const rotLoop = Animated.loop(Animated.timing(rot, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    const swayLoop = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(sway, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    const start = setTimeout(() => { fall(); rotLoop.start(); swayLoop.start(); }, delay);
    return () => { alive = false; clearTimeout(start); rot.stopAnimation(); sway.stopAnimation(); y.stopAnimation(); };
  }, [H, delay, duration, rot, size, sway, y]);

  const translateX = Animated.add(new Animated.Value(x), sway.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] }));
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: [`${rotStart}deg`, `${rotStart + 180}deg`] });

  return (
    <Animated.View style={[s.petal, { width: size, height: size * 1.4, borderRadius: size, transform: [{ translateX }, { translateY: y }, { rotate }] }]} />
  );
}

// ---------- styles ----------
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

const s = StyleSheet.create({
  c: { padding: 16, gap: 12 },
  header: {
    backgroundColor: "#fffdf7",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    marginTop: 8,
  },
  kicker: { color: CRIMSON, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  jpSub: { color: "#6B7280", marginTop: 4 },
  tagsRow: { flexDirection: "row", gap: 8, marginTop: 10 },

  card: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", marginTop: 12, overflow: "hidden" },
  shine: { position: "absolute", width: 140, height: "200%", top: -30, left: -140, backgroundColor: "rgba(255,255,255,0.18)" },
  cardInner: { flexDirection: "row", gap: 12, alignItems: "center", padding: 16 },
  cardIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: INK },
  cardJP: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  cardSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  cardTags: { flexDirection: "row", gap: 6, marginTop: 8 },

  // texto base
  p: { color: "#374151", marginTop: 6, lineHeight: 20 },
  h2: { fontSize: 16, fontWeight: "900", color: INK },
  bold: { fontWeight: "900", color: INK },
  kbd: { fontWeight: "900", color: INK },
  line: { color: INK, marginLeft: 6 },
  romaji: { color: "#374151", marginLeft: 6, marginTop: 2 },
  es: { color: "#6B7280", marginLeft: 6, marginTop: 2 },
  note: { marginTop: 8, color: "#6B7280", fontSize: 12 },

  tag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#fff", borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB" },
  tagSmall: { paddingHorizontal: 8, paddingVertical: 3 },
  tagTxt: { fontSize: 12, fontWeight: "800", color: INK },
  tagTxtSmall: { fontSize: 11 },

  petal: { position: "absolute", top: -30, left: 0, backgroundColor: "#FFD7E6", borderWidth: 1, borderColor: "#F9AFC6", opacity: 0.8 },
});

const btn = StyleSheet.create({
  iconBtn: { marginLeft: 6, padding: 6, borderRadius: 999, backgroundColor: "#fff5f6", borderWidth: 1, borderColor: "#f2c9cf" },
  outline: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  outlineTxt: { color: CRIMSON, fontWeight: "900" },
});
