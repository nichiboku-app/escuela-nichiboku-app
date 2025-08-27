// src/screens/BienvenidaCursoN5_1Screen.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

import SakuraFall from '../components/SakuraFall';
import { BulletItem } from '../components/ui/BulletItem';
import { GhostButton, PrimaryButton } from '../components/ui/Buttons';
import { ChipTag } from '../components/ui/ChipTag';
import { getLastLocation } from '../services/progress';

// ===== Tipos locales (puedes reemplazar por tu RootStackParamList global) =====
type RootStackParamList = {
  BienvenidaCursoN5_1: undefined;
  CursoN5: undefined;
  TemaN5: undefined | { title?: string };
  EntradaActividadesN5: undefined;
  IntroJapones: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

// imágenes
const HERO_SRC     = require('../../assets/images/imagenBienvenida.webp');
const BG_IMG       = require('../../assets/images/fondo3.webp');
const SAKURA_DECOR = require('../../assets/icons/sakura1.webp');
const MARCO_LEFT   = require('../../assets/icons/marco1.webp');
const MARCO_RIGHT  = require('../../assets/icons/marco2.webp');

function Decor({ source, style }: { source: any; style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={style}>
      <ExpoImage source={source} style={StyleSheet.absoluteFill} contentFit="contain" />
    </View>
  );
}
function FrameOverlay({ source, style }: { source: any; style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, style]}>
      <ExpoImage source={source} style={StyleSheet.absoluteFill} contentFit="cover" />
    </View>
  );
}

