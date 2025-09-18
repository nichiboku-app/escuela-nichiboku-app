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
  View,
} from "react-native";
import type { RootStackParamList } from "../../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const AVATAR: ImageSourcePropType = require("../../../../assets/images/avatar_profesor.webp");

/* ===================== Utilidades de audio ===================== */
function speakJA(text: string) {
  Speech.speak(text, { language: "ja-JP", rate: 0.95 });
}
function speakES(text: string) {
  Speech.speak(text, { language: "es-MX", rate: 1.0 });
}
function speakLinesJA(lines: string[], i = 0) {
  if (i >= lines.length) return;
  Speech.speak(lines[i], {
    language: "ja-JP",
    rate: 0.95,
    onDone: () => speakLinesJA(lines, i + 1),
  });
}

/* ===================== Número → kanji/kana/romaji ===================== */
const DIGITS = {
  0: { kanji: "零", kana: "れい", romaji: "rei" }, // también ゼロ
  1: { kanji: "一", kana: "いち", romaji: "ichi" },
  2: { kanji: "二", kana: "に", romaji: "ni" },
  3: { kanji: "三", kana: "さん", romaji: "san" },
  4: { kanji: "四", kana: "よん", romaji: "yon" }, // estándar didáctico: yon / nana / kyū
  5: { kanji: "五", kana: "ご", romaji: "go" },
  6: { kanji: "六", kana: "ろく", romaji: "roku" },
  7: { kanji: "七", kana: "なな", romaji: "nana" },
  8: { kanji: "八", kana: "はち", romaji: "hachi" },
  9: { kanji: "九", kana: "きゅう", romaji: "kyū" },
} as const;

function compose0to999(n: number) {
  const clamp = Math.max(0, Math.min(999, Math.floor(n)));
  const h = Math.floor(clamp / 100);
  const t = Math.floor((clamp % 100) / 10);
  const u = clamp % 10;

  if (clamp === 0) {
    return {
      kanji: "零（ゼロ）",
      kana: "れい（ゼロ）",
      romaji: "rei (zero)",
      readableKana: "れい",
    };
  }

  // cientos (百) con excepciones
  let hyakuKana = "";
  let hyakuRomaji = "";
  let hyakuKanji = "";
  if (h > 0) {
    switch (h) {
      case 1:
        hyakuKanji = "百";
        hyakuKana = "ひゃく";
        hyakuRomaji = "hyaku";
        break;
      case 3:
        hyakuKanji = "三百";
        hyakuKana = "さんびゃく";
        hyakuRomaji = "sanbyaku";
        break;
      case 6:
        hyakuKanji = "六百";
        hyakuKana = "ろっぴゃく";
        hyakuRomaji = "roppyaku";
        break;
      case 8:
        hyakuKanji = "八百";
        hyakuKana = "はっぴゃく";
        hyakuRomaji = "happyaku";
        break;
      default:
        hyakuKanji = `${DIGITS[h as 1 | 2 | 4 | 5 | 7 | 9].kanji}百`;
        hyakuKana = `${DIGITS[h as 1 | 2 | 4 | 5 | 7 | 9].kana}ひゃく`;
        hyakuRomaji = `${DIGITS[h as 1 | 2 | 4 | 5 | 7 | 9].romaji}hyaku`;
    }
  }

  // decenas (十)
  let juuKanji = "";
  let juuKana = "";
  let juuRomaji = "";
  if (t > 0) {
    if (t === 1) {
      juuKanji = "十";
      juuKana = "じゅう";
      juuRomaji = "jū";
    } else {
      juuKanji = `${DIGITS[t as 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9].kanji}十`;
      juuKana = `${DIGITS[t as 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9].kana}じゅう`;
      const base = DIGITS[t as 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9].romaji;
      juuRomaji = `${base}jū`;
    }
  }

  // unidades
  let unitKanji = "";
  let unitKana = "";
  let unitRomaji = "";
  if (u > 0) {
    unitKanji = DIGITS[u as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9].kanji;
    unitKana = DIGITS[u as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9].kana;
    unitRomaji = DIGITS[u as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9].romaji;
  }

  const kanji = [hyakuKanji, juuKanji, unitKanji].filter(Boolean).join("");
  const kana = [hyakuKana, juuKana, unitKana].filter(Boolean).join("");
  const romaji = [hyakuRomaji, (t > 0 ? (t === 1 ? "jū" : juuRomaji) : ""), unitRomaji].filter(Boolean).join(" ");

  return { kanji, kana, romaji, readableKana: kana };
}

