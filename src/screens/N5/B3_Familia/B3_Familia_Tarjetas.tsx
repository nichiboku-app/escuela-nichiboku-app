import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* =================== datos =================== */
type Pair = {
  es: string;
  politeKana: string; politeRomaji: string;
  mineKana: string;  mineRomaji: string;
};

const FAMILY: Pair[] = [
  { es: "padre",           politeKana: "おとうさん", politeRomaji: "otōsan",  mineKana: "ちち",   mineRomaji: "chichi" },
  { es: "madre",           politeKana: "おかあさん", politeRomaji: "okāsan",  mineKana: "はは",   mineRomaji: "haha" },
  { es: "hermano mayor",   politeKana: "おにいさん", politeRomaji: "onīsan",  mineKana: "あに",   mineRomaji: "ani" },
  { es: "hermana mayor",   politeKana: "おねえさん", politeRomaji: "onēsan",  mineKana: "あね",   mineRomaji: "ane" },
  { es: "hermano menor",   politeKana: "おとうとさん", politeRomaji: "otōto-san", mineKana: "おとうと", mineRomaji: "otōto" },
  { es: "hermana menor",   politeKana: "いもうとさん", politeRomaji: "imōto-san", mineKana: "いもうと", mineRomaji: "imōto" },
  { es: "abuelo",          politeKana: "おじいさん", politeRomaji: "ojīsan",  mineKana: "そふ",   mineRomaji: "sofu" },
  { es: "abuela",          politeKana: "おばあさん", politeRomaji: "obāsan",  mineKana: "そぼ",   mineRomaji: "sobo" },
  { es: "padres",          politeKana: "ごりょうしん", politeRomaji: "goryōshin", mineKana: "りょうしん", mineRomaji: "ryōshin" },
  { es: "familia",         politeKana: "ごかぞく", politeRomaji: "gokazoku", mineKana: "かぞく",  mineRomaji: "kazoku" },
];

type Mode = "polite" | "mine";
type Card = {
  es: string;
  frontJP: string; frontRo: string; frontLabel: string;
  backJP: string;  backRo: string;  backLabel: string;
};

function makeDeck(mode: Mode): Card[] {
  return FAMILY.map(p => ({
    es: p.es,
    frontJP:   mode === "polite" ? p.politeKana  : p.mineKana,
    frontRo:   mode === "polite" ? p.politeRomaji: p.mineRomaji,
    frontLabel:mode === "polite" ? "Cortés"      : "Mi familia",
    backJP:    mode === "polite" ? p.mineKana    : p.politeKana,
    backRo:    mode === "polite" ? p.mineRomaji  : p.politeRomaji,
    backLabel: mode === "polite" ? "Mi familia"  : "Cortés",
  }));
}

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* =================== audio helpers =================== */
function speakJP(text: string, voice?: string, hasJa?: boolean, warned?: React.MutableRefObject<boolean>) {
  Speech.stop();
  const opts: any = { language: "ja-JP", rate: 1.0, pitch: 1.05 };
  if (voice) opts.voice = voice;
  if (!hasJa && warned && !warned.current) {
    warned.current = true;
    Alert.alert(
      "Instala voz japonesa",
      Platform.OS === "android"
        ? "Ajustes → Administración general → Idioma y entrada → Salida de texto a voz → Motor de Google → Instalar datos de voz → 日本語."
        : "iOS: Ajustes → Accesibilidad → Contenido hablado → Voces → Japonés.",
      [{ text: "Ok" }],
    );
  }
  Speech.speak(text, opts);
}

function speakBoth(jp: string, es: string, voice?: string, hasJa?: boolean, warned?: React.MutableRefObject<boolean>) {
  Speech.stop();
  const jpOpts: any = { language: "ja-JP", rate: 1.0, pitch: 1.05 };
  if (voice) jpOpts.voice = voice;
  if (!hasJa && warned && !warned.current) {
    warned.current = true;
    Alert.alert(
      "Instala voz japonesa",
      Platform.OS === "android"
        ? "Ajustes → Administración general → Idioma y entrada → Salida de texto a voz → Motor de Google → Instalar datos de voz → 日本語."
        : "iOS: Ajustes → Accesibilidad → Contenido hablado → Voces → Japonés.",
      [{ text: "Ok" }],
    );
  }
  Speech.speak(jp, {
    ...jpOpts,
    onDone: () => Speech.speak(es, { language: "es-MX", rate: 1.0 }),
    onError: () => Speech.speak(es, { language: "es-MX", rate: 1.0 }),
  });
}