export default function BienvenidaCursoN5_1Screen() {
  const navigation = useNavigation<Nav>();
  useWindowDimensions();

  // 🔧 navegar al root aunque estemos en un stack anidado
  const goRoot = (route: keyof RootStackParamList, params?: any) => {
    const parent = navigation.getParent();
    if (parent) (parent as any).navigate(route as any, params);
    else (navigation as any).navigate(route as any, params);
  };

  // Mapa de normalización de nombres de ruta
  const routeMap = {
    IntroJapones: 'IntroJapones',
    IntroJaponesScreen: 'IntroJapones',
    EntradaActividadesN5: 'EntradaActividadesN5',
    TemaN5: 'TemaN5',
    CursoN5: 'CursoN5',
    BienvenidaCursoN5_1: 'BienvenidaCursoN5_1',
  } as const;
  type RouteMapKey = keyof typeof routeMap;
  const normalizeRoute = (r?: string): keyof RootStackParamList | null =>
    r && (routeMap as Record<string, keyof RootStackParamList>)[r] ? routeMap[r as RouteMapKey] : null;

  // 👇 Handler del botón "Continuar donde te quedaste"
  type SavedLoc = string | { route: string; params?: any } | null;
  const handleContinue = async () => {
    try {
      const lastRaw = (await getLastLocation()) as SavedLoc;

      const lastRoute = typeof lastRaw === 'string' ? lastRaw : lastRaw?.route;
      const params    = typeof lastRaw === 'string' ? undefined : lastRaw?.params;

      const normalized = normalizeRoute(lastRoute);
      if (normalized) {
        goRoot(normalized, params ?? {});
      } else {
        goRoot('EntradaActividadesN5'); // fallback
      }
    } catch {
      goRoot('EntradaActividadesN5');
    }
  };

  return (
    <View style={s.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Fondo con imagen */}
      <ImageBackground source={BG_IMG} resizeMode="cover" style={StyleSheet.absoluteFillObject} />

      {/* Pétalos al fondo */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <SakuraFall count={18} baseDuration={10000} wind={36} sway={26} opacity={0.25} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.h1}>Curso de Japonés N5</Text>
        <Text style={s.sub}>Presentación del nivel y acceso a tus actividades.</Text>

        {/* HERO */}
        <View style={s.heroFrameGold}>
          <ExpoImage source={HERO_SRC} style={s.heroImage} contentFit="cover" transition={250} />
        </View>

        {/* ¿Qué aprenderás? —— tarjeta blanca */}
        <View style={s.cardWhiteFull}>
          <Text style={s.cardTitle}>¿Qué aprenderás?</Text>
          <View style={{ marginTop: 6 }}>
            <BulletItem>Hiragana y Katakana completos</BulletItem>
            <BulletItem>Vocabulario esencial (saludos, familia, tiempo)</BulletItem>
            <BulletItem>Gramática básica: です／ます, これ・それ・あれ, partículas は・が・を・に</BulletItem>
            <BulletItem>Verbos en forma -ます (presente, pasado, negativo)</BulletItem>
            <BulletItem>Lectura y comprensión auditiva</BulletItem>
            <BulletItem>Entre otros 100 temas más…</BulletItem>
          </View>
          <Decor source={SAKURA_DECOR} style={s.sakuraCorner} />
        </View>

        {/* Requisitos / Método —— tarjetas blancas */}
        <View style={s.row}>
          <View style={[s.col, s.cardWhiteFull]}>
            {/* <FrameOverlay source={MARCO_LEFT} style={s.cardFrameOverlay} /> */}
            <Text style={s.cardTitle}>Requisitos</Text>
            <BulletItem>Cero o poca base de japonés</BulletItem>
            <BulletItem>15 min diarios de estudio recomendado</BulletItem>
            <BulletItem>Cuaderno para notas ✍️</BulletItem>
          </View>

          <View style={[s.col, s.cardWhiteFull]}>
            {/* <FrameOverlay source={MARCO_RIGHT} style={s.cardFrameOverlay} /> */}
            <Text style={s.cardTitle}>Método</Text>
            <BulletItem>Actividades interactivas y mini-exámenes</BulletItem>
            <BulletItem>Audio nativo para pronunciación</BulletItem>
            <BulletItem>Gamificación: puntos y logros</BulletItem>
          </View>
        </View>

        {/* Incluye —— tarjeta blanca */}
        <View style={s.cardWhiteFull}>
          <Text style={s.cardTitle}>Incluye</Text>
          <View style={s.chips}>
            <ChipTag icon={<Ionicons name="headset" size={14} color="#A93226" />} label="Escucha" />
            <ChipTag icon={<Ionicons name="mic" size={14} color="#A93226" />} label="Pronunciación" />
            <ChipTag icon={<Ionicons name="book" size={14} color="#A93226" />} label="Lecturas" />
            <ChipTag icon={<MaterialCommunityIcons name="gamepad-variant-outline" size={14} color="#A93226" />} label="Juegos" />
            <ChipTag icon={<Ionicons name="stats-chart" size={14} color="#A93226" />} label="Progreso" />
          </View>
        </View>

        {/* CTA: Continuar + Entrar */}
        <View style={s.ctaCol}>
          <PrimaryButton title="Continuar donde te quedaste" onPress={handleContinue} />
          <PrimaryButton
            title="Entrar a las actividades N5"
            onPress={() => goRoot('IntroJapones')}
          />
        </View>

        <View style={s.actionsRow}>
          <GhostButton title="Examen diagnóstico" onPress={() => {}} style={{ flex: 1 }} />
          <GhostButton title="Comprar membresía" onPress={() => {}} style={{ flex: 1 }} />
        </View>

        <Text style={s.tip}>
          Consejo: completa 1–2 actividades por día. Tu avance y logros aparecerán aquí cuando conectemos tu perfil.
        </Text>
      </ScrollView>

      {/* Pétalos por delante — ultra sutil */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <SakuraFall count={8} baseDuration={9500} wind={40} sway={28} opacity={0.06} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ECEFF3' },
  content: { padding: 20, paddingBottom: 40, gap: 14 },

  h1: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', textAlign: 'left', marginTop: 55 },
  sub: { color: '#444', marginTop: 15, marginBottom: 6 },

  // TARJETA BLANCA PURA
  cardWhiteFull: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E6EAF0',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    overflow: 'hidden',
  },

  // HERO
  heroFrameGold: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#C8A046',
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
    aspectRatio: 16 / 9,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  heroImage: { width: '100%', height: '100%' },

  row: { flexDirection: 'row', gap: 14 },
  col: { flex: 1 },

  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },

  // CTA column
  ctaCol: { gap: 10, marginTop: 6 },

  actionsRow: { flexDirection: 'row', gap: 12 },
  tip: { color: '#444', fontSize: 12, marginTop: 8, textAlign: 'center' },

  sakuraCorner: {
    position: 'absolute',
    right: -16,
    bottom: 8,
    width: 120,
    height: 90,
    opacity: 0.85,
  },
  cardFrameOverlay: {
    left: -2, right: -2, top: -2, bottom: -2,
    opacity: 0.4,
  },
});
