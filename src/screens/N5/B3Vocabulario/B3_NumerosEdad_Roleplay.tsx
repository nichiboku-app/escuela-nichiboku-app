// src/screens/N5/B3Vocabulario/B3_NumerosEdad_Roleplay.tsx
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Easing,
    ImageSourcePropType,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

// 🔁 Cambia esta ruta si tu archivo se llama distinto:
const AVATAR: ImageSourcePropType = require("../../../../assets/images/avatar_profesor.webp");

/* ========= helpers ========= */
const digitsKana: Record<number, string> = {
  0: "れい",
  1: "いち",
  2: "に",
  3: "さん",
  4: "よん",
  5: "ご",
  6: "ろく",
  7: "なな",
  8: "はち",
  9: "きゅう",
};
function ageReading(n: number): string {
  if (n === 0) return "れいさい";
  if (n === 20) return "はたち";
  if (n === 100) return "ひゃくさい";

  const last = n % 10;
  const tens = Math.floor(n / 10);

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

/* ========= pantalla ========= */
export default function B3_NumerosEdad_Roleplay() {
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState(16);
  const [score, setScore] = useState(0);
  const [showDialogue, setShowDialogue] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // ======= AUDIO/TTS =======
  const [jpVoice, setJpVoice] = useState<string | undefined>(undefined);
  const [hasJaVoice, setHasJaVoice] = useState(false);
  const warnedOnce = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        });
      } catch {}

      try {
        const voices: any[] = await Speech.getAvailableVoicesAsync();
        const v =
          voices.find((x) => (x.language || "").toLowerCase().startsWith("ja")) ||
          voices.find((x) => (x.identifier || x.voiceURI || "").toLowerCase().includes("ja"));
        const id = (v?.identifier as string) ?? (v?.voiceURI as string) ?? undefined;
        setJpVoice(id);
        setHasJaVoice(!!v);
        if (__DEV__) {
          console.log("[TTS] voces:", voices?.map((vv) => `${vv.language}:${vv.identifier}`));
          console.log("[TTS] vozJP usada:", (v?.language || "") + " -> " + (id ?? "none"));
        }
      } catch (e) {
        if (__DEV__) console.warn("[TTS] getAvailableVoicesAsync error:", e);
      }
    })();

    return () => {
      Speech.stop();
    };
  }, []);

  const maybeWarnAndGuide = () => {
    if (hasJaVoice) return;
    if (!warnedOnce.current) {
      warnedOnce.current = true;
      Alert.alert(
        "Instala voz japonesa",
        Platform.OS === "android"
          ? "Abre ‘Configurar TTS’ y en Google Texto a voz descarga Japonés (日本語)."
          : "iOS: Ajustes > Accesibilidad > Contenido hablado > Voces > Japonés.",
        [{ text: "Ok" }]
      );
    }
  };

  const speakJP = (text: string) => {
    Speech.stop();
    const opts: any = { language: "ja-JP", rate: 1.0, pitch: 1.05 };
    if (jpVoice) opts.voice = jpVoice;
    if (!hasJaVoice) maybeWarnAndGuide();
    Speech.speak(text, opts);
  };

  const speakBoth = (jp: string, es?: string) => {
    Speech.stop();
    const jpOpts: any = { language: "ja-JP", rate: 1.0, pitch: 1.05 };
    if (jpVoice) jpOpts.voice = jpVoice;
    if (!hasJaVoice) maybeWarnAndGuide();
    Speech.speak(jp, {
      ...jpOpts,
      onDone: () => es && Speech.speak(es, { language: "es-MX", rate: 1.0 }),
      onError: () => es && Speech.speak(es, { language: "es-MX", rate: 1.0 }),
    });
  };

  // Abrir ajustes / Play Store sin libs extra
  const openTTSSettings = async () => {
    try {
      if (Platform.OS === "android") await Linking.openSettings();
      else await Linking.openURL("app-settings:");
    } catch {
      Alert.alert("No pude abrir Ajustes", "Ábrelos manualmente desde el sistema.");
    }
  };
  const openPlayStoreTTS = async () => {
    if (Platform.OS !== "android") return;
    const intents = [
      "market://details?id=com.google.android.tts",
      "https://play.google.com/store/apps/details?id=com.google.android.tts",
    ];
    for (const url of intents) {
      try {
        await Linking.openURL(url);
        return;
      } catch {}
    }
    Alert.alert("No se abrió Play Store", "Busca ‘Speech Services by Google’.");
  };

  // animación al finalizar
  const pulse = useRef(new Animated.Value(0)).current;
  const bgColor = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", "#e8f9ef"],
  });

  const nextStep = () => {
    if (step === 0) {
      setScore((p) => p + 10);
      setStep(1);
    }
  };
  const finish = () => {
    setScore((p) => p + 10);
    setShowDialogue(true);
    pulse.setValue(0);
    Animated.timing(pulse, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };
  const prevStep = () => setStep(0);

  return (
    <Animated.View style={[s.container, { backgroundColor: bgColor as any }]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Header score={score} />

        {!hasJaVoice && (
          <View style={s.ttsBanner}>
            <Ionicons name="warning-outline" size={18} color="#8a6d00" />
            <Text style={s.ttsBannerTxt}>
              Para oír japonés instala una voz japonesa (ja-JP).
            </Text>
            <Pressable onPress={openTTSSettings} style={s.ttsBtn}>
              <Ionicons name="settings-outline" size={16} color="#fff" />
              <Text style={s.ttsBtnTxt}>Configurar TTS</Text>
            </Pressable>
          </View>
        )}

        <TTSHelp
          show={showHelp}
          toggle={() => setShowHelp((v) => !v)}
          openSettings={openTTSSettings}
          openPlayStore={openPlayStoreTTS}
        />

        <View style={s.avatarRow}>
          <AnimatedAvatar source={AVATAR} />
          <Balloon step={step} name={name} age={age} speakJP={speakJP} speakBoth={speakBoth} />
        </View>

        <View style={s.stepper}>
          <StepPill active={step === 0} label="① なまえ" />
          <StepPill active={step === 1} label="② なんさい" />
        </View>

        {step === 0 && (
          <StepName name={name} setName={setName} onNext={() => (name.trim() ? nextStep() : null)} />
        )}
        {step === 1 && <StepAge age={age} setAge={setAge} onNext={finish} onPrev={prevStep} />}

        {showDialogue && <Conversation name={name} age={age} speakBoth={speakBoth} />}

        <EasyGuide speakJP={speakJP} />
        <AgeTable speakJP={speakJP} />

        <View style={{ height: 24 }} />
      </ScrollView>
    </Animated.View>
  );
}

/* ====================== UI pieces ====================== */

function Header({ score }: { score: number }) {
  return (
    <View style={s.header}>
      <Text style={s.kicker}>ロールプレイ</Text>
      <Text style={s.title}>数字と年齢</Text>
      <Text style={s.subtitle}>Roleplay con avatar ・ タスク：なまえ／なんさい</Text>

      <View style={s.scoreBox}>
        <Ionicons name="star" size={14} color="#C6A15B" />
        <Text style={s.scoreTxt}>{score} pt</Text>
      </View>
    </View>
  );
}

function TTSHelp({
  show,
  toggle,
  openSettings,
  openPlayStore,
}: {
  show: boolean;
  toggle: () => void;
  openSettings: () => void;
  openPlayStore: () => void;
}) {
  return (
    <View style={[s.card, { marginBottom: 8 }]}>
      <Pressable onPress={toggle} style={s.helpHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
          <Ionicons name="help-circle-outline" size={18} color={CRIMSON} />
          <Text style={s.h1}>¿Cómo activar la voz japonesa (TTS)?</Text>
        </View>
        <Ionicons name={show ? "chevron-up" : "chevron-down"} size={18} color="#6B7280" />
      </Pressable>

      {show && (
        <View style={{ marginTop: 6 }}>
          {Platform.OS === "android" ? (
            <>
              <Text style={s.p}>
                Ruta típica: <Text style={s.bold}>Ajustes → Administración general → Idioma y entrada → Salida de texto a voz</Text>.
              </Text>
              <Text style={s.p}>
                1) En <Text style={s.bold}>Motor preferido</Text> elige <Text style={s.bold}>Speech Services by Google</Text>.
              </Text>
              <Text style={s.p}>
                2) Toca el <Text style={s.bold}>engranaje (⚙️)</Text> → <Text style={s.bold}>Instalar datos de voz</Text> → <Text style={s.bold}>日本語</Text> → Descargar.
              </Text>
              <Text style={s.p}>3) Sube el volumen de <Text style={s.bold}>Multimedia</Text> y prueba 🎵.</Text>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <Pressable onPress={openSettings} style={s.btnGhost}>
                  <Text style={s.btnGhostTxt}>Abrir Ajustes</Text>
                </Pressable>
                <Pressable onPress={openPlayStore} style={s.btnGhost}>
                  <Text style={s.btnGhostTxt}>Play Store (Google TTS)</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={s.p}>
                iOS: Ajustes → <Text style={s.bold}>Accesibilidad</Text> → <Text style={s.bold}>Contenido hablado</Text> → <Text style={s.bold}>Voces</Text> → <Text style={s.bold}>Japonés</Text>.
              </Text>
              <Text style={s.p}>Descarga una voz (p. ej. Kyoko) y prueba 🎵.</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                <Pressable onPress={openSettings} style={s.btnGhost}>
                  <Text style={s.btnGhostTxt}>Abrir Ajustes</Text>
                </Pressable>
              </View>
            </>
          )}
          <Text style={s.pSmall}>
            Nota: los nombres de menú cambian según el modelo. Usa la lupa de Ajustes y busca “texto a voz” si no lo encuentras.
          </Text>
        </View>
      )}
    </View>
  );
}

