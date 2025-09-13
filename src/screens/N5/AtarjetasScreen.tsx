import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

/** ============================
 *  Tipos y datos de ejemplo
 *  ============================ */
type CardItem = {
  id: string;
  jp: string;          // palabra/frase en japonés
  romaji?: string;     // romaji opcional
  es: string;          // traducción principal (puede contener ; o |)
  tr?: string[];       // traducciones alternas
  ejJP?: string;       // ejemplo en japonés
  ejES?: string;       // ejemplo en español
  cat?: string;        // categoría
};

type AtarjetasParams = {
  deck?: CardItem[];
  title?: string;
  initialCategory?: string;
};

const SAMPLE_DECK: CardItem[] = [
  {
    id: "a_ame",
    jp: "あめ",
    romaji: "ame",
    es: "lluvia",
    tr: ["lluvia"],
    ejJP: "あめがふります。",
    ejES: "Llueve.",
    cat: "Grupo A",
  },
  {
    id: "a_ai",
    jp: "あい",
    romaji: "ai",
    es: "amor; cariño",
    ejJP: "あいをしんじます。",
    ejES: "Creo en el amor.",
    cat: "Grupo A",
  },
  {
    id: "i_inu",
    jp: "いぬ",
    romaji: "inu",
    es: "perro",
    ejJP: "いぬがすきです。",
    ejES: "Me gustan los perros.",
    cat: "Grupo I",
  },
];

const STORAGE_KEY = "atarjetas:v1";

/** ============================
 *  Utilidades
 *  ============================ */
const shuffleArray = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const speakJP = (text: string) => {
  Speech.stop();
  Speech.speak(text, { language: "ja-JP", pitch: 1.0, rate: 0.92 });
};

const haptic = (ms = 15) => Vibration.vibrate(ms);

/** Normaliza traducciones:
 * - Usa card.tr si viene como arreglo
 * - O divide card.es por | o ; (sin romper comas normales)
 */
