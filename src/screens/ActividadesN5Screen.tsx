// src/screens/ActividadesN5Screen.tsx
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image as ExpoImage } from 'expo-image'; // ⬅️ para "recortar" visualmente
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

type RootStackParamList = {
  ActividadesN5: undefined;
  CursoN5: undefined;
  TemaN5: { id: string; title: string };
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BG_PATTERN      = require('../../assets/images/pattern_seigaiha.webp');
const ICON_DIVIDER    = require('../../assets/icons/n5/ic_title_divider.webp');
const ICON_HOURGLASS  = require('../../assets/icons/n5/ic_hourglass.webp');
const ICON_CLOCK      = require('../../assets/icons/n5/ic_clock.webp');
const ICON_SAKURA     = require('../../assets/icons/n5/ic_sakura_small.webp'); // opcional
const ICON_HAMBURGER  = require('../../assets/icons/hamburger.webp'); // ya existente

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

  // Tu versión no acepta id en getParent; úsalo sin args
  const openDrawer = () => {
    const parent = navigation.getParent?.();
    if (parent) {
      (parent as any).openDrawer?.();
      parent.dispatch?.(DrawerActions.openDrawer());
      return;
    }
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // Miniaturas de YouTube (agrega más URLs si quieres)
  const videos = useMemo(
    () => ['https://www.youtube.com/watch?v=SR_LUVpPqwU'],
    []
  );

  // Abre el modal con el ID del video
  const handleOpenVideo = (url: string) => {
    const id = getYouTubeId(url);
    if (id) setVideoId(id);
  };

  return (
    <ImageBackground source={BG_PATTERN} resizeMode="cover" style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Barra superior */}
        <View style={styles.topBar}>
          <Pressable
            onPress={openDrawer}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.menuBtn}
          >
            <Image source={ICON_HAMBURGER} style={styles.menuIcon} />
          </Pressable>
        </View>

        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Nivel 5 de japonés</Text>
          <Text style={styles.title}>Nivel Mapache</Text>
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

        {/* Sakura decorativa opcional */}
        <Image source={ICON_SAKURA} style={styles.sakuraLeft} />
        <Image source={ICON_SAKURA} style={styles.sakuraRight} />

        {/* Tarjetas */}
        <View style={styles.cardsRow}>
          <CourseCard
            image={IMG_CARD_BIENV}
            title={'Bienvenida y estructura\ndel curso'}
            progress={0.65}
            onPress={() =>
              navigation.navigate('TemaN5', { id: 'bienvenida', title: 'Bienvenida' })
            }
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

      {/* Modal de reproducción (autoplay desactivado en el componente) */}
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
      {/* Contenedor que recorta y redondea */}
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

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  container: { paddingBottom: 48, alignItems: 'center' },

  // HAMBURGER
  topBar: {
    width: '100%',
    paddingTop: 8,
    paddingHorizontal: 22,
    alignItems: 'flex-start',
  },
  menuBtn: { padding: 8, borderRadius: 12, marginTop: 10 },
  menuIcon: { width: 40, height: 32, tintColor: '#111315', resizeMode: 'contain' },

  header: { alignItems: 'center', marginTop: 6, marginBottom: 10 },
  title: { fontSize: 32, color: '#bf171c', fontWeight: '900', letterSpacing: 0.5 },
  titleDivider: { width: 220, height: 95, marginTop: 6, resizeMode: 'contain' },

  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaIcon: { width: 58, height: 58, resizeMode: 'contain' },
  metaText: { color: '#6a6a6a', fontSize: 14 },

  sakuraLeft: { position: 'absolute', left: 8, top: 140, width: 72, height: 72, opacity: 0.7 },
  sakuraRight: { position: 'absolute', right: 12, top: 430, width: 88, height: 88, opacity: 0.6 },

  cardsRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 18, marginTop: 12 },

  // === Tarjeta de curso con marco negro ===
  card: {
    width: 170,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,          // marco negro
    borderColor: '#000',     // marco negro
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  // Contenedor que recorta y mantiene radios arriba
  cardMediaWrap: {
    width: '100%',
    height: 140,
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  // Imagen "zoom" sutil para comer márgenes del asset
  cardMedia: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.15 }], // ajusta 1.03–1.12 según tu asset
  },

  cardFooter: { padding: 12, gap: 8 },
  cardTitle: { fontWeight: '700', color: '#111315' },

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
  percentText: { alignSelf: 'flex-end', fontWeight: '700', color: '#111315' },

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
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#6a6a6a' },
  linkAll: { fontSize: 14, color: '#bf171c', fontWeight: '700' },

  videosRow: { paddingHorizontal: 18, gap: 12 },

  // === Miniatura de video con marco negro y cover ===
  videoThumb: {
    width: 180,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,          // marco negro
    borderColor: '#000',     // marco negro
    backgroundColor: '#f0ece6',
  },
  videoImage: { width: '100%', height: '100%' },
  videoPlaceholder: { flex: 1, backgroundColor: '#eee2d8' },
});