function StepPill({ active, label }: { active: boolean; label: string }) {
  return (
    <View style={[s.pill, active && s.pillActive]}>
      <Text style={[s.pillTxt, active && s.pillTxtActive]}>{label}</Text>
    </View>
  );
}

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
        style={[s.avatar, { transform: [{ translateY }, { translateX: -10 }, { rotate }, { translateX: 10 }] }]}
      />
    </View>
  );
}

function Sparkles() {
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (v: Animated.Value, d: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(d),
          Animated.timing(v, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    loop(a1, 0);
    loop(a2, 400);
  }, [a1, a2]);

  const k = (v: Animated.Value, tx: number, ty: number) => ({
    transform: [
      { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [tx, tx + 4] }) },
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [ty, ty - 4] }) },
      { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.1] }) },
    ],
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }),
  });

  return (
    <>
      <Animated.Text style={[s.sparkle, k(a1, 84, 8)]}>✦</Animated.Text>
      <Animated.Text style={[s.sparkle, k(a2, 8, 0)]}>✦</Animated.Text>
    </>
  );
}

/** Globo con TTS de la pregunta (JP→ES y JP solo) */
function Balloon({
  step,
  name,
  age,
  speakJP,
  speakBoth,
}: {
  step: number;
  name: string;
  age: number;
  speakJP: (t: string) => void;
  speakBoth: (jp: string, es?: string) => void;
}) {
  const msg = useMemo(() => {
    if (step === 0) return { jp: "こんにちは！ お名前は？", es: "¡Hola! ¿Cómo te llamas?" };
    return { jp: "何歳（なんさい）ですか。", es: "¿Cuántos años tienes?" };
  }, [step]);

  return (
    <View style={s.balloon}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={s.balloonJP}>{msg.jp}</Text>
          <Text style={s.balloonES}>{msg.es}</Text>
          {step === 0 && name ? <Text style={s.balloonHint}>よろしくね、{name} さん！</Text> : null}
          {step === 1 ? (
            <Text style={s.balloonHint}>
              例：{age}歳＝{ageReading(age)}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: 8 }}>
          <Pressable onPress={() => speakJP(msg.jp)} style={s.spkBtn} accessibilityLabel="Escuchar en japonés">
            <Ionicons name="musical-notes" size={18} color="#B32133" />
          </Pressable>
          <Pressable onPress={() => speakBoth(msg.jp, msg.es)} style={s.spkBtn} accessibilityLabel="Escuchar JP y ES">
            <Ionicons name="volume-high" size={18} color="#B32133" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* -------- pasos -------- */
function StepName({
  name,
  setName,
  onNext,
}: {
  name: string;
  setName: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <View style={s.card}>
      <HeaderRow icon="person-outline" title="① Tu nombre" jp="お名前（おなまえ）" />
      <Text style={s.p}>Escribe tu nombre para presentarte en japonés.</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre (例：Carlos)"
        style={s.input}
        returnKeyType="done"
      />
      <View style={s.rowEnd}>
        <PrimaryButton title="Siguiente" onPress={onNext} disabled={!name.trim()} />
      </View>
    </View>
  );
}

function StepAge({
  age,
  setAge,
  onNext,
  onPrev,
}: {
  age: number;
  setAge: (n: number) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <View style={s.card}>
      <HeaderRow icon="hourglass-outline" title="② ¿Cuántos años?" jp="何歳（なんさい）" />
      <Text style={s.p}>
        Usa los botones para elegir tu edad. Lectura japonesa:{" "}
        <Text style={s.bold}>{ageReading(age)}</Text>
      </Text>
      <View style={s.ageRow}>
        <RoundBtn icon="remove" onPress={() => setAge(Math.max(1, age - 1))} />
        <Text style={s.ageNumber}>{age}</Text>
        <RoundBtn icon="add" onPress={() => setAge(Math.min(99, age + 1))} />
      </View>
      <Text style={s.pSmall}>
        20 años es especial: <Text style={s.bold}>はたち</Text>
      </Text>

      <View style={s.rowBetween}>
        <SecondaryButton title="← Volver" onPress={onPrev} />
        <PrimaryButton title="Finalizar" onPress={onNext} />
      </View>
    </View>
  );
}

/* -------- conversación -------- */
type ChatLine = { who: "sensei" | "you"; jp: string; es: string };

function Conversation({
  name,
  age,
  speakBoth,
}: {
  name: string;
  age: number;
  speakBoth: (jp: string, es?: string) => void;
}) {
  const lines: ChatLine[] = useMemo(() => {
    const jpAge = age === 20 ? "はたちです。" : `${ageReading(age)}です。`;
    return [
      { who: "sensei", jp: "こんにちは！ お名前は？", es: "¡Hola! ¿Cómo te llamas?" },
      { who: "you", jp: `${name || "〇〇"}です。よろしくおねがいします。`, es: `Me llamo ${name || "…"}. Mucho gusto.` },
      { who: "sensei", jp: "何歳ですか。", es: "¿Cuántos años tienes?" },
      { who: "you", jp: jpAge, es: `Tengo ${age} años.` },
    ];
  }, [name, age]);

  const speakDialogue = () => {
    Speech.stop();
    const seq: { text: string; lang: string; rate?: number; pitch?: number }[] = [];
    lines.forEach((l) => {
      seq.push({ text: l.jp, lang: "ja-JP", rate: 1.0, pitch: 1.05 });
      seq.push({ text: l.es, lang: "es-MX", rate: 1.0 });
    });
    const play = (i: number) => {
      if (i >= seq.length) return;
      const it = seq[i];
      Speech.speak(it.text, {
        language: it.lang,
        rate: it.rate ?? 1,
        pitch: it.pitch ?? 1,
        onDone: () => play(i + 1),
      });
    };
    play(0);
  };

  return (
    <View style={[s.card, { marginTop: 12 }]}>
      <HeaderRow icon="chatbubble-ellipses-outline" title="Diálogo" jp="かいわ" />
      {lines.map((l, idx) => (
        <View key={idx} style={[s.chatRow, l.who === "you" ? s.chatRight : s.chatLeft]}>
          {l.who === "sensei" && (
            <View style={s.avatarDot}>
              <Text style={{ fontSize: 12 }}>👨‍🏫</Text>
            </View>
          )}
          <View style={[s.chatBubble, l.who === "you" ? s.chatBubbleYou : s.chatBubbleSensei]}>
            <Text style={s.chatJP}>{l.jp}</Text>
            <Text style={s.chatES}>{l.es}</Text>
          </View>
          <Pressable onPress={() => speakBoth(l.jp, l.es)} style={s.chatPlay}>
            <Ionicons name="volume-high" size={16} color="#B32133" />
          </Pressable>
        </View>
      ))}
      <Pressable onPress={speakDialogue} style={[s.btn, { marginTop: 10 }]}>
        <Text style={s.btnTxt}>Reproducir diálogo</Text>
      </Pressable>
    </View>
  );
}

/* -------- guía rápida -------- */
function EasyGuide({ speakJP }: { speakJP: (t: string) => void }) {
  return (
    <View style={[s.card, { marginTop: 12 }]}>
      <HeaderRow icon="book-outline" title="Guía fácil: decir y preguntar la edad" jp="かんたんガイド" />
      <Text style={s.p}>
        1) Número + <Text style={s.bold}>歳（さい）</Text>. Ej.: <Text style={s.bold}>6歳＝ろくさい</Text>.
      </Text>
      <Text style={s.p}>
        2) Especiales: <Text style={s.bold}>1歳＝いっさい</Text>, <Text style={s.bold}>8歳＝はっさい</Text>,{" "}
        <Text style={s.bold}>10歳＝じゅっさい</Text>, <Text style={s.bold}>20歳＝はたち</Text>,{" "}
        <Text style={s.bold}>100歳＝ひゃくさい</Text>.
      </Text>
      <Text style={s.p}>
        3) Decenas como 30, 40… usan <Text style={s.bold}>～じゅっさい</Text> (30＝さんじゅっさい).
      </Text>

      <View style={s.explainBlock}>
        <Text style={s.h1}>¿Cómo pregunto?</Text>
        <Phrase jp="何歳（なんさい）ですか。" es="¿Cuántos años tienes?" speakJP={speakJP} />
        <Phrase jp="おいくつですか。" es="¿Qué edad tienes? (más cortés)" speakJP={speakJP} />
        <Phrase jp="何歳？ / いくつ？" es="¿Cuántos? (informal)" speakJP={speakJP} />
        <Text style={s.pSmall}>
          Respuesta formal: <Text style={s.bold}>（わたしは）X歳です。</Text>  Informal: <Text style={s.bold}>X歳。</Text>
        </Text>
      </View>
    </View>
  );
}