/* =================== Screen =================== */
export default function B3_Familia_Tarjetas() {
  const [mode, setMode] = useState<Mode>("polite");
  const [deck, setDeck] = useState<Card[]>(() => shuffle(makeDeck("polite")));
  const [idx, setIdx] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showGuide, setShowGuide] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);

  // TTS voices
  const [jpVoice, setJpVoice] = useState<string | undefined>();
  const [hasJaVoice, setHasJaVoice] = useState(false);
  const warnedOnce = useRef(false);

  useEffect(() => {
    (async () => {
      try { await Audio.setAudioModeAsync({ playsInSilentModeIOS: true }); } catch {}
      try {
        const voices: any[] = await Speech.getAvailableVoicesAsync();
        const v =
          voices.find((x) => (x.language || "").toLowerCase().startsWith("ja")) ||
          voices.find((x) => (x.identifier || x.voiceURI || "").toLowerCase().includes("ja"));
        const id = (v?.identifier as string) ?? (v?.voiceURI as string) ?? undefined;
        setJpVoice(id);
        setHasJaVoice(!!v);
      } catch {}
    })();
    return () => { Speech.stop(); };
  }, []);

  /* flip 3D sin backfaceVisibility (Android safe) */
  const rot = useRef(new Animated.Value(0)).current; // 0..180
  const [showBack, setShowBack] = useState(false);

  const rotateYFront = rot.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
  const rotateYBack  = rot.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });
  const frontOpacity = rot.interpolate({ inputRange: [0, 89, 90, 180], outputRange: [1, 1, 0, 0] });
  const backOpacity  = rot.interpolate({ inputRange: [0, 89, 90, 180], outputRange: [0, 0, 1, 1] });

  const frontStyle = { transform: [{ perspective: 1000 }, { rotateY: rotateYFront }], opacity: frontOpacity };
  const backStyle  = {
    transform: [{ perspective: 1000 }, { rotateY: rotateYBack }],
    opacity: backOpacity,
    position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0,
  };

  const doFlip = () => {
    const to = showBack ? 0 : 180;
    Animated.timing(rot, { toValue: to, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false })
      .start(() => {
        setShowBack(v => !v);
        if (!showBack && autoSpeak) speakJP(deck[idx].backJP, jpVoice, hasJaVoice, warnedOnce);
      });
  };

  const go = (dir: 1 | -1) => {
    const next = (idx + dir + deck.length) % deck.length;
    setIdx(next);
    setShowBack(false);
    rot.setValue(0);
    if (autoSpeak) speakJP(deck[next].frontJP, jpVoice, hasJaVoice, warnedOnce);
  };

  // cambiar modo
  useEffect(() => {
    const d = shuffle(makeDeck(mode));
    setDeck(d);
    setIdx(0);
    setShowBack(false);
    rot.setValue(0);
    if (autoSpeak) speakJP(d[0].frontJP, jpVoice, hasJaVoice, warnedOnce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const card = deck[idx];
  const progressPct = ((idx + 1) / deck.length) * 100;

  /* =================== UI =================== */
  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.stack}>
        {/* Título */}
        <View style={s.section}>
          <Text style={s.title}>Tarjetas — Familia 🔥 v2</Text>
          <Text style={s.subtitle}>Practica lectura, escucha y memoria con tarjeta 3D única.</Text>
        </View>

        {/* Banner TTS */}
        {!hasJaVoice && (
          <View style={[s.section, s.banner]}>
            <Ionicons name="warning-outline" size={18} color="#8a6d00" />
            <Text style={s.bannerTxt}>
              Si no se oye japonés, instala la voz ja-JP (Texto a voz) en los ajustes del sistema.
            </Text>
            <Pressable
              style={s.bannerBtn}
              onPress={() => Platform.OS === "android" ? Linking.openSettings() : Linking.openURL("app-settings:")}
            >
              <Text style={s.bannerBtnTxt}>Abrir Ajustes</Text>
            </Pressable>
          </View>
        )}

        {/* Guía breve */}
        <View style={[s.section, s.cardHelp]}>
          <Pressable onPress={() => setShowGuide(v => !v)} style={s.helpHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
              <Ionicons name="school-outline" size={20} color="#B32133" />
              <Text style={s.h1}>Cómo usar: familia japonesa</Text>
            </View>
            <Ionicons name={showGuide ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
          </Pressable>

          {showGuide && (
            <View style={{ marginTop: 10 }}>
              <Text style={s.p}>
                Para la <Text style={s.bold}>familia de otra persona</Text> usa formas corteses:
                <Text style={s.bold}> おとうさん / おかあさん / ごりょうしん / ごかぞく</Text>.
                Para <Text style={s.bold}>tu propia familia</Text> usa formas humildes:
                <Text style={s.bold}> ちち / はは / りょうしん / かぞく</Text>.
              </Text>
              <Text style={s.p}>
                Practica con <Text style={s.bold}>A は B です</Text>:
                <Text style={s.pMono}> ちちは ごじゅっさい です。/ おとうさんは なんさい ですか。</Text>
              </Text>
              <Text style={s.pSmall}>Tip: 1歳＝いっさい, 8歳＝はっさい, 10歳＝じゅっさい, 20歳＝はたち.</Text>
            </View>
          )}
        </View>

        {/* Selector modo y rōmaji */}
        <View style={[s.section, s.modeRow]}>
          <Pressable onPress={() => setMode("polite")} style={[s.pill, mode === "polite" && s.pillActive]}>
            <Text style={[s.pillTxt, mode === "polite" && s.pillTxtActive]}>Cortés</Text>
          </Pressable>
          <Pressable onPress={() => setMode("mine")} style={[s.pill, mode === "mine" && s.pillActive]}>
            <Text style={[s.pillTxt, mode === "mine" && s.pillTxtActive]}>Mi familia</Text>
          </Pressable>

          <Pressable onPress={() => setShowRomaji(v => !v)} style={[s.pill, showRomaji && s.pillActive, { marginLeft: "auto" }]}>
            <Ionicons name="text-outline" size={16} color={showRomaji ? "#B32133" : "#6B7280"} />
            <Text style={[s.pillTxt, showRomaji && s.pillTxtActive]}>{showRomaji ? "Ocultar rōmaji" : "Mostrar rōmaji"}</Text>
          </Pressable>
        </View>

        {/* Progreso */}
        <View style={s.section}>
          <View style={s.progressWrap}><View style={[s.progressFill, { width: `${progressPct}%` }]} /></View>
          <Text style={s.progressTxt}>{idx + 1} / {deck.length}</Text>
        </View>

        {/* Tarjeta */}
        <View style={[s.section, s.cardWrap]}>
          {/* FRONT */}
          <Animated.View style={[s.card, frontStyle]}>
            <View style={s.chipRow}>
              <View style={[s.tag, { backgroundColor: "#fff5f6", borderColor: "#f2c9cf" }]}><Text style={s.tagTxt}>{card.frontLabel}</Text></View>
              <View style={[s.tag, { backgroundColor: "#eef2ff", borderColor: "#c7d2fe" }]}><Text style={[s.tagTxt, { color: "#1d4ed8" }]}>{card.es}</Text></View>
            </View>

            <Text style={s.jpBig}>{card.frontJP}</Text>
            {showRomaji ? <Text style={s.roTxt}>{card.frontRo}</Text> : null}

            <View style={s.cardBtns}>
              <Pressable style={s.spkBtn} onPress={() => speakJP(card.frontJP, jpVoice, hasJaVoice, warnedOnce)}>
                <Ionicons name="musical-notes" size={18} color="#B32133" />
              </Pressable>
              <Pressable style={s.spkBtn} onPress={() => speakBoth(card.frontJP, card.es, jpVoice, hasJaVoice, warnedOnce)}>
                <Ionicons name="volume-high" size={18} color="#B32133" />
              </Pressable>
            </View>
          </Animated.View>

          {/* BACK */}
          <Animated.View style={[s.card, backStyle]}>
            <View style={s.chipRow}>
              <View style={[s.tag, { backgroundColor: "#fff5f6", borderColor: "#f2c9cf" }]}><Text style={s.tagTxt}>{card.backLabel}</Text></View>
              <View style={[s.tag, { backgroundColor: "#eef2ff", borderColor: "#c7d2fe" }]}><Text style={[s.tagTxt, { color: "#1d4ed8" }]}>{card.es}</Text></View>
            </View>

            <Text style={s.jpBig}>{card.backJP}</Text>
            {showRomaji ? <Text style={s.roTxt}>{card.backRo}</Text> : null}

            <View style={s.cardBtns}>
              <Pressable style={s.spkBtn} onPress={() => speakJP(card.backJP, jpVoice, hasJaVoice, warnedOnce)}>
                <Ionicons name="musical-notes" size={18} color="#B32133" />
              </Pressable>
              <Pressable style={s.spkBtn} onPress={() => speakBoth(card.backJP, card.es, jpVoice, hasJaVoice, warnedOnce)}>
                <Ionicons name="volume-high" size={18} color="#B32133" />
              </Pressable>
            </View>
          </Animated.View>
        </View>

        {/* Controles */}
        <View style={[s.section, s.controls]}>
          <Pressable style={s.ctrlBtn} onPress={() => go(-1)}>
            <Ionicons name="chevron-back" size={20} color="#111827" />
            <Text style={s.ctrlTxt}>Anterior</Text>
          </Pressable>

          <Pressable style={s.mainBtn} onPress={doFlip}>
            <Text style={s.mainBtnTxt}>{showBack ? "Ver frente" : "Voltear"}</Text>
          </Pressable>

          <Pressable style={s.ctrlBtn} onPress={() => go(1)}>
            <Text style={s.ctrlTxt}>Siguiente</Text>
            <Ionicons name="chevron-forward" size={20} color="#111827" />
          </Pressable>
        </View>

        {/* Fila inferior */}
        <View style={[s.section, s.bottomRow]}>
          <Pressable
            style={s.ghostBtn}
            onPress={() => {
              const d = shuffle(makeDeck(mode));
              setDeck(d); setIdx(0); setShowBack(false); rot.setValue(0);
              if (autoSpeak) speakJP(d[0].frontJP, jpVoice, hasJaVoice, warnedOnce);
            }}
          >
            <Ionicons name="shuffle" size={16} color="#111827" />
            <Text style={s.ghostTxt}>Mezclar</Text>
          </Pressable>

          <Pressable
            style={[s.ghostBtn, autoSpeak && { backgroundColor: "#fff5f5", borderColor: "#f2c9cf" }]}
            onPress={() => setAutoSpeak(v => !v)}
          >
            <Ionicons name={autoSpeak ? "volume-high" : "volume-mute"} size={16} color="#111827" />
            <Text style={s.ghostTxt}>{autoSpeak ? "Auto-leer ON" : "Auto-leer OFF"}</Text>
          </Pressable>
        </View>

        <View style={{ height: 20 }} />
      </View>
    </ScrollView>
  );
}

/* =================== styles =================== */
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";

const s = StyleSheet.create({
  container: { padding: 20, backgroundColor: PAPER },
  stack: { gap: 18 },
  section: { marginBottom: 2 },

  title: { fontSize: 22, fontWeight: "900", color: INK, marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#6B7280" },

  banner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FFF6D6", borderWidth: 1, borderColor: "#F3E2A0",
    padding: 12, borderRadius: 14,
  },
  bannerTxt: { flex: 1, color: "#8a6d00", lineHeight: 20 },
  bannerBtn: { backgroundColor: CRIMSON, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  bannerBtnTxt: { color: "#fff", fontWeight: "900" },

  cardHelp: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", padding: 16 },
  helpHeader: { paddingVertical: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  h1: { fontSize: 16, fontWeight: "900", color: INK },
  p: { color: "#374151", lineHeight: 22, marginTop: 6 },
  pSmall: { color: "#6B7280", fontSize: 13, lineHeight: 20, marginTop: 4 },
  pMono: { color: "#374151", fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }) },
  bold: { fontWeight: "900", color: INK },

  modeRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff",
  },
  pillActive: { backgroundColor: "#fde8ec", borderColor: "#f2c9cf" },
  pillTxt: { color: "#6B7280", fontWeight: "700" },
  pillTxtActive: { color: CRIMSON },

  progressWrap: { height: 10, backgroundColor: "#f3f4f6", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: CRIMSON },
  progressTxt: { alignSelf: "center", marginTop: 8, color: "#6B7280", fontSize: 12 },

  cardWrap: { height: 260 },
  card: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB",
    alignItems: "center", justifyContent: "center", padding: 18,
    elevation: 2, shadowOpacity: 0.08, shadowRadius: 8,
  },
  chipRow: { position: "absolute", top: 12, left: 12, flexDirection: "row", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  tagTxt: { fontSize: 11, fontWeight: "900", color: INK },

  jpBig: { fontSize: 44, fontWeight: "900", color: INK },
  roTxt: { marginTop: 6, color: "#6B7280" },

  cardBtns: { flexDirection: "row", gap: 10, position: "absolute", right: 14, bottom: 14 },
  spkBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff5f5", borderWidth: 1, borderColor: "#f2c9cf",
  },

  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4 },
  ctrlBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff",
  },
  ctrlTxt: { color: INK, fontWeight: "700" },
  mainBtn: { backgroundColor: CRIMSON, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  mainBtnTxt: { color: "#fff", fontWeight: "900" },

  bottomRow: { flexDirection: "row", gap: 12 },
  ghostBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff",
  },
  ghostTxt: { color: INK, fontWeight: "700" },
});