function getTranslations(item?: CardItem): string[] {
  if (!item) return [];
  if (item.tr && item.tr.length) return item.tr.map((s) => s.trim());
  const base = (item.es ?? "").trim();
  if (!base) return [];
  const parts = base.split(/\s*[|;]\s*/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [base];
}

/** ============================
 *  Componente principal
 *  ============================ */
export default function AtarjetasScreen({ route }: { route?: { params?: AtarjetasParams } }) {
  const params = route?.params ?? {};
  const incomingDeck = params.deck && params.deck.length > 0 ? params.deck : SAMPLE_DECK;

  // Estado
  const [loading, setLoading] = useState(true);
  const [deckBase] = useState<CardItem[]>(incomingDeck);
  const [useShuffle, setUseShuffle] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [filterCat, setFilterCat] = useState<string | null>(params.initialCategory ?? null);

  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [hardIds, setHardIds] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(true);

  // Deck filtrado/barajado
  const workingDeck = useMemo(() => {
    const filtered = filterCat ? deckBase.filter(d => d.cat === filterCat) : deckBase;
    return useShuffle ? shuffleArray(filtered) : filtered;
  }, [deckBase, filterCat, useShuffle]);

  // Carta actual
  const [index, setIndex] = useState(0);
  const card = workingDeck[index];

  // Flip por fundido (sin 3D)
  const flipAnim = useRef(new Animated.Value(0)).current; // 0 = frente JP, 1 = reverso ES
  const [isBack, setIsBack] = useState(false);

  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const backOpacity  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const flip = useCallback(() => {
    haptic();
    Animated.timing(flipAnim, {
      toValue: isBack ? 0 : 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setIsBack(prev => !prev));
  }, [flipAnim, isBack]);

  // Gestos (swipe)
  const pan = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: (_evt, g) => pan.setValue(g.dx),
      onPanResponderRelease: (_evt, g) => {
        const threshold = 55;
        if (g.dx < -threshold) nextCard();
        else if (g.dx > threshold) prevCard();
        Animated.timing(pan, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      },
    })
  ).current;
  const translateX = pan;

  // Persistencia
  type Persisted = {
    known: string[];
    hard: string[];
    settings: { shuffle: boolean; romaji: boolean; tts: boolean; filterCat: string | null; showHelp: boolean };
  };

  const loadState = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: Persisted = JSON.parse(raw);
        setKnownIds(new Set(saved.known));
        setHardIds(new Set(saved.hard));
        setUseShuffle(saved.settings.shuffle);
        setShowRomaji(saved.settings.romaji);
        setTtsEnabled(saved.settings.tts);
        setFilterCat(saved.settings.filterCat);
        setShowHelp(saved.settings.showHelp ?? true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const saveState = useCallback(async () => {
    const data: Persisted = {
      known: Array.from(knownIds),
      hard: Array.from(hardIds),
      settings: { shuffle: useShuffle, romaji: showRomaji, tts: ttsEnabled, filterCat, showHelp },
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [knownIds, hardIds, useShuffle, showRomaji, ttsEnabled, filterCat, showHelp]);

  useEffect(() => { loadState(); }, [loadState]);
  useEffect(() => { saveState(); }, [saveState]);

  // Navegación
  const nextCard = useCallback(() => {
    haptic();
    setIndex(i => (i + 1 >= workingDeck.length ? 0 : i + 1));
    if (isBack) { flipAnim.setValue(0); setIsBack(false); }
  }, [workingDeck.length, isBack, flipAnim]);

  const prevCard = useCallback(() => {
    haptic();
    setIndex(i => (i - 1 < 0 ? Math.max(workingDeck.length - 1, 0) : i - 1));
    if (isBack) { flipAnim.setValue(0); setIsBack(false); }
  }, [workingDeck.length, isBack, flipAnim]);

  // Marcar
  const markKnown = useCallback(() => {
    if (!card) return;
    setKnownIds(s => new Set([...s, card.id]));
    setHardIds(h => { const nh = new Set(h); nh.delete(card.id); return nh; });
    nextCard();
  }, [card, nextCard]);

  const markHard = useCallback(() => {
    if (!card) return;
    setHardIds(h => new Set([...h, card.id]));
    nextCard();
  }, [card, nextCard]);

  const resetProgress = useCallback(() => {
    haptic(25);
    setKnownIds(new Set());
    setHardIds(new Set());
  }, []);

  // TTS
  const speakCurrent = useCallback(() => {
    if (card && ttsEnabled) speakJP(card.jp);
  }, [card, ttsEnabled]);

  useEffect(() => {
    if (card && ttsEnabled) {
      const t = setTimeout(() => speakCurrent(), 120);
      return () => clearTimeout(t);
    }
  }, [card?.id, ttsEnabled, speakCurrent]);

  // Métricas y categorías
  const progress = useMemo(() => {
    const total = workingDeck.length || 1;
    const knownCount = Array.from(knownIds).filter(id => workingDeck.find(c => c.id === id)).length;
    return { knownCount, total, pct: Math.round((knownCount / total) * 100) };
  }, [workingDeck, knownIds]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    deckBase.forEach(d => d.cat && set.add(d.cat));
    return Array.from(set);
  }, [deckBase]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando flashcards…</Text>
      </SafeAreaView>
    );
  }

  const translations = getTranslations(card);
  const mainTr = translations[0] ?? "— sin traducción —";
  const extraTr = translations.slice(1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>{params.title ?? "Atarjetas"}</Text>
        <Text style={styles.subtitle}>{filterCat ? `Filtro: ${filterCat}` : "Todas las categorías"}</Text>
      </View>

      {/* Guía */}
      {showHelp && (
        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Cómo estudiar esta pantalla</Text>
          <Text style={styles.helpText}>1) Lee la tarjeta en japonés. Activa TTS para escucharla.</Text>
          <Text style={styles.helpText}>2) Toca para voltear: el reverso muestra la traducción.</Text>
          <Text style={styles.helpText}>3) Marca ✓ Correcta si la recuerdas; ★ Difícil para repasar después.</Text>
          <Text style={styles.helpText}>4) Desliza para cambiar de tarjeta. Usa filtros y romaji según necesites.</Text>
          <Pressable onPress={() => setShowHelp(false)} style={styles.helpClose}>
            <Text style={styles.helpCloseText}>Ocultar guía</Text>
          </Pressable>
        </View>
      )}

      {/* Progreso */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBg}><View style={[styles.progressFg, { width: `${progress.pct}%` }]} /></View>
        <Text style={styles.progressText}>{progress.knownCount}/{progress.total} ({progress.pct}%)</Text>
      </View>

      {/* Controles */}
      <View style={styles.topControls}>
        <Toggle label="Barajar" value={useShuffle} onToggle={() => setUseShuffle(v => !v)} />
        <Toggle label="Romaji" value={showRomaji} onToggle={() => setShowRomaji(v => !v)} />
        <Toggle label="TTS" value={ttsEnabled} onToggle={() => setTtsEnabled(v => !v)} />
      </View>

      {/* Filtros */}
      {categories.length > 0 && (
        <ScrollChips
          items={["Todas", ...categories]}
          active={filterCat ?? "Todas"}
          onPress={(v) => setFilterCat(v === "Todas" ? null : v)}
        />
      )}

      {/* Tarjeta (flip por fundido) */}
      <View style={styles.cardZone} {...panResponder.panHandlers}>
        {card ? (
          <Animated.View style={[styles.card, { transform: [{ translateX }] }]}>
            {/* Frente = JP */}
            <Animated.View style={[styles.face, { opacity: frontOpacity }]}>
              <Text style={styles.jp}>{card.jp}</Text>
              {showRomaji ? <Text style={styles.romaji}>{card.romaji ?? ""}</Text> : null}
              <View style={styles.cardHintWrap}><Text style={styles.cardHint}>Toca para ver la traducción</Text></View>
            </Animated.View>

            {/* Reverso = ES (texto directamente sobre el reverso) */}
            <Animated.View style={[styles.face, styles.backFace, { opacity: backOpacity }]}>
              <Text style={styles.es}>{mainTr}</Text>

              {extraTr.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  {extraTr.map((t, i) => <Text key={`${card.id}_t${i}`} style={styles.esAlt}>• {t}</Text>)}
                </View>
              )}

              {card.ejJP && card.ejES && (
                <View style={styles.exampleBox}>
                  <Text style={styles.ejJP}>{card.ejJP}</Text>
                  <Text style={styles.ejES}>{card.ejES}</Text>
                </View>
              )}

              <Text style={[styles.romaji, { marginTop: 10, opacity: 0.75 }]}>
                {card.jp}{showRomaji && card.romaji ? ` · ${card.romaji}` : ""}
              </Text>

              {card.cat ? <Text style={styles.badge}>{card.cat}</Text> : null}
            </Animated.View>

            {/* Capa táctil para voltear */}
            <Pressable style={StyleSheet.absoluteFill} onPress={flip} />
          </Animated.View>
        ) : (
          <View style={[styles.card, styles.center]}><Text>No hay tarjetas en este filtro.</Text></View>
        )}
      </View>

      {/* Botonera */}
      <View style={styles.bottomControls}>
        <Button label="◀︎ Anterior" onPress={prevCard} />
        <Button label="🔁 Voltear" onPress={flip} />
        <Button label="▶︎ TTS" onPress={speakCurrent} disabled={!ttsEnabled} />
      </View>

      <View style={styles.answerControls}>
        <Button styleType="ok" label="✓ Correcta" onPress={markKnown} />
        <Button styleType="hard" label="★ Difícil" onPress={markHard} />
        <Button styleType="ghost" label="Reiniciar" onPress={resetProgress} />
        <Button styleType="ghost" label="Siguiente ▶︎" onPress={nextCard} />
      </View>

      {/* Pie */}
      <View style={styles.footer}>
        <Text numberOfLines={1} style={styles.footerText}>{index + 1} / {workingDeck.length}</Text>
      </View>
    </SafeAreaView>
  );
}

