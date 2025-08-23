// src/screens/N5/Bienvenida.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';


type RootStackParamList = {
  N5Bienvenida: undefined;
  TemaN5: { id: string; title: string };
};

type Nav = NativeStackNavigationProp<RootStackParamList, 'N5Bienvenida'>;

const BG_PATTERN   = require('../../../assets/images/pattern_seigaiha.webp');
const ICON_DIVIDER = require('../../../assets/icons/n5/ic_dragon_divider.webp');
const HEADER_IMAGE = require('../../../assets/images/card_bienvenida.webp');

const GOLD  = '#d4af37';
const CREAM = '#F6E6C5';
const INK   = '#0d0f13';

const HERO_HEIGHT = 220;

/* ================== LOTTIES INLINE (funcionan sin archivos externos) ================== */
/** HUMO — bruma suave, 10s loop */
const SMOKE_INLINE: any = {
  v: '5.7.6', fr: 30, ip: 0, op: 300, w: 800, h: 450, nm: 'soft-smoke', ddd: 0, assets: [],
  layers: [
    { ddd: 0, ind: 1, ty: 4, nm: 'smoke1', sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [0], e: [40] }, { t: 80, s: [40], e: [40] }, { t: 150, s: [40], e: [0] }] },
        r: { a: 0, k: 0 },
        p: { a: 1, k: [{ t: 0, s: [380, 440, 0], e: [400, 220, 0] }, { t: 150, s: [400, 220, 0], e: [420, 140, 0] }] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [100, 100, 100], e: [135, 135, 100] }, { t: 150, s: [135, 135, 100], e: [150, 150, 100] }] }
      },
      shapes: [
        { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [280, 170] }, nm: 'ellipse' },
        { ty: 'fl', c: { a: 0, k: [0.92, 0.92, 0.92, 1] }, o: { a: 0, k: 18 }, r: 1, nm: 'fill' },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ], ip: 0, op: 170, st: 0, bm: 0
    },
    { ddd: 0, ind: 2, ty: 4, nm: 'smoke2', sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 40, s: [0], e: [34] }, { t: 110, s: [34], e: [34] }, { t: 180, s: [34], e: [0] }] },
        r: { a: 0, k: 0 },
        p: { a: 1, k: [{ t: 40, s: [420, 440, 0], e: [430, 240, 0] }, { t: 180, s: [430, 240, 0], e: [440, 150, 0] }] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 40, s: [90, 90, 100], e: [120, 120, 100] }, { t: 180, s: [120, 120, 100], e: [140, 140, 100] }] }
      },
      shapes: [
        { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [230, 140] }, nm: 'ellipse' },
        { ty: 'fl', c: { a: 0, k: [0.95, 0.95, 0.95, 1] }, o: { a: 0, k: 16 }, r: 1, nm: 'fill' },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ], ip: 40, op: 220, st: 40, bm: 0
    },
    { ddd: 0, ind: 3, ty: 4, nm: 'smoke3', sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 80, s: [0], e: [28] }, { t: 160, s: [28], e: [28] }, { t: 240, s: [28], e: [0] }] },
        r: { a: 0, k: 0 },
        p: { a: 1, k: [{ t: 80, s: [350, 430, 0], e: [370, 230, 0] }, { t: 240, s: [370, 230, 0], e: [390, 140, 0] }] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 80, s: [85, 85, 100], e: [115, 115, 100] }, { t: 240, s: [115, 115, 100], e: [130, 130, 100] }] }
      },
      shapes: [
        { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [210, 130] }, nm: 'ellipse' },
        { ty: 'fl', c: { a: 0, k: [0.97, 0.97, 0.97, 1] }, o: { a: 0, k: 14 }, r: 1, nm: 'fill' },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ], ip: 80, op: 300, st: 80, bm: 0
    }
  ]
};

