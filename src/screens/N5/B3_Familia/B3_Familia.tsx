import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Easing,
    ImageSourcePropType,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View
} from "react-native";
import type { RootStackParamList } from "../../../../types";

/* ===================== Navegación ===================== */
type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ⬇️ tu collage WEBP generado */
const FAMILY_BADGES: ImageSourcePropType = require("../../../../assets/images/b3_familia_badges.webp");

/* ===================== Audio helpers ===================== */
function speakJA(text: string) {
  if (!text) return;
  Speech.speak(text, { language: "ja-JP", rate: 0.95 });
}
function speakLinesJA(lines: string[], i = 0) {
  if (i >= lines.length) return;
  Speech.speak(lines[i], {
    language: "ja-JP",
    rate: 0.95,
    onDone: () => speakLinesJA(lines, i + 1),
  });
}

/* ===================== Lecturas ～人 (1–10) ===================== */
const NIN_KANA: Record<number, string> = {
  1: "ひとり",
  2: "ふたり",
  3: "さんにん",
  4: "よにん",
  5: "ごにん",
  6: "ろくにん",
  7: "ななにん",
  8: "はちにん",
  9: "きゅうにん",
  10: "じゅうにん",
};
const NIN_ROMAJI: Record<number, string> = {
  1: "hitori",
  2: "futari",
  3: "sannin",
  4: "yonin",
  5: "gonin",
  6: "rokunin",
  7: "nananin",
  8: "hachinin",
  9: "kyūnin",
  10: "jūnin",
};

/* ===================== Datos de vocabulario ===================== */
type Pair = { politeKana: string; politeRomaji: string; mineKana: string; mineRomaji: string; es: string };

const FAMILY_PAIRS: Pair[] = [
  { politeKana: "おとうさん", politeRomaji: "otōsan", mineKana: "ちち", mineRomaji: "chichi", es: "padre" },
  { politeKana: "おかあさん", politeRomaji: "okāsan", mineKana: "はは", mineRomaji: "haha", es: "madre" },
  { politeKana: "おにいさん", politeRomaji: "onīsan", mineKana: "あに", mineRomaji: "ani", es: "hermano mayor" },
  { politeKana: "おねえさん", politeRomaji: "onēsan", mineKana: "あね", mineRomaji: "ane", es: "hermana mayor" },
  { politeKana: "おとうとさん", politeRomaji: "otōto-san", mineKana: "おとうと", mineRomaji: "otōto", es: "hermano menor" },
  { politeKana: "いもうとさん", politeRomaji: "imōto-san", mineKana: "いもうと", mineRomaji: "imōto", es: "hermana menor" },
  { politeKana: "おじいさん", politeRomaji: "ojīsan", mineKana: "そふ", mineRomaji: "sofu", es: "abuelo" },
  { politeKana: "おばあさん", politeRomaji: "obāsan", mineKana: "そぼ", mineRomaji: "sobo", es: "abuela" },
  { politeKana: "ごしゅじん", politeRomaji: "goshujin", mineKana: "おっと", mineRomaji: "otto", es: "esposo" },
  { politeKana: "おくさん", politeRomaji: "okusan", mineKana: "つま", mineRomaji: "tsuma", es: "esposa" },
  { politeKana: "おこさん", politeRomaji: "okosan", mineKana: "こども", mineRomaji: "kodomo", es: "hijo/a; hijos" },
  { politeKana: "ごりょうしん", politeRomaji: "goryōshin", mineKana: "りょうしん", mineRomaji: "ryōshin", es: "padres" },
  { politeKana: "ごかぞく", politeRomaji: "gokazoku", mineKana: "かぞく", mineRomaji: "kazoku", es: "familia" },
  { politeKana: "きょうだいさん", politeRomaji: "kyōdai-san", mineKana: "きょうだい", mineRomaji: "kyōdai", es: "hermanos/as (siblings)" },
];

