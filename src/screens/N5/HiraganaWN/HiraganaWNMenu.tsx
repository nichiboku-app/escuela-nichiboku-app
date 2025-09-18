// src/screens/N5/HiraganaWN/HiraganaWNMenu.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useRef } from "react";
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

const RACCOON: ImageSourcePropType = require("../../../../assets/images/mapache_n5_clean.webp");
// const RACCOON = require("../../../../assets/images/mapache_n5_clean.png");

export default function HiraganaWNMenu() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={{ flex: 1 }}>
      {/* 🦝 Lluvia de mapaches (no bloquea toques) */}
      <RaccoonRain source={RACCOON} count={14} durationMs={5000} />

      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.title}>Hiragana W–N（わ・を・ん / contracciones）</Text>
        <Text style={s.subtitle}>
          Actividades: lectura de frases cortas y práctica de cierre con ん.
        </Text>

        {/* ===== Actividades (libres) ===== */}
        <Pressable style={s.card} onPress={() => navigation.navigate("WN_LecturaFrases")}>
          <Text style={s.cardTitle}>📖 Lectura de frases cortas</Text>
        </Pressable>

        <Pressable style={s.card} onPress={() => navigation.navigate("WN_PracticaNFinal")}>
          <Text style={s.cardTitle}>🎯 Examen final — lecturas</Text>
        </Pressable>

        {/* ===== Navegación entre unidades ===== */}
        <Pressable style={[s.nextBtnBlack]} onPress={() => navigation.navigate("HiraganaYRMenu")}>
          <Text style={s.nextTxt}>← Volver a Y–R (やゆよ・らりるれろ)</Text>
        </Pressable>

        {/* ✅ Ir a Katakana (Bloque 2) */}
        <Pressable style={[s.nextBtnRed]} onPress={() => navigation.navigate("KatakanaMenu")}>
          <Text style={s.nextTxt}>Ir a UNIDAD 2 — Katakana</Text>
        </Pressable>

        {/* ===== Unidades Premium (ya con navegación) ===== */}
        <Text style={s.sectionTitle}>Unidades Premium (membresía)</Text>

        <PremiumCard title="Bloque 3: Vocabulario esencial (10 temas)" onPress={() => navigation.navigate("B3VocabularioMenu")} />
        <PremiumCard title="Bloque 4: Gramática I" onPress={() => navigation.navigate("B4GramaticaIMenu")} />
        <PremiumCard title="Bloque 5: Gramática II" onPress={() => navigation.navigate("B5GramaticaIIMenu")} />
        <PremiumCard title="Bloque 6: Vida cotidiana" onPress={() => navigation.navigate("B6VidaCotidianaMenu")} />
        <PremiumCard title="Bloque 7: Lectura y práctica" onPress={() => navigation.navigate("B7LecturaPracticaMenu")} />
        <PremiumCard title="Bloque 8: Evaluaciones y logros" onPress={() => navigation.navigate("B8EvaluacionesLogrosMenu")} />
        <PremiumCard title='Examen final 🦝 “Maestro Mapache N5”' onPress={() => navigation.navigate("ExamenFinalMapacheN5")} />
      </ScrollView>
    </View>
  );
}

function PremiumCard({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable style={[s.card, s.cardPremium]} onPress={onPress}>
      <View style={s.rowBetween}>
        <Text style={s.cardTitle}>{title}</Text>
        <View style={s.premiumTag}>
          <Ionicons name="lock-closed" size={14} />
          <Text style={s.premiumTxt}>Premium</Text>
        </View>
      </View>
    </Pressable>
  );
}

/** 🦝 Lluvia de mapaches */
function RaccoonRain({
  source,
  count = 12,
  durationMs = 5000,
}: {
  source: ImageSourcePropType;
  count?: number;
  durationMs?: number;
}) {
  const { width, height } = useWindowDimensions();
  const spec = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const size = 48 + Math.round(Math.random() * 40);
        const x = Math.round(Math.random() * (width - size));
        const delay = Math.round(Math.random() * durationMs);
        const scale = 0.85 + Math.random() * 0.4;
        const flip = Math.random() < 0.5;
        const sway = 8 + Math.random() * 10;
        return { id: i, size, x, delay, scale, flip, sway };
      }),
    [count, width, durationMs],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {spec.map(({ id, size, x, delay, scale, flip, sway }) => (
        <FallingRaccoon
          key={id}
          source={source}
          size={size}
          x={x}
          delay={delay}
          scale={scale}
          flip={flip}
          sway={sway}
          durationMs={durationMs}
          screenH={height}
        />
      ))}
    </View>
  );
}

function FallingRaccoon({
  source,
  size,
  x,
  delay,
  scale,
  flip,
  sway,
  durationMs,
  screenH,
}: {
  source: ImageSourcePropType;
  size: number;
  x: number;
  delay: number;
  scale: number;
  flip: boolean;
  sway: number;
  durationMs: number;
  screenH: number;
}) {
  const translateY = useRef(new Animated.Value(-size - 20)).current;
  const swayPhase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;

    const fall = () => {
      if (!alive) return;
      translateY.setValue(-size - 20);
      Animated.timing(translateY, {
        toValue: screenH + size + 20,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        if (!alive) return;
        setTimeout(fall, Math.random() * 600);
      });
    };

    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayPhase, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(swayPhase, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );

    const start = setTimeout(() => {
      fall();
      swayLoop.start();
    }, delay);

    return () => {
      alive = false;
      clearTimeout(start);
      translateY.stopAnimation();
      swayLoop.stop();
    };
  }, [delay, durationMs, screenH, size, swayPhase, translateY]);

  const translateX = Animated.add(
    new Animated.Value(x),
    swayPhase.interpolate({ inputRange: [0, 1], outputRange: [-sway, sway] })
  );

  return (
    <Animated.Image
      source={source}
      resizeMode="contain"
      style={{
        position: "absolute",
        width: size,
        height: size,
        transform: [
          { translateX },
          { translateY },
          { scaleX: flip ? -scale : scale },
          { scale: scale },
        ],
      }}
    />
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { fontSize: 14, opacity: 0.7, marginBottom: 8 },

  sectionTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardPremium: {
    opacity: 0.95,
    borderColor: "#ead5d9",
    backgroundColor: "#fff7f8",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },

  premiumTag: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5b8bf",
    backgroundColor: "#fde8ec",
  },
  premiumTxt: { fontSize: 12, fontWeight: "800", color: "#B32133" },

  nextBtnBlack: {
    backgroundColor: "#000",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  nextBtnRed: {
    backgroundColor: "#B32133",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  nextTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
