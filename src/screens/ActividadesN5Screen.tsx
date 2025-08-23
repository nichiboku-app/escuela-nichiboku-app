// src/screens/ActividadesN5Screen.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image as ExpoImage } from 'expo-image';
import React, { useMemo, useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ModalYouTubePlayer from '../components/ModalYouTubePlayer';
import PetalRain from '../components/PetalRain';

// ⬇️ Usa el tipo global para no duplicar definiciones locales
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ===== IMÁGENES / ICONOS =====
const BG_PATTERN      = require('../../assets/images/pattern_seigaiha.webp');
const ICON_DIVIDER    = require('../../assets/icons/n5/ic_dragon_divider.webp');
const ICON_HOURGLASS  = require('../../assets/icons/n5/ic_hourglass.webp');
const ICON_CLOCK      = require('../../assets/icons/n5/ic_clock.webp');

// Tarjetas
const IMG_CARD_BIENV  = require('../../assets/images/card_bienvenida.webp');
const IMG_CARD_HIRA   = require('../../assets/images/card_hiragana.webp');

// ---- helper: extraer id de YouTube ----
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    if (u.searchParams.get('v')) return u.searchParams.get('v')!;
    const m = u.pathname.match(/\/embed\/([^/?]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export default function ActividadesN5Screen() {
  const navigation = useNavigation<Nav>();
  const [videoId, setVideoId] = useState<string | null>(null);

  const videos = useMemo(
    () => ['https://www.youtube.com/watch?v=SR_LUVpPqwU'],
    []
  );

  const handleOpenVideo = (url: string) => {
    const id = getYouTubeId(url);
    if (id) setVideoId(id);
  };

  return (
    <ImageBackground source={BG_PATTERN} resizeMode="cover" style={styles.bg}>
      {/* 🌟 Pétalos dorados cayendo */}
      <PetalRain count={22} drift={70} sizeMin={26} sizeMax={54} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.titleCream}>NIVEL 5 DE JAPONÉS</Text>

          <View style={styles.mapachePill}>
            <Text style={styles.mapacheText}>Nivel Mapache</Text>
          </View>

          <Image source={ICON_DIVIDER} style={styles.titleDivider} />

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Image source={ICON_HOURGLASS} style={styles.metaIcon} />
              <Text style={styles.metaText}>30 Unidades</Text>
            </View>
            <View style={styles.metaItem}>
              <Image source={ICON_CLOCK} style={styles.metaIcon} />
              <Text style={styles.metaText}>120 horas</Text>
            </View>
          </View>
        </View>

        {/* Tarjetas */}
        <View style={styles.cardsRow}>
          <CourseCard
            image={IMG_CARD_BIENV}
            title={'Bienvenida y estructura\ndel curso'}
            progress={0.65}
            onPress={() => navigation.navigate('N5Bienvenida')} // 👈 ruta única para la bienvenida del N5
          />

          <CourseCard
            image={IMG_CARD_HIRA}
            title={'Hiragana'}
            progress={0.65}
            onPress={() =>
              navigation.navigate('TemaN5', { id: 'hiragana', title: 'Hiragana' })
            }
          />
        </View>

        {/* Botón Continuar */}
        <Pressable style={styles.cta} onPress={() => navigation.navigate('CursoN5')}>
          <Text style={styles.ctaText}>Continuar donde me quedé</Text>
        </Pressable>

        {/* Videos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Videos del curso</Text>
          <Text style={styles.linkAll}>Ver todos</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videosRow}
        >
          {videos.map((url) => (
            <VideoCard key={url} url={url} onOpen={() => handleOpenVideo(url)} />
          ))}
        </ScrollView>
      </ScrollView>

      {/* Modal de reproducción */}
      <ModalYouTubePlayer videoId={videoId} onClose={() => setVideoId(null)} />
    </ImageBackground>
  );
}

/** ---------- COMPONENTES ---------- */

function CourseCard({
  image,
  title,
  progress,
  onPress,
}: {
  image: any;
  title: string;
  progress: number; // 0..1
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardMediaWrap}>
        <ExpoImage
          source={image}
          contentFit="cover"
          style={styles.cardMedia}
          transition={150}
        />
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        <ProgressPill value={progress} />
        <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>
      </View>
    </Pressable>
  );
}

function ProgressPill({ value }: { value: number }) {
  return (
    <View style={styles.pillTrack}>
      <View
        style={[
          styles.pillFill,
          { width: `${Math.min(100, Math.max(0, value * 100))}%` },
        ]}
      />
      <View style={styles.pillDot} />
    </View>
  );
}

function VideoCard({ url, onOpen }: { url: string; onOpen: () => void }) {
  const id = getYouTubeId(url);
  const thumb = id
    ? { uri: `https://img.youtube.com/vi/${id}/hqdefault.jpg` }
    : undefined;

  return (
    <Pressable onPress={onOpen} style={styles.videoThumb}>
      {thumb ? (
        <ExpoImage
          source={thumb}
          contentFit="cover"
          style={styles.videoImage}
          transition={150}
        />
      ) : (
        <View style={styles.videoPlaceholder} />
      )}
    </Pressable>
  );
}

/** ---------- ESTILOS ---------- */

const GOLD = '#d4af37';
const CREAM = '#F6E6C5'; // crema elegante

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  container: { paddingBottom: 48, alignItems: 'center' },

  header: { alignItems: 'center', marginTop: 16, marginBottom: 10 },

  // Título crema
  titleCream: {
    fontSize: 30,
    color: CREAM,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowRadius: 6,
  },

  // Pill "Nivel Mapache"
  mapachePill: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 6,
    backgroundColor: '#0b0b0b',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: GOLD,
  },
  mapacheText: {
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // Separador dragón
  titleDivider: {
    width: 220,
    height: 80,
    marginTop: 10,
    resizeMode: 'contain',
  },

  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaIcon: { width: 28, height: 28, resizeMode: 'contain' },
  metaText: { color: CREAM, fontSize: 14, fontWeight: '700' },

  cardsRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 18, marginTop: 12 },

  // Tarjeta de curso con BORDE DORADO
  card: {
    width: 170,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: GOLD,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },

  cardMediaWrap: {
    width: '100%',
    height: 140,
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  cardMedia: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.12 }],
  },

  cardFooter: { padding: 12, gap: 8, backgroundColor: '#fff' },
  cardTitle: { fontWeight: '800', color: '#111315' },

  pillTrack: {
    height: 14,
    backgroundColor: '#ebd2d6',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  pillFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#d98a97',
    borderRadius: 10,
  },
  pillDot: {
    position: 'absolute',
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#8a0f17',
  },
  percentText: { alignSelf: 'flex-end', fontWeight: '800', color: '#111315' },

  cta: {
    marginTop: 18,
    backgroundColor: '#bf171c',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 26,
  },
  ctaText: { color: '#fff', fontWeight: '800' },

  sectionHeader: {
    width: '100%',
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: CREAM },
  linkAll: {
    fontSize: 14,
    color: CREAM,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: GOLD,
  },

  videosRow: { paddingHorizontal: 18, gap: 12 },

  // Miniatura de video
  videoThumb: {
    width: 180,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#f0ece6',
  },
  videoImage: { width: '100%', height: '100%' },
  videoPlaceholder: { flex: 1, backgroundColor: '#eee2d8' },
});