/* ===================== Pantalla ===================== */
export default function B3_Familia() {
  const navigation = useNavigation<Nav>();
  const scrollY = useRef(new Animated.Value(0)).current;

  const heroH = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [240, 140],
    extrapolate: "clamp",
  });

  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <SakuraRain count={10} />

      {/* HERO con parallax / Ken Burns */}
      <Animated.View style={[stylesHero.wrap, { height: heroH }]}>
        <FamilyHero />
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={[s.container, { paddingTop: 12 }]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={s.header}>
          <Text style={s.kicker}>語彙ブロック 3</Text>
          <Text style={s.title}>家族（かぞく）</Text>
          <Text style={s.subtitle}>Familia – vocabulario, posesivo の y “〜人”</Text>
        </View>

        {/* Acciones rápidas (scroll horizontal) */}
        <QuickActions
          onRoleplay={() => navigation.navigate("B3_Familia_Roleplay")}
          onCards={() => navigation.navigate("B3_Familia_Tarjetas")}
          onTree={() => navigation.navigate("B3_Familia_Arbol")}
        />

        <VocabPairs />
        <PossessiveNoGuide />
        <FamilySizePractice />
        <DialoguePracticeFamily />

        <View style={{ height: 32 }} />
      </Animated.ScrollView>
    </View>
  );
}