/** PÉTALOS — caída sutil en bucle (muy simple) */
const PETALS_INLINE: any = {
  v: '5.7.6', fr: 30, ip: 0, op: 300, w: 800, h: 450, nm: 'petals', ddd: 0, assets: [],
  layers: Array.from({ length: 6 }).map((_, i) => ({
    ddd: 0, ind: i + 10, ty: 4, nm: `petal_${i}`, sr: 1,
    ks: {
      o: { a: 1, k: [{ t: 0 + i * 10, s: [0], e: [95] }, { t: 40 + i * 10, s: [95], e: [95] }, { t: 80 + i * 10, s: [95], e: [0] }] },
      r: { a: 1, k: [{ t: 0 + i * 10, s: [0], e: [360] }, { t: 80 + i * 10, s: [360], e: [720] }] },
      p: { a: 1, k: [{ t: 0 + i * 10, s: [100 + i * 120, -20, 0], e: [60 + i * 120, 470, 0] }] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [65 + i * 3, 65 + i * 3, 100] },
    },
    shapes: [
      { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [18, 12] }, nm: 'ellipse' },
      { ty: 'fl', c: { a: 0, k: [0.95, 0.78, 0.86, 1] }, o: { a: 0, k: 100 }, r: 1, nm: 'fill' },
      { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
    ],
    ip: 0 + i * 10, op: 100 + i * 10, st: 0, bm: 0
  }))
};