/* ===================== Pantalla ===================== */
export default function B3_NumerosEdad() {
  const navigation = useNavigation<Nav>();
  return (
    <View style={{ flex: 1, backgroundColor: PAPER }}>
      <SakuraRain count={14} />
      <ScrollView contentContainerStyle={s.container}>
        <View style={s.header}>
          <Text style={s.kicker}>語彙ブロック 3</Text>
          <Text style={s.title}>数字と年齢（すうじ・ねんれい）</Text>
          <Text style={s.subtitle}>Números y edad – contar objetos, decir años</Text>
        </View>

        <View style={s.avatarWrap}>
          <AnimatedAvatar source={AVATAR} />
          <View style={s.bubble}>
            <Text style={s.bubbleTxt}>こんにちは！ はじめましょう。</Text>
            <Text style={s.bubbleSub}>¡Hola! ¡Empecemos!</Text>
          </View>
        </View>

        <View style={s.actionsRow}>
          <ActionCard
            icon="happy-outline"
            title="Roleplay con avatar"
            jp="ロールプレイ"
            onPress={() => navigation.navigate("B3_NumerosEdad_Roleplay" as never)}
          />
          <ActionCard
            icon="images-outline"
            title="Tarjetas animadas"
            jp="アニメカード"
            onPress={() => navigation.navigate("B3_NumerosEdad_Tarjetas" as never)}
          />
          <ActionCard
            icon="pricetags-outline"
            title="Contar objetos"
            jp="カウンター"
            onPress={() => navigation.navigate("B3_NumerosEdad_Contadores" as never)}
          />
        </View>

        {/* Números con audio (0–10, decenas, 100) + explicación */}
        <GuideNumbers />

        {/* Composición 0–999 con audio */}
        <NumberComposer />

        {/* Contadores con audio y explicación */}
        <GuideCounters />

        {/* Decir y preguntar edad (incluye audio) */}
        <GuideAge />

        {/* Diálogo de repaso, con toggle de traducción y audio continuo */}
        <DialoguePractice />

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

/* ===================== Subcomponentes (visual) ===================== */

function AnimatedAvatar({ source }: { source: ImageSourcePropType }) {
  const bob = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(wave, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(wave, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [bob, wave]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const rotate = wave.interpolate({ inputRange: [0, 1], outputRange: ["-4deg", "4deg"] });

  return (
    <View style={s.avatarBox}>
      <Sparkles />
      <Animated.Image
        source={source}
        resizeMode="contain"
        style={[
          s.avatar,
          { transform: [{ translateY }, { translateX: -12 }, { rotate }, { translateX: 12 }] },
        ]}
      />
    </View>
  );
}

function Sparkles() {
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      ).start();
    loop(a1, 0);
    loop(a2, 400);
    loop(a3, 800);
  }, [a1, a2, a3]);

  const k = (v: Animated.Value, tx: number, ty: number) => ({
    transform: [
      { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [tx, tx + 4] }) },
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [ty, ty - 6] }) },
      { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.1] }) },
    ],
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }),
  });

  return (
    <>
      <Animated.Text style={[s.sparkle, k(a1, 6, 2)]}>✦</Animated.Text>
      <Animated.Text style={[s.sparkle, k(a2, 90, 10)]}>✦</Animated.Text>
      <Animated.Text style={[s.sparkle, k(a3, 70, -4)]}>✦</Animated.Text>
    </>
  );
}