/* ===================== Hero con la imagen nueva ===================== */
function FamilyHero() {
  const scale = useRef(new Animated.Value(1)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ken Burns suave
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.06, duration: 4500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 4500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(tilt, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [scale, tilt, pulse]);

  const rotate = tilt.interpolate({ inputRange: [0, 1], outputRange: ["-1.4deg", "1.4deg"] });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.8] });

  return (
    <View style={stylesHero.inner}>
      <Animated.View style={[stylesHero.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
      <Animated.Image
        source={FAMILY_BADGES}
        style={[stylesHero.img, { transform: [{ scale }, { rotate }] }]}
        resizeMode="contain"
      />
      {/* Globo de saludo + play */}
      <View style={stylesHero.bubble}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={stylesHero.bubbleTxt}>こんにちは！ かぞくのことばを べんきょうしよう。</Text>
          <Pressable onPress={() => speakJA("こんにちは！ かぞくのことばを べんきょうしよう。")} style={btnStyles.iconBtn}>
            <Ionicons name="volume-high-outline" size={18} color={CRIMSON} />
          </Pressable>
        </View>
        <Text style={stylesHero.bubbleSub}>¡Hola! Aprendamos el vocabulario de la familia.</Text>
      </View>
    </View>
  );
}

/* ===================== Acciones rápidas (píldoras horizontales) ===================== */
function QuickActions({
  onRoleplay,
  onCards,
  onTree,
}: {
  onRoleplay: () => void;
  onCards: () => void;
  onTree: () => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={qa.row}>
      <QAPill icon="chatbubbles-outline" title="Roleplay" jp="ロールプレイ" onPress={onRoleplay} />
      <QAPill icon="images-outline" title="Tarjetas" jp="アニメカード" onPress={onCards} />
      <QAPill icon="people-outline" title="Árbol familiar" jp="ファミリーツリー" onPress={onTree} />
    </ScrollView>
  );
}
function QAPill({
  icon,
  title,
  jp,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  jp: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={qa.pill}>
        <Ionicons name={icon} size={18} color={CRIMSON} />
        <View>
          <Text style={qa.title}>{title}</Text>
          <Text style={qa.jp}>{jp}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </Pressable>
    </Animated.View>
  );
}

/* ===================== Secciones (igual que antes) ===================== */

function VocabPairs() {
  return (
    <View style={s.card}>
      <Header icon="book-outline" title="Vocabulario de familia" jp="かぞくのことば" />
      <Text style={s.p}>
        En japonés hay formas para hablar de la <Text style={s.bold}>familia de otra persona</Text> (cortés) y
        formas para <Text style={s.bold}>mi familia</Text> (humildes). Toca el altavoz para escuchar.
      </Text>

      <View style={{ marginTop: 10, gap: 10 }}>
        {FAMILY_PAIRS.map((p, idx) => (
          <VocabPairRow key={idx} pair={p} />
        ))}
      </View>

      <Text style={s.note}>
        Tip: usa <Text style={s.bold}>ご／お</Text> para la familia de otra persona (ごりょうしん, ごかぞく, おにいさん…).
      </Text>
    </View>
  );
}

function VocabPairRow({ pair }: { pair: Pair }) {
  return (
    <View style={stylesPairs.row}>
      <View style={stylesPairs.left}>
        <Text style={stylesPairs.tag}>Cortés</Text>
        <View style={stylesPairs.line}>
          <Text style={stylesPairs.jp}>{pair.politeKana}</Text>
          <PlayBtn onPress={() => speakJA(pair.politeKana)} />
        </View>
        <Text style={stylesPairs.romaji}>{pair.politeRomaji}</Text>
      </View>

      <View style={stylesPairs.mid}>
        <Text style={stylesPairs.es}>{pair.es}</Text>
      </View>

      <View style={stylesPairs.right}>
        <Text style={[stylesPairs.tag, { backgroundColor: "#f1f5ff", borderColor: "#dbeafe", color: "#1d4ed8" }]}>
          Mi familia
        </Text>
        <View style={stylesPairs.line}>
          <Text style={stylesPairs.jp}>{pair.mineKana}</Text>
          <PlayBtn onPress={() => speakJA(pair.mineKana)} />
        </View>
        <Text style={stylesPairs.romaji}>{pair.mineRomaji}</Text>
      </View>
    </View>
  );
}

function PossessiveNoGuide() {
  const ex1 = "わたしのかぞく";
  const ex2 = "せんせいのいもうと";
  const ex3 = "マリオのおとうさん";

  return (
    <View style={s.card}>
      <Header icon="link-outline" title="Posesivo の" jp="の の つかいかた" />
      <Text style={s.p}>
        La partícula <Text style={s.bold}>の</Text> une dos sustantivos: <Text style={s.bold}>A の B</Text> = “B de A”.
      </Text>

      <View style={{ marginTop: 8, gap: 8 }}>
        <ExampleLine ja={ex1} es="mi familia" />
        <ExampleLine ja={ex2} es="la hermana menor del profesor/a" />
        <ExampleLine ja={ex3} es="el papá de Mario" />
      </View>
    </View>
  );
}

function FamilySizePractice() {
  const [n, setN] = useState<number>(4);
  const kana = NIN_KANA[n];
  const romaji = NIN_ROMAJI[n];

  return (
    <View style={s.card}>
      <Header icon="people-outline" title="¿Cuántas personas hay?" jp="なんにん かぞく ですか" />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <PlayBtn onPress={() => speakJA("なんにん かぞく ですか。")} />
        <Text style={s.p}>Escuchar: なんにん かぞく ですか。</Text>
      </View>

      <Text style={[s.p, { marginTop: 8 }]}>
        Responde con <Text style={s.bold}>〜にんです</Text>, excepto 1人＝<Text style={s.bold}>ひとり</Text>, 2人＝
        <Text style={s.bold}>ふたり</Text>.
      </Text>

      <View style={stylesNin.board}>
        <Text style={stylesNin.big}>{kana}</Text>
        <Text style={stylesNin.romaji}>{romaji}</Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
          <PrimaryBtn
            icon="volume-high-outline"
            label="Decir respuesta"
            onPress={() => speakJA(`${kana} です。`)}
          />
          <OutlineBtn icon="refresh-outline" label="Repetir pregunta" onPress={() => speakJA("なんにん かぞく ですか。")} />
        </View>
      </View>

      <View style={stylesNin.chips}>
        {[1,2,3,4,5,6,7,8,9,10].map((k) => (
          <Pressable key={k} style={[stylesNin.chip, n === k && stylesNin.chipActive]} onPress={() => setN(k)}>
            <Text style={[stylesNin.chipTxt, n === k && stylesNin.chipTxtActive]}>{k}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function DialoguePracticeFamily() {
  const [showRomaji, setShowRomaji] = useState(true);
  const [showES, setShowES] = useState(false);

  const linesKana = [
    "こんにちは！ おなまえは？",
    "レズリです。よろしくおねがいします。",
    "なんにん かぞく ですか。",
    "よにん です。",
    "だれと いっしょに すんでいますか。",
    "ちち と はは と いもうと です。",
  ];
  const linesRomaji = [
    "konnichiwa! onamae wa?",
    "Rezuri desu. yoroshiku onegaishimasu.",
    "nannin kazoku desu ka?",
    "yonin desu.",
    "dare to issho ni sunde imasu ka?",
    "chichi to haha to imōto desu.",
  ];
  const linesES = [
    "¡Hola! ¿Cómo te llamas?",
    "Soy Leslie. Mucho gusto.",
    "¿Cuántas personas hay en tu familia?",
    "Somos cuatro.",
    "¿Con quién vives?",
    "Con mi papá, mi mamá y mi hermana menor.",
  ];

  return (
    <View style={s.card}>
      <Header icon="chatbubble-ellipses-outline" title="Diálogo de repaso" jp="かぞくのかいわ" />
      <Text style={s.p}>
        Lee en <Text style={s.bold}>kana</Text>, muestra <Text style={s.bold}>rōmaji</Text> si lo necesitas, y
        escucha el diálogo completo.
      </Text>

      <View style={s.rp}>
        {linesKana.map((k, i) => (
          <DialogLine
            key={i}
            name={i % 2 === 0 ? "せんせい" : "あなた"}
            kana={k}
            romaji={linesRomaji[i]}
            es={linesES[i]}
            showRomaji={showRomaji}
            showES={showES}
          />
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
        <PrimaryBtn icon="volume-high-outline" label="Escuchar diálogo (JA)" onPress={() => speakLinesJA(linesKana)} />
        <OutlineBtn
          icon="text-outline"
          label={showRomaji ? "Ocultar rōmaji" : "Mostrar rōmaji"}
          onPress={() => setShowRomaji((v) => !v)}
        />
        <OutlineBtn
          icon="translate-outline"
          label={showES ? "Ocultar traducción" : "Mostrar traducción"}
          onPress={() => setShowES((v) => !v)}
        />
      </View>
    </View>
  );
}

/* ===================== Piezas UI ===================== */

function ExampleLine({ ja, es }: { ja: string; es: string }) {
  return (
    <View style={{ gap: 2 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={s.rpLine}>{ja}</Text>
        <PlayBtn onPress={() => speakJA(ja)} />
      </View>
      <Text style={[s.note, { marginLeft: 6 }]}>{es}</Text>
    </View>
  );
}

function Header({ icon, title, jp }: { icon: keyof typeof Ionicons.glyphMap; title: string; jp: string }) {
  return (
    <View style={s.hRow}>
      <View style={s.iconBox}><Ionicons name={icon} size={18} color={CRIMSON} /></View>
      <View>
        <Text style={s.h1}>{title}</Text>
        <Text style={s.h2}>{jp}</Text>
      </View>
    </View>
  );
}

function DialogLine({
  name,
  kana,
  romaji,
  es,
  showRomaji,
  showES,
}: {
  name: string;
  kana: string;
  romaji: string;
  es: string;
  showRomaji: boolean;
  showES: boolean;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={s.rpName}>{name}：</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={s.rpLine}>{kana}</Text>
        <PlayBtn onPress={() => speakJA(kana)} />
      </View>
      {showRomaji ? <Text style={[s.rpLine, { color: "#374151" }]}>{romaji}</Text> : null}
      {showES ? <Text style={[s.rpLine, { color: "#6B7280" }]}>{es}</Text> : null}
    </View>
  );
}

function PlayBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btnStyles.iconBtn}>
      <Ionicons name="volume-high-outline" size={18} color={CRIMSON} />
    </Pressable>
  );
}

function PrimaryBtn({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btnStyles.primary}>
      <Ionicons name={icon} size={18} color="#fff" />
      <Text style={btnStyles.primaryTxt}>{label}</Text>
    </Pressable>
  );
}

function OutlineBtn({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btnStyles.outline}>
      <Ionicons name={icon} size={18} color={CRIMSON} />
      <Text style={btnStyles.outlineTxt}>{label}</Text>
    </Pressable>
  );
}

/** 🌸 lluvia de sakura en el fondo */
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
    [count, width]
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {petals.map((p) => (
        <Petal key={p.id} {...p} H={height} />
      ))}
    </View>
  );
}
function Petal({
  size, x, delay, rotStart, duration, H,
}: { size:number; x:number; delay:number; rotStart:number; duration:number; H:number }) {
  const y = useRef(new Animated.Value(-size - 20)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    const fall = () => {
      if (!alive) return;
      y.setValue(-size - 20);
      Animated.timing(y, { toValue: H + size + 20, duration, easing: Easing.linear, useNativeDriver: true })
        .start(() => { if (alive) setTimeout(fall, Math.random() * 1000); });
    };
    const rotLoop = Animated.loop(Animated.timing(rot, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const start = setTimeout(() => { fall(); rotLoop.start(); swayLoop.start(); }, delay);
    return () => { alive = false; clearTimeout(start); rot.stopAnimation(); sway.stopAnimation(); y.stopAnimation(); };
  }, [H, delay, duration, rot, size, sway, y]);

  const translateX = Animated.add(new Animated.Value(x), sway.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] }));
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: [`${rotStart}deg`, `${rotStart + 180}deg`] });

  return (
    <Animated.View style={[s.petal, { width:size, height:size*1.4, borderRadius:size, transform:[{ translateX }, { translateY:y }, { rotate }] }]} />
  );
}