/* ================== Ken Burns + DOS Lotties (robusto) ================== */
/* ================== Ken Burns + HUMO + PÉTALOS (con controles) ================== */
function KenBurnsImage({
  source,
  borderRadius = 45,
  zoom = 2,
  shiftX = -12,
  shiftY = 10,
  duration = 14000,
  height = HERO_HEIGHT,
  debug = false,
  lottieRenderMode = (Platform.OS === 'android' ? 'HARDWARE' : 'AUTOMATIC') as 'AUTOMATIC' | 'HARDWARE' | 'SOFTWARE',

  // << NUEVOS CONTROLES >>
  smokeScale = 10,     // ⬅️ humo más grande (1.0 = normal)
  smokeSpeed = 0.3,    // ⬅️ más lento => dura más tiempo (0.35 ≈ 3x más)
  smokeOpacity = 25,  // ⬅️ un poco más visible
  petalsOpacity = 0.35,
}: {
  source: ImageSourcePropType;
  borderRadius?: number;
  zoom?: number;
  shiftX?: number;
  shiftY?: number;
  duration?: number;
  height?: number;
  debug?: boolean;
  lottieRenderMode?: 'AUTOMATIC' | 'HARDWARE' | 'SOFTWARE';
  smokeScale?: number;
  smokeSpeed?: number;
  smokeOpacity?: number;
  petalsOpacity?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const forward = Animated.parallel([
      Animated.timing(scale, { toValue: zoom, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(tx,    { toValue: shiftX, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(ty,    { toValue: shiftY, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]);
    const backward = Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(tx,    { toValue: 0, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(ty,    { toValue: 0, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]);
    const loop = Animated.loop(Animated.sequence([forward, backward]));
    loop.start();
    return () => loop.stop();
  }, [duration, shiftX, shiftY, zoom, scale, tx, ty]);

  return (
    <View style={[styles.heroWrap, { height, borderRadius }]}>
      {/* Capa 1: Imagen */}
      <Animated.Image
        source={source}
        resizeMode="cover"
        style={[styles.heroImg, { transform: [{ scale }, { translateX: tx }, { translateY: ty }], zIndex: 1 }]}
      />

      {/* Capa 2: HUMO (más grande + más lento) */}
      <View
        pointerEvents="none"
        style={[styles.layerWrap, { zIndex: 2, elevation: 2 }, debug && { backgroundColor: 'rgba(0,255,0,0.08)' }]}
      >
        <LottieView
          source={SMOKE_INLINE}
          autoPlay
          loop
          resizeMode="cover"
          renderMode={lottieRenderMode}
          speed={smokeSpeed} // ⬅️ más lento => dura más tiempo
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity: smokeOpacity,
              // ⬇️ humo más grande
              transform: [{ scale: smokeScale }],
            },
          ]}
        />
      </View>

      {/* Capa 3: PÉTALOS */}
      <View
        pointerEvents="none"
        style={[styles.layerWrap, { zIndex: 3, elevation: 3 }, debug && { backgroundColor: 'rgba(255,0,0,0.08)' }]}
      >
        <LottieView
          source={PETALS_INLINE}
          autoPlay
          loop
          resizeMode="cover"
          renderMode={lottieRenderMode}
          speed={1}
          style={[StyleSheet.absoluteFillObject, { opacity: petalsOpacity }]}
        />
      </View>

      {/* Capa 4: Marco dorado */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { borderWidth: 2, borderColor: GOLD, borderRadius, zIndex: 4, elevation: 4 }]}
      />
    </View>
  );
}


/* ================== Pantalla ================== */
export default function Bienvenida() {
  const navigation = useNavigation<Nav>();

  // Sonido al entrar
  const introSound = useRef<Audio.Sound | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound, status } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/InicioN5.mp3'),
          { shouldPlay: true, volume: 0.9 }
        );
        if (!mounted) return;
        introSound.current = sound;
        const st = status as AVPlaybackStatusSuccess;
        if (!st.isLoaded) return;
      } catch { /* silencio si falla */ }
    })();
    return () => {
      mounted = false;
      if (introSound.current) {
        introSound.current.unloadAsync().catch(() => {});
        introSound.current = null;
      }
    };
  }, []);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 28 }}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Image source={BG_PATTERN} style={styles.bg} resizeMode="repeat" />
        <View style={styles.headerInner}>
          {/* Imagen con Ken Burns + Humo + Pétalos */}
          <KenBurnsImage source={HEADER_IMAGE} /* debug */ />

          <Text style={styles.title}>Bienvenido al Nivel Mapache (N5)</Text>
          <Text style={styles.sub}>
            Hiragana ・ Katakana ・ Vocabulario ・ Gramática ・ Cultura ・ Exámenes
          </Text>
          <Image source={ICON_DIVIDER} style={styles.divider} />
          <View style={styles.chipsRow}>
            <Chip text="Bloque 1: Escritura y Fundamentos" />
            <Chip text="Progresivo y gamificado" />
            <Chip text="Preparación JLPT N5" />
          </View>
        </View>
      </View>

      {/* ¿Quiénes somos? */}
      <Card title="¿Quiénes somos?">
        <Text style={styles.p}>
          <Text style={{ fontWeight: '800' }}>Bunkan Nichiboku</Text> es una escuela de japonés con profesores
          certificados y experiencia internacional. Nuestra misión es formar alumnos con habilidades
          comunicativas reales mediante una metodología progresiva y gamificada, preparación para
          los niveles JLPT (N5–N1) y un fuerte enfoque en la cultura y los modales japoneses.
        </Text>
      </Card>

      {/* ¿Qué verás? */}
      <Card title="¿Qué verás en este curso?">
        <Text style={styles.p}>
          Este nivel te lleva desde la escritura básica hasta conversaciones sencillas, con actividades
          interactivas, quizzes cronometrados y logros que impulsan tu motivación.
        </Text>
        <List
          items={[
            '🖌 Escritura: Hiragana・Katakana con trazos y dictados',
            '📚 Vocabulario esencial del día a día',
            '🔑 Gramática básica y partículas con ejercicios guiados',
            '🎌 Cultura japonesa y modales (おじぎ, saludos, costumbres)',
            '📝 Exámenes, puntos (XP), medallas e insignias ocultas',
          ]}
        />
        <View style={styles.row}>
          <Pressable
            style={styles.btnGhost}
            onPress={() => navigation.navigate('TemaN5', { id: 'hiragana', title: 'Hiragana' })}
          >
            <Text style={styles.btnGhostText}>Comenzar con Hiragana</Text>
          </Pressable>
        </View>
      </Card>

      {/* Actividades del Bloque 1 */}
      <Card title="Actividades del Bloque 1 · Escritura y Fundamentos">
        <List
          items={[
            '✍️ Trazos animados de kana (guías visuales + práctica)',
            '🔉 Dictado auditivo: escribe lo que escuchas (kana y sílabas)',
            '🃏 Flashcards con flip 3D (japonés ↔ español + audio)',
            '🧩 Juego de memoria: parejas (kana ↔ imagen/palabra)',
            '🧠 Arrastrar y soltar: ordena sílabas y forma palabras',
            '⏱️ Quiz cronometrado: 5–10 preguntas por sesión',
            '🎯 Mini metas: “3 días de práctica continua”, “100 sílabas correctas”',
            '🎖️ Logros de bloque: “Escriba como mapache”',
          ]}
        />
        <InfoGrid
          stats={[
            { label: 'Sesiones Sugeridas', value: '10' },
            { label: 'Tiempo por sesión', value: '12–15 min' },
            { label: 'Puntos totales', value: '≈ 300 XP' },
            { label: 'Logros', value: '3 medallas' },
          ]}
        />
      </Card>
    </ScrollView>
  );
}