/** ============================
 *  UI Helpers (Chips / Toggle / Button)
 *  ============================ */
function ScrollChips({
  items,
  active,
  onPress,
}: {
  items: string[];
  active: string;
  onPress: (v: string) => void;
}) {
  return (
    <View style={styles.chipsRow}>
      {items.map((it) => {
        const activeChip = it === active;
        return (
          <Pressable key={it} onPress={() => onPress(it)} style={[styles.chip, activeChip && styles.chipActive]}>
            <Text style={[styles.chipText, activeChip && styles.chipTextActive]}>{it}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Toggle({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.knob, value && styles.knobOn]} />
      <Text style={styles.toggleLabel}>{label}</Text>
    </Pressable>
  );
}

function Button({
  label,
  onPress,
  disabled,
  styleType = "primary",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  styleType?: "primary" | "ok" | "hard" | "ghost";
}) {
  const styleMap = {
    primary: styles.btn,
    ok: [styles.btn, styles.btnOk],
    hard: [styles.btn, styles.btnHard],
    ghost: [styles.btn, styles.btnGhost],
  } as const;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styleMap[styleType],
        disabled && { opacity: 0.4 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

/** ============================
 *  Estilos
 *  ============================ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F3EA" },
  center: { alignItems: "center", justifyContent: "center" },

  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 22, fontWeight: "700", color: "#3B2F2F" },
  subtitle: { fontSize: 13, color: "#6B5F5A" },

  helpBox: {
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 2,
    backgroundColor: "#FFF9F0",
    borderColor: "#E7D8B9",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  helpTitle: { fontSize: 14, fontWeight: "800", color: "#3B2F2F", marginBottom: 6 },
  helpText: { fontSize: 12, color: "#5F544D", lineHeight: 18 },
  helpClose: { alignSelf: "flex-end", marginTop: 8, paddingHorizontal: 8, paddingVertical: 4 },
  helpCloseText: { fontSize: 12, color: "#8A6B2E", fontWeight: "700" },

  progressWrap: { paddingHorizontal: 16, paddingVertical: 8 },
  progressBg: { height: 8, backgroundColor: "#E3D9C8", borderRadius: 8, overflow: "hidden" },
  progressFg: { height: 8, backgroundColor: "#C79A3E" },
  progressText: { marginTop: 6, fontSize: 12, color: "#6B5F5A" },

  topControls: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "space-between",
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: "#EDE5D7" },
  chipActive: { backgroundColor: "#C79A3E" },
  chipText: { fontSize: 12, color: "#6B5F5A" },
  chipTextActive: { color: "white", fontWeight: "700" },

  cardZone: { flex: 1, padding: 16, alignItems: "center", justifyContent: "center" },
  card: {
    width: "92%",
    height: "76%",
    borderRadius: 20,
    backgroundColor: "#FFFDF8",
    borderWidth: 2,
    borderColor: "#E0D4BE",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  face: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  backFace: { backgroundColor: "#FEF8EC" },

  jp: { fontSize: 64, lineHeight: 72, color: "#2F2A24", fontWeight: "800", textAlign: "center" },
  romaji: { marginTop: 12, fontSize: 18, color: "#7A6E66", textAlign: "center" },

  es: { fontSize: 28, color: "#2F2A24", fontWeight: "700", textAlign: "center" },
  esAlt: { fontSize: 18, color: "#3A332E", textAlign: "center" },

  exampleBox: { marginTop: 12, padding: 10, borderRadius: 8, backgroundColor: "#F0E6D2" },
  ejJP: { fontSize: 20, fontWeight: "600", color: "#2F2A24", textAlign: "center" },
  ejES: { fontSize: 16, fontStyle: "italic", color: "#5A4C42", textAlign: "center", marginTop: 2 },

  badge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#C79A3E",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  cardHintWrap: { position: "absolute", bottom: 16 },
  cardHint: { fontSize: 12, color: "#8B7F77" },

  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  answerControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },

  btn: {
    flex: 1,
    backgroundColor: "#2F2A24",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  btnOk: { backgroundColor: "#33A06F" },
  btnHard: { backgroundColor: "#C05746" },
  btnGhost: { backgroundColor: "#EDE5D7" },
  btnText: { color: "#FFF", fontWeight: "700" },

  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#EDE5D7",
    borderRadius: 999,
  },
  toggleOn: { backgroundColor: "#C79A3E" },
  knob: { width: 16, height: 16, borderRadius: 999, backgroundColor: "#C9BBA5" },
  knobOn: { backgroundColor: "#FFF" },
  toggleLabel: { fontSize: 12, color: "#3B2F2F", fontWeight: "700" },

  footer: { alignItems: "center", paddingBottom: 10, paddingTop: 4 },
  footerText: { fontSize: 12, color: "#6B5F5A" },
});