/* ===================== Estilos ===================== */
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";
const GOLD = "#C6A15B";
const WASHI = "#fffdf7";

const s = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  header: {
    backgroundColor: WASHI,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  kicker: { color: CRIMSON, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "900", color: INK, marginTop: 2 },
  subtitle: { color: "#6B7280", marginTop: 4 },

  p: { color: "#374151", marginTop: 4, lineHeight: 20 },
  kbd: { fontWeight: "900", color: INK },
  bold: { fontWeight: "900", color: INK },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 14,
    padding: 14,
  },
  hRow: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 6 },
  iconBox: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: "#f2c9cf", backgroundColor: "#fff5f6", alignItems: "center", justifyContent: "center" },
  h1: { fontSize: 16, fontWeight: "900", color: INK },
  h2: { fontSize: 12, color: "#6B7280" },

  note: { marginTop: 8, color: "#6B7280", fontSize: 12, lineHeight: 18 },

  rp: { backgroundColor: "#fffdf8", borderColor: "#F3E7C9", borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 6 },
  rpName: { color: CRIMSON, fontWeight: "900" },
  rpLine: { color: "#374151", marginLeft: 6, marginBottom: 4 },

  petal: { position: "absolute", top: -30, left: 0, backgroundColor: "#FFD7E6", borderWidth: 1, borderColor: "#F9AFC6", opacity: 0.8 },
});

