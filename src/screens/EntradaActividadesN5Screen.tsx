// src/screens/IntroJaponesScreen.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import type { RootStackParamList as AppRoutes } from '../../types'; // 👈 usa tu tipo global
import { rememberLocation } from '../services/progress';

// ===== ASSETS =====
const TEMPLE  = require('../../assets/icons/intro/icon_temple_pagoda.webp');
const CLOUDS  = require('../../assets/icons/intro/decor_red_clouds.webp');
const PATTERN = require('../../assets/icons/intro/bg_seigaiha.webp');

const ICON_SCROLL   = require('../../assets/icons/intro/icon_scroll_kanji.webp');
const ICON_BRUSH    = require('../../assets/icons/intro/icon_brush_ink.webp');
const ICON_GEISHA   = require('../../assets/icons/intro/icon_geisha_mask.webp');

const ICON_PLAY     = require('../../assets/icons/intro/icon_video_play.webp');
const ICON_QUIZ     = require('../../assets/icons/intro/icon_quiz_book.webp');
const ICON_KOKESHI  = require('../../assets/icons/intro/icon_kokeshi.webp');
const ICON_BOOK     = require('../../assets/icons/intro/icon_book_info.webp');

// ===== NAV TYPES =====
// Extiende tu RootStackParamList con las rutas de actividades usadas aquí
type LocalNavParams = AppRoutes & {
  VideoIntro?: undefined;
  QuizCultural?: undefined;
  GifSaludo?: undefined;
};
type Nav = NativeStackNavigationProp<LocalNavParams>;

export default function IntroJaponesScreen() {
  const navigation = useNavigation<Nav>();

  const go = <T extends keyof LocalNavParams>(route: T, params?: LocalNavParams[T]) => {
    rememberLocation('IntroJapones');
    (navigation as any).navigate(route as string, params as any);
  };

  // 3 columnas perfectamente alineadas
  const { width } = useWindowDimensions();
  const SIDE = 16;
  const GAP  = 12;
  const CARD_W = Math.floor((width - SIDE * 2 - GAP * 2) / 3);

  return (
    <View style={s.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* HEADER: gradiente + nubes + pagoda */}
      <View style={s.header}>
        <LinearGradient
          colors={['#6B0015', '#842238', '#B59AA6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <ExpoImage source={CLOUDS} style={s.clouds} contentFit="cover" />
        <ExpoImage source={TEMPLE} style={s.temple} contentFit="contain" />
        <View style={s.headerTextWrap}>
          <Text style={s.h1}>INTRODUCCIÓN AL{'\n'}JAPONÉS</Text>
          <Text style={s.school}>Escuela Bunkan Nichiboku</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.cc} showsVerticalScrollIndicator={false}>
        <ImageBackground source={PATTERN} style={s.pattern} imageStyle={s.patternImg}>
          {/* ===== SUBTEMAS ===== */}
          <Text style={s.sectionTitle}>Subtemas principales</Text>

          <View style={s.row}>
            <CardSolid
              bg="#DCDCE6"
              icon={ICON_SCROLL}
              label="Orígenes del idioma"
              onPress={() => go('OrigenesDelIdioma')}
              style={{ width: CARD_W }}
            />
            <CardSolid
              bg="#9EB2A5"
              icon={ICON_BRUSH}
              label="Sistemas de escritura"
              onPress={() => go('EscrituraN5')}
              style={{ width: CARD_W }}
            />
            <CardSolid
              bg="#EF6C73"
              icon={ICON_GEISHA}
              label="Cultura básica"
              onPress={() => go('CulturaN5')}
              style={{ width: CARD_W }}
            />
          </View>

          <View style={s.sectionSpacer} />

          {/* ===== ACTIVIDADES ===== */}
          <Text style={s.sectionTitle}>Actividades</Text>

          <View style={s.row}>
            <CardBig icon={ICON_PLAY}    label="Video introductorio" onPress={() => go('VideoIntro'   as any)} bg="#7A1E2B" />
            <CardBig icon={ICON_QUIZ}    label="Quiz cultural"       onPress={() => go('QuizCultural' as any)} bg="#1F3A4A" />
            <CardBig icon={ICON_KOKESHI} label="Gif saludo japonés"  onPress={() => go('GifSaludo'    as any)} bg="#D7A146" />
          </View>

          <View style={s.sectionSpacer} />

          {/* ===== INFO BOX ===== */}
          <View style={s.infoBox}>
            <ExpoImage source={ICON_BOOK} style={s.infoIcon} contentFit="contain" />
            <Text style={s.infoText}>
              La Escuela Bunkan Nichiboku te acompaña en tu viaje al japonés con cursos desde N5
              hasta N1, actividades interactivas y una comunidad apasionada.
            </Text>
          </View>

          <View style={{ height: 32 }} />
        </ImageBackground>
      </ScrollView>
    </View>
  );
}

/* ---------- UI Components ---------- */
function CardSolid({
  icon,
  label,
  onPress,
  bg,
  style,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  bg: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.cardSolid, { backgroundColor: bg }, style, pressed && s.pressed]}
    >
      <ExpoImage source={icon} style={s.cardSolidIcon} contentFit="contain" />
      <Text style={s.cardSolidText}>{label}</Text>
    </Pressable>
  );
}

function CardBig({
  icon,
  label,
  onPress,
  bg,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  bg: string;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.cardBig, { backgroundColor: bg }, pressed && s.pressed]}>
      <ExpoImage source={icon} style={s.cardBigIcon} contentFit="contain" />
      <Text style={s.cardBigText}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Styles ---------- */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    height: 170,
    paddingTop: 56,
    paddingHorizontal: 18,
    justifyContent: 'flex-end',
  },
  headerTextWrap: { paddingBottom: 10 },
  h1: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  school: { color: '#f5e3e3', marginTop: 6 },

  temple: { position: 'absolute', right: 16, top: 8, width: 138, height: 138, opacity: 0.95 },
  clouds: { position: 'absolute', left: 0, right: 0, bottom: -4, height: 110, opacity: 0.35 },

  cc: { flexGrow: 1 },
  pattern: { flex: 1, paddingHorizontal: 16, paddingTop: 40, paddingBottom: 48 },
  patternImg: { opacity: 0.12 },

  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', marginBottom: 28 },
  sectionSpacer: { height: 56 },

  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },

  // Subtemas sólidos
  cardSolid: {
    aspectRatio: 1 / 1.15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardSolidIcon: { width: 84, height: 84, marginBottom: 4 },
  cardSolidText: { color: '#fff', fontWeight: '800', fontSize: 12, textAlign: 'center', marginTop: -6 },

  // Actividades
  cardBig: {
    flexGrow: 1,
    flexBasis: '30%',
    height: 120,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  cardBigIcon: { width: 72, height: 72, marginBottom: 6 },
  cardBigText: { color: '#fff', fontWeight: '800', textAlign: 'center', marginTop: -4 },

  // Info box
  infoBox: {
    backgroundColor: '#F6EFE3',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E9DFC9',
  },
  infoIcon: { width: 32, height: 32 },
  infoText: { flex: 1, color: '#3b2b1b', fontWeight: '600' },

  pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
});