function Phrase({ jp, es, speakJP }: { jp: string; es: string; speakJP: (t: string) => void }) {
  return (
    <View style={s.phraseRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.chatJP}>{jp}</Text>
        <Text style={s.chatES}>{es}</Text>
      </View>
      <Pressable onPress={() => speakJP(jp)} style={s.chatPlay}>
        <Ionicons name="musical-notes" size={16} color="#B32133" />
      </Pressable>
    </View>
  );
}

/* -------- tabla 0–100 -------- */
function AgeTable({ speakJP }: { speakJP: (t: string) => void }) {
  const rows = useMemo(() => Array.from({ length: 101 }, (_, n) => ({ n, yomi: ageReading(n) })), []);
  return (
    <View style={[s.card, { marginTop: 12 }]}>
      <HeaderRow icon="grid-outline" title="Tabla: 0〜100 歳" jp="ねんれい ひょう" />
      <View style={s.tableHead}>
        <Text style={[s.th, { flex: 0.25 }]}>#</Text>
        <Text style={[s.th, { flex: 0.55 }]}>Lectura (JP)</Text>
        <Text style={[s.th, { flex: 0.2, textAlign: "center" }]}>🎵</Text>
      </View>
      {rows.map((r) => (
        <View key={r.n} style={s.tableRow}>
          <Text style={[s.td, { flex: 0.25 }]}>{r.n}歳</Text>
          <Text style={[s.td, { flex: 0.55, fontWeight: "900", color: INK }]}>{r.yomi}</Text>
          <Pressable onPress={() => speakJP(r.yomi)} style={[s.td, { flex: 0.2, alignItems: "center" }]}>
            <Ionicons name="musical-notes" size={16} color="#B32133" />
          </Pressable>
        </View>
      ))}
      <Text style={s.pSmall}>
        Consejo: practica diciendo la edad de amigos y familia cambiando solo el número + <Text style={s.bold}>さい</Text>.
      </Text>
    </View>
  );
}