/* ================== Subcomponentes ================== */
function Chip({ text }: { text: string }) {
  return (
    <View style={chipStyles.wrap}>
      <Text style={chipStyles.text}>{text}</Text>
    </View>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.ribbon} />
      <Text style={cardStyles.title}>{title}</Text>
      <View style={cardStyles.sep} />
      {children}
    </View>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      {items.map((t, i) => (
        <Text key={i} style={styles.li}>
          {t}
        </Text>
      ))}
    </View>
  );
}

function InfoGrid({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <View style={gridStyles.grid}>
      {stats.map((s, i) => (
        <View key={i} style={gridStyles.item}>
          <Text style={gridStyles.value}>{s.value}</Text>
          <Text style={gridStyles.label}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

/* ================== Estilos ================== */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: INK },

  header: { position: 'relative' },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.13 },
  headerInner: { paddingTop: 18, paddingBottom: 6, alignItems: 'center', paddingHorizontal: 16 },

  heroWrap: {
    width: '100%',
    height: HERO_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#000',
  },
  heroImg: { width: '100%', height: '100%' },

  // Contenedor genérico para capas Lottie (zIndex/elevation Android)
  layerWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    elevation: 2,
  },

  title: { color: CREAM, fontSize: 22, fontWeight: '900', textAlign: 'center', letterSpacing: 0.3 },
  sub: { color: '#e9dcc0', fontSize: 13, marginTop: 6, textAlign: 'center' },
  divider: { width: 220, height: 72, marginTop: 8, resizeMode: 'contain' },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, justifyContent: 'center' },

  p: { color: '#cdd6e5', fontSize: 14, lineHeight: 20, marginBottom: 10 },

  row: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 },

  btnGhost: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GOLD,
    backgroundColor: 'rgba(212,175,55,0.08)',
    alignSelf: 'flex-start',
  },
  btnGhostText: { color: CREAM, fontWeight: '800', fontSize: 13 },

  li: { color: CREAM, fontSize: 14, fontWeight: '700' },
});

const chipStyles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  text: { color: CREAM, fontWeight: '800', fontSize: 12 },
});

const cardStyles = StyleSheet.create({
  card: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: '#0f141d',
    borderWidth: 1,
    borderColor: '#263144',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  ribbon: {
    position: 'absolute',
    top: -8,
    left: 18,
    width: 120,
    height: 16,
    backgroundColor: GOLD,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    opacity: 0.22,
  },
  title: { color: '#ffffff', fontWeight: '900', fontSize: 18, marginBottom: 8, letterSpacing: 0.2 },
  sep: {
    height: 1,
    backgroundColor: '#2b3548',
    marginBottom: 10,
    marginTop: 2,
    shadowColor: GOLD,
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});

const gridStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  item: {
    flexBasis: '48%',
    backgroundColor: '#111927',
    borderWidth: 1,
    borderColor: '#2e3a51',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  value: { color: CREAM, fontSize: 16, fontWeight: '900' },
  label: { color: '#a9b8d3', marginTop: 4, fontSize: 12, fontWeight: '700' },
});