const stylesPairs = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fff",
  },
  left: { flex: 1 },
  mid: { width: 100, alignItems: "center", justifyContent: "center" },
  right: { flex: 1 },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#fde2e7",
    backgroundColor: "#fff5f6",
    color: CRIMSON,
    fontWeight: "900",
    fontSize: 11,
  },
  line: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  jp: { color: INK, fontWeight: "700" },
  romaji: { color: "#6B7280", fontSize: 12, marginTop: 2 },
  es: { color: INK, fontWeight: "800" },
});

const stylesNin = StyleSheet.create({
  board: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  big: { fontSize: 24, fontWeight: "900", color: INK },
  romaji: { color: "#6B7280", marginTop: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff5f6",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#f2c9cf",
  },
  chipActive: { backgroundColor: CRIMSON, borderColor: CRIMSON },
  chipTxt: { color: CRIMSON, fontWeight: "800" },
  chipTxtActive: { color: "#fff", fontWeight: "900" },
});

/* ===================== Hero styles + Quick actions ===================== */
const stylesHero = StyleSheet.create({
  wrap: {
    width: "100%",
    backgroundColor: "#FFF7F9",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    borderBottomWidth: 1,
    borderColor: "#F3E0E5",
  },
  inner: { flex: 1, alignItems: "center", justifyContent: "center" },
  img: { width: "90%", height: "90%" },
  ring: {
    position: "absolute",
    width: "82%",
    height: "70%",
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: "#f2c9cf",
    backgroundColor: "#fff5f6",
    opacity: 0.4,
  },
  bubble: {
    position: "absolute",
    bottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  bubbleTxt: { fontWeight: "900", color: INK },
  bubbleSub: { color: "#6B7280", fontSize: 12, marginTop: 2 },
});

const qa = StyleSheet.create({
  row: { paddingVertical: 6, gap: 10, paddingHorizontal: 2 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  title: { fontWeight: "900", color: INK, marginBottom: 2 },
  jp: { color: "#6B7280", fontSize: 12 },
});

/* ===================== Botones ===================== */
const btnStyles = StyleSheet.create({
  iconBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#fff5f6",
    borderWidth: 1,
    borderColor: "#f2c9cf",
  },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: CRIMSON,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryTxt: { color: "#fff", fontWeight: "900" },
  outline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CRIMSON,
    backgroundColor: "#fff",
  },
  outlineTxt: { color: CRIMSON, fontWeight: "900" },
});