/* -------- átomos -------- */
function HeaderRow({ icon, title, jp }: { icon: keyof typeof Ionicons.glyphMap; title: string; jp: string }) {
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

function PrimaryButton({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[s.btn, disabled && { opacity: 0.5 }]}>
      <Text style={s.btnTxt}>{title}</Text>
    </Pressable>
  );
}
function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={s.btnGhost}>
      <Text style={s.btnGhostTxt}>{title}</Text>
    </Pressable>
  );
}
function RoundBtn({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={s.roundBtn}>
      <Ionicons name={icon} size={20} color="#111827" />
    </Pressable>
  );
}

/* ========= estilos ========= */
const PAPER = "#FAF7F0";
const INK = "#1F2937";
const CRIMSON = "#B32133";
const WASHI = "#fffdf7";

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAPER },
  header: {
    backgroundColor: WASHI,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  kicker: { color: CRIMSON, fontWeight: "900", letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: "900", color: INK, marginTop: 2 },
  subtitle: { color: "#6B7280", marginTop: 2 },

  // Banner TTS
  ttsBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#FFF6D6",
    borderWidth: 1,
    borderColor: "#F3E2A0",
    marginBottom: 10,
  },
  ttsBannerTxt: { flex: 1, color: "#8a6d00" },
  ttsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#B32133",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ttsBtnTxt: { color: "#fff", fontWeight: "900" },

  // Help
  helpHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  avatarRow: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 8 },
  avatarBox: { width: 120, height: 120, alignItems: "center", justifyContent: "center" },
  avatar: { width: "100%", height: "100%" },
  sparkle: { position: "absolute", fontSize: 14, color: "#C6A15B", opacity: 0.7 },

  balloon: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  balloonJP: { fontWeight: "900", color: INK },
  balloonES: { color: "#6B7280", marginTop: 2 },
  balloonHint: { color: "#9CA3AF", marginTop: 6 },
  spkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#f2c9cf",
  },

  stepper: { flexDirection: "row", gap: 6, marginVertical: 8 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  pillActive: { backgroundColor: "#fde8ec", borderColor: "#f2c9cf" },
  pillTxt: { fontSize: 12, color: "#6B7280" },
  pillTxtActive: { color: CRIMSON, fontWeight: "900" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginTop: 8,
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

  p: { color: "#374151", lineHeight: 20, marginTop: 2 },
  pSmall: { color: "#6B7280", fontSize: 12, marginTop: 8 },
  bold: { fontWeight: "900", color: INK },

  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  rowEnd: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },

  btn: { backgroundColor: CRIMSON, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center" },
  btnTxt: { color: "#fff", fontWeight: "900" },
  btnGhost: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  btnGhostTxt: { color: INK, fontWeight: "900" },

  ageRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginVertical: 8 },
  ageNumber: { fontSize: 28, fontWeight: "900", color: INK, minWidth: 64, textAlign: "center" },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },

  scoreBox: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFFDF3",
    borderWidth: 1,
    borderColor: "#F3E8C9",
    borderRadius: 999,
  },
  scoreTxt: { fontWeight: "900", color: "#6B7280" },

  // chat
  chatRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 8 },
  chatLeft: { justifyContent: "flex-start" },
  chatRight: { justifyContent: "flex-end" },
  avatarDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 6,
  },
  chatBubble: { maxWidth: "75%", borderRadius: 14, padding: 10, borderWidth: 1 },
  chatBubbleSensei: { backgroundColor: "#fffdf8", borderColor: "#F3E7C9" },
  chatBubbleYou: { backgroundColor: "#f7faff", borderColor: "#D8E3FF" },
  chatJP: { color: INK, fontWeight: "900" },
  chatES: { color: "#6B7280", marginTop: 2 },
  chatPlay: {
    marginLeft: 8, // ← corregido (antes estaba "margin-left")
    padding: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#f2c9cf",
    backgroundColor: "#fff5f5",
  },

  // guía
  explainBlock: { marginTop: 10 },
  phraseRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },

  // tabla
  tableHead: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderColor: "#E5E7EB", marginTop: 6 },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderColor: "#F3F4F6" },
  th: { fontWeight: "900", color: INK },
  td: { color: "#374151" },
});