function ActionCard({
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
    <Animated.View style={[s.actionCard, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={s.actionInner}>
        <Ionicons name={icon} size={22} color={CRIMSON} />
        <View style={{ flex: 1 }}>
          <Text style={s.actionTitle}>{title}</Text>
          <Text style={s.actionJP}>{jp}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </Pressable>
    </Animated.View>
  );
}

/* ---------- Guías didácticas ----------- */

function GuideNumbers() {
  const base = useMemo(
    () => [
      ["0", "零／れい（ゼロ）", "rei (zero)", "れい"],
      ["1", "一／いち", "ichi", "いち"],
      ["2", "二／に", "ni", "に"],
      ["3", "三／さん", "san", "さん"],
      ["4", "四／よん", "yon", "よん"],
      ["5", "五／ご", "go", "ご"],
      ["6", "六／ろく", "roku", "ろく"],
      ["7", "七／なな", "nana", "なな"],
      ["8", "八／はち", "hachi", "はち"],
      ["9", "九／きゅう", "kyū", "きゅう"],
      ["10", "十／じゅう", "jū", "じゅう"],
    ],
    []
  );
  const tens = useMemo(
    () => [
      ["20", "二十／にじゅう", "nijū", "にじゅう"],
      ["30", "三十／さんじゅう", "sanjū", "さんじゅう"],
      ["40", "四十／よんじゅう", "yonjū", "よんじゅう"],
      ["50", "五十／ごじゅう", "gojū", "ごじゅう"],
      ["60", "六十／ろくじゅう", "rokujū", "ろくじゅう"],
      ["70", "七十／ななじゅう", "nanajū", "ななじゅう"],
      ["80", "八十／はちじゅう", "hachijū", "はちじゅう"],
      ["90", "九十／きゅうじゅう", "kyūjū", "きゅうじゅう"],
      ["100", "百／ひゃく", "hyaku", "ひゃく"],
    ],
    []
  );

  return (
    <View style={s.card}>
      <Header icon="calculator-outline" title="Números básicos" jp="基本の数字" />
      <Text style={s.p}>
        Pulsa el altavoz para escuchar. Debajo verás cómo se componen los números hasta 999 con el
        compositor interactivo.
      </Text>

      <View style={s.table}>
        {base.map((r, i) => (
          <AudioRow key={`b-${i}`} a={r[0]} b={r[1]} c={r[2]} speakKana={r[3]} />
        ))}
      </View>

      <Text style={[s.bold, { marginTop: 10 }]}>Decenas y 100</Text>
      <View style={s.table}>
        {tens.map((r, i) => (
          <AudioRow key={`t-${i}`} a={r[0]} b={r[1]} c={r[2]} speakKana={r[3]} />
        ))}
      </View>

      <Text style={s.note}>
        11–19: 十 + número (11＝十一、16＝十六).{"\n"}
        20,30…90: 二十、三十…九十. {"\n"}
        21, 34, etc.: 二十一（にじゅういち）, 三十四（さんじゅうよん）…
      </Text>
    </View>
  );
}

function NumberComposer() {
  const [n, setN] = useState(342);
  const d = useMemo(() => compose0to999(n), [n]);

  const dec = () => setN((v) => Math.max(0, v - 1));
  const inc = () => setN((v) => Math.min(999, v + 1));

  const quicks = [0, 8, 14, 20, 38, 99, 100, 101, 300, 666, 800, 999];

  return (
    <View style={s.card}>
      <Header icon="construct-outline" title="Composición 0–999" jp="0〜999の作り方" />

      <View style={stylesComposer.box}>
        <View style={stylesComposer.ctrls}>
          <IconBtn name="remove-circle-outline" onPress={dec} />
          <Text style={stylesComposer.bigNum}>{n}</Text>
          <IconBtn name="add-circle-outline" onPress={inc} />
        </View>

        <View style={stylesComposer.line}>
          <Text style={stylesComposer.kLabel}>Kanji:</Text>
          <Text style={stylesComposer.kValue}>{d.kanji}</Text>
        </View>
        <View style={stylesComposer.line}>
          <Text style={stylesComposer.kLabel}>Kana:</Text>
          <Text style={stylesComposer.kValue}>{d.kana}</Text>
          <IconBtn name="volume-high-outline" onPress={() => speakJA(d.readableKana)} />
        </View>
        <View style={stylesComposer.line}>
          <Text style={stylesComposer.kLabel}>Romaji:</Text>
          <Text style={stylesComposer.kValue}>{d.romaji}</Text>
        </View>

        <Text style={s.note}>
          Fórmula: <Text style={s.bold}>[cientos] + [decenas] + [unidades]</Text>.{"\n"}
          Excepciones: 300＝さん<Text style={s.bold}>びゃく</Text>, 600＝ろっ<Text style={s.bold}>ぴゃく</Text>, 800＝はっ<Text style={s.bold}>ぴゃく</Text>.{"\n"}
          En 10–19 no se pone 「一十」, solo 「十」＋unidad (p. ej., 14＝十四).
        </Text>

        <View style={stylesComposer.quickRow}>
          {quicks.map((q) => (
            <Pressable key={q} onPress={() => setN(q)} style={stylesComposer.chip}>
              <Text style={stylesComposer.chipTxt}>{q}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function GuideCounters() {
  return (
    <View style={s.card}>
      <Header icon="pricetags-outline" title="Contadores (clasificadores)" jp="助数詞（じょすうし）" />
      <Text style={s.p}>
        En japonés usamos un <Text style={s.bold}>contador</Text> según el tipo de cosa que contamos. Aprende estas
        formas irregulares con audio:
      </Text>

      <CounterBlock
        title="Genérico ～つ（つ）"
        examples={[
          ["1", "ひとつ", "hitotsu"],
          ["2", "ふたつ", "futatsu"],
          ["3", "みっつ", "mittsu"],
          ["4", "よっつ", "yottsu"],
          ["5", "いつつ", "itsutsu"],
          ["6", "むっつ", "muttsu"],
          ["7", "ななつ", "nanatsu"],
          ["8", "やっつ", "yattsu"],
          ["9", "ここのつ", "kokonotsu"],
          ["10", "とお", "tō"],
        ]}
        note="Usa 〜つ para objetos en general (1–10)."
      />

      <CounterBlock
        title="Personas ～人（にん）"
        examples={[
          ["1", "ひとり", "hitori"],
          ["2", "ふたり", "futari"],
          ["3", "さんにん", "sannin"],
          ["4", "よにん", "yonin"],
          ["5", "ごにん", "gonin"],
          ["6", "ろくにん", "rokunin"],
          ["7", "ななにん", "nananin"],
          ["8", "はちにん", "hachinin"],
          ["9", "きゅうにん", "kyūnin"],
          ["10", "じゅうにん", "jūnin"],
        ]}
        note="Excepciones: 1人＝ひとり, 2人＝ふたり."
      />

      <CounterBlock
        title="Objetos largos ～本（ほん）"
        examples={[
          ["1", "いっぽん", "ippon"],
          ["2", "にほん", "nihon"],
          ["3", "さんぼん", "sanbon"],
          ["4", "よんほん", "yonhon"],
          ["5", "ごほん", "gohon"],
          ["6", "ろっぽん", "roppon"],
          ["7", "ななほん", "nanahon"],
          ["8", "はっぽん", "happon"],
          ["9", "きゅうほん", "kyūhon"],
          ["10", "じゅっぽん", "juppon"],
        ]}
        note="Lápices, botellas, paraguas… atención a 1/3/6/8/10 (pon/bon)."
      />

      <CounterBlock
        title="Animales pequeños ～匹（ひき）"
        examples={[
          ["1", "いっぴき", "ippiki"],
          ["2", "にひき", "nihiki"],
          ["3", "さんびき", "sanbiki"],
          ["4", "よんひき", "yonhiki"],
          ["5", "ごひき", "gohiki"],
          ["6", "ろっぴき", "roppiki"],
          ["7", "ななひき", "nanahiki"],
          ["8", "はっぴき", "happiki"],
          ["9", "きゅうひき", "kyūhiki"],
          ["10", "じゅっぴき", "juppiki"],
        ]}
        note="Cambios fonéticos p/b en 1,3,6,8,10."
      />

      <CounterBlock
        title="Cosas planas ～枚（まい）"
        examples={[
          ["1", "いちまい", "ichimai"],
          ["2", "にまい", "nimai"],
          ["3", "さんまい", "sanmai"],
          ["4", "よんまい", "yonmai"],
          ["5", "ごまい", "gomai"],
          ["6", "ろくまい", "rokumai"],
          ["7", "ななまい", "nanamai"],
          ["8", "はちまい", "hachimai"],
          ["9", "きゅうまい", "kyūmai"],
          ["10", "じゅうまい", "jūmai"],
        ]}
        note="Papel, tickets, platos, láminas."
      />

      <CounterBlock
        title="Libros/cuadernos ～冊（さつ）"
        examples={[
          ["1", "いっさつ", "issatsu"],
          ["2", "にさつ", "nisatsu"],
          ["3", "さんさつ", "sansatsu"],
          ["4", "よんさつ", "yonsatsu"],
          ["5", "ごさつ", "gosatsu"],
          ["6", "ろくさつ", "rokusatsu"],
          ["7", "ななさつ", "nanasatsu"],
          ["8", "はっさつ", "hassatsu"],
          ["9", "きゅうさつ", "kyūsatsu"],
          ["10", "じゅっさつ", "jussatsu"],
        ]}
        note="Atención a 1/8/10 (sokuon)."
      />
    </View>
  );
}

function GuideAge() {
  return (
    <View style={s.card}>
      <Header icon="hourglass-outline" title="Decir y preguntar la edad" jp="年齢の言い方" />
      <Text style={s.p}>
        <Text style={s.kbd}>¿Cuántos años tienes?</Text> → なんさいですか。/（más cortés）おいくつですか。{"\n"}
        <Text style={s.kbd}>Tengo 17 años.</Text> → 17歳（じゅうななさい）です。
      </Text>

      <Bullet
        title="Excepciones de lectura"
        body="1歳＝いっさい, 8歳＝はっさい, 10歳＝じゅっさい/じっさい, 20歳＝はたち（especial）."
      />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
        <PlayBtn onPress={() => speakJA("なんさいですか。")} />
        <Text style={s.note}>Escuchar: なんさいですか。</Text>
      </View>

      <Text style={s.note}>
        {"Ejemplos:\n"}
        <Text>・私は</Text>
        <Text style={s.bold}>二十歳</Text>
        <Text>（はたち）です。{"\n"}</Text>

        <Text>・弟（おとうと）は</Text>
        <Text style={s.bold}>八歳</Text>
        <Text>（はっさい）です。</Text>
      </Text>
    </View>
  );
}

function DialoguePractice() {
  const [showES, setShowES] = useState(false);
  const [showRomaji, setShowRomaji] = useState(true); // 🔊 Romaji visible por defecto

  // ❗Solo kana/katakana (sin kanji)
  const linesKana = [
    "こんにちは！ おなまえは？",
    "マリオです。よろしくおねがいします。",
    "なんさいですか。",
    "はたちです。",
    "りんごをみっつください。",
    "ペンをさんぼんください。",
  ];

  // Romaji (coincide 1 a 1 con linesKana)
  const linesRomaji = [
    "konnichiwa! onamae wa?",
    "Mario desu. yoroshiku onegaishimasu.",
    "nansai desu ka?",
    "hatachi desu.",
    "ringo o mittsu kudasai.",
    "pen o sanbon kudasai.",
  ];

  const linesES = [
    "¡Hola! ¿Cómo te llamas?",
    "Soy Mario. Mucho gusto.",
    "¿Cuántos años tienes?",
    "Tengo 20 años.",
    "Por favor, deme tres manzanas.",
    "Por favor, deme tres plumas (bolígrafos).",
  ];

  return (
    <View style={s.card}>
      <Header icon="chatbubble-ellipses-outline" title="Diálogo de repaso" jp="まとめ会話" />
      <Text style={s.p}>
        Intenta traducir sin ver el español. Puedes mostrar el <Text style={s.bold}>rōmaji</Text> si lo necesitas.
        Pulsa el altavoz para escuchar el diálogo completo en japonés.
      </Text>

      <View style={s.rp}>
        <DialogLine name="せんせい" kana={linesKana[0]} romaji={linesRomaji[0]} es={linesES[0]} showRomaji={showRomaji} showES={showES} />
        <DialogLine name="あなた" kana={linesKana[1]} romaji={linesRomaji[1]} es={linesES[1]} showRomaji={showRomaji} showES={showES} />
        <DialogLine name="せんせい" kana={linesKana[2]} romaji={linesRomaji[2]} es={linesES[2]} showRomaji={showRomaji} showES={showES} />
        <DialogLine name="あなた" kana={linesKana[3]} romaji={linesRomaji[3]} es={linesES[3]} showRomaji={showRomaji} showES={showES} />
        <DialogLine name="せんせい" kana={linesKana[4]} romaji={linesRomaji[4]} es={linesES[4]} showRomaji={showRomaji} showES={showES} />
        <DialogLine name="あなた" kana={linesKana[5]} romaji={linesRomaji[5]} es={linesES[5]} showRomaji={showRomaji} showES={showES} />
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
        <PrimaryBtn
          icon="volume-high-outline"
          label="Escuchar diálogo (JA)"
          onPress={() => speakLinesJA(linesKana)}
        />
        <OutlineBtn
          icon="text-outline"
          label={showRomaji ? "Ocultar rōmaji" : "Mostrar rōmaji"}
          onPress={() => setShowRomaji(v => !v)}
        />
        <OutlineBtn
          icon="translate-outline"
          label={showES ? "Ocultar traducción" : "Mostrar traducción"}
          onPress={() => setShowES(v => !v)}
        />
      </View>
    </View>
  );
}

/* ---------- piezas UI reutilizables ---------- */

function Header({ icon, title, jp }: { icon: keyof typeof Ionicons.glyphMap; title: string; jp: string }) {
  return (
    <View style={s.hRow}>
      <View style={s.iconBox}>
        <Ionicons name={icon} size={18} color={CRIMSON} />
      </View>
      <View>
        <Text style={s.h1}>{title}</Text>
        <Text style={s.h2}>{jp}</Text>
      </View>
    </View>
  );
}

function Row({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <View style={s.row}>
      <Text style={s.cellA}>{a}</Text>
      <Text style={s.cellB}>{b}</Text>
      <Text style={s.cellC}>{c}</Text>
    </View>
  );
}

function AudioRow({ a, b, c, speakKana }: { a: string; b: string; c: string; speakKana: string }) {
  return (
    <View style={[s.row, { alignItems: "center" }]}>
      <Text style={s.cellA}>{a}</Text>
      <Text style={s.cellB}>{b}</Text>
      <Text style={s.cellC}>{c}</Text>
      <PlayBtn onPress={() => speakJA(speakKana)} />
    </View>
  );
}

function Bullet({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={s.bulletTitle}>• {title}</Text>
      <Text style={s.bulletBody}>{body}</Text>
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

function IconBtn({ name, onPress }: { name: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={btnStyles.iconRound}>
      <Ionicons name={name} size={22} color={CRIMSON} />
    </Pressable>
  );
}

function PrimaryBtn({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={btnStyles.primary}>
      <Ionicons name={icon} size={18} color="#fff" />
      <Text style={btnStyles.primaryTxt}>{label}</Text>
    </Pressable>
  );
}

function OutlineBtn({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={btnStyles.outline}>
      <Ionicons name={icon} size={18} color={CRIMSON} />
      <Text style={btnStyles.outlineTxt}>{label}</Text>
    </Pressable>
  );
}

function CounterBlock({
  title,
  examples,
  note,
}: {
  title: string;
  examples: [string, string, string][];
  note?: string;
}) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={s.bulletTitle}>{title}</Text>
      <View style={{ marginTop: 6, gap: 6 }}>
        {examples.map(([num, kana, romaji]) => (
          <View key={`${title}-${num}`} style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[s.cellA, { width: 36 }]}>{num}</Text>
            <Text style={[s.cellB, { flex: 0 }]}>{kana}</Text>
            <Text style={[s.cellC, { width: 100, textAlign: "left" }]}>{romaji}</Text>
            <PlayBtn onPress={() => speakJA(kana)} />
          </View>
        ))}
      </View>
      {note ? <Text style={s.note}>{note}</Text> : null}
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
  size,
  x,
  delay,
  rotStart,
  duration,
  H,
}: {
  size: number;
  x: number;
  delay: number;
  rotStart: number;
  duration: number;
  H: number;
}) {
  const y = useRef(new Animated.Value(-size - 20)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    const fall = () => {
      if (!alive) return;
      y.setValue(-size - 20);
      Animated.timing(y, { toValue: H + size + 20, duration, easing: Easing.linear, useNativeDriver: true }).start(
        () => {
          if (alive) setTimeout(fall, Math.random() * 1000);
        }
      );
    };
    const rotLoop = Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
    );
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const start = setTimeout(() => {
      fall();
      rotLoop.start();
      swayLoop.start();
    }, delay);
    return () => {
      alive = false;
      clearTimeout(start);
      rot.stopAnimation();
      sway.stopAnimation();
      y.stopAnimation();
    };
  }, [H, delay, duration, rot, size, sway, y]);

  const translateX = Animated.add(
    new Animated.Value(x),
    sway.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] })
  );
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: [`${rotStart}deg`, `${rotStart + 180}deg`] });

  return (
    <Animated.View
      style={[
        s.petal,
        { width: size, height: size * 1.4, borderRadius: size, transform: [{ translateX }, { translateY: y }, { rotate }] },
      ]}
    />
  );
}

/* ===================== estilos ===================== */
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

  avatarWrap: { marginTop: 10, alignItems: "center" },
  avatarBox: { width: 200, height: 200, alignItems: "center", justifyContent: "center" },
  avatar: { width: "100%", height: "100%" },
  sparkle: { position: "absolute", fontSize: 14, color: GOLD, opacity: 0.7 },

  bubble: {
    marginTop: 8,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  bubbleTxt: { fontWeight: "900", color: INK },
  bubbleSub: { color: "#6B7280", fontSize: 12, marginTop: 2 },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  actionInner: { padding: 14, gap: 8, flexDirection: "row", alignItems: "center" },
  actionTitle: { fontWeight: "900", color: INK },
  actionJP: { color: "#6B7280", fontSize: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 14,
    padding: 14,
  },
  hRow: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 6 },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f2c9cf",
    backgroundColor: "#fff5f6",
    alignItems: "center",
    justifyContent: "center",
  },
  h1: { fontSize: 16, fontWeight: "900", color: INK },
  h2: { fontSize: 12, color: "#6B7280" },

  table: { borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 12, overflow: "hidden" },
  row: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "#fff" },
  cellA: { width: 48, fontWeight: "900", color: INK },
  cellB: { flex: 1, color: "#374151" },
  cellC: { width: 96, textAlign: "right", color: "#6B7280" },

  p: { color: "#374151", marginTop: 4, lineHeight: 20 },
  kbd: { fontWeight: "900", color: INK },
  bold: { fontWeight: "900", color: INK },

  bulletTitle: { fontWeight: "900", color: INK, marginTop: 6 },
  bulletBody: { color: "#374151", marginTop: 2 },

  note: { marginTop: 8, color: "#6B7280", fontSize: 12, lineHeight: 18 },

  rp: {
    backgroundColor: "#fffdf8",
    borderColor: "#F3E7C9",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
  },
  rpName: { color: CRIMSON, fontWeight: "900" },
  rpLine: { color: "#374151", marginLeft: 6, marginBottom: 4 },

  petal: { position: "absolute", top: -30, left: 0, backgroundColor: "#FFD7E6", borderWidth: 1, borderColor: "#F9AFC6", opacity: 0.8 },
});

/* estilos específicos del compositor */
const stylesComposer = StyleSheet.create({
  box: { gap: 8, marginTop: 6 },
  ctrls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bigNum: { fontSize: 28, fontWeight: "900", color: INK },
  line: { flexDirection: "row", alignItems: "center", gap: 8 },
  kLabel: { width: 66, color: "#6B7280" },
  kValue: { flex: 1, color: INK, fontWeight: "600" },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff5f6",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#f2c9cf",
  },
  chipTxt: { color: CRIMSON, fontWeight: "800" },
});

/* botones */
const btnStyles = StyleSheet.create({
  iconBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#fff5f6",
    borderWidth: 1,
    borderColor: "#f2c9cf",
  },
  iconRound: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
