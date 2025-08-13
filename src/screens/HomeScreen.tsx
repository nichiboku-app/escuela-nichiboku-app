// src/screens/HomeScreen.tsx
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Asset } from 'expo-asset';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  ProgresoN5: undefined;
  Notas: undefined;
  Calendario: undefined;
  CursoN5: undefined;
  CursoN4: undefined;
  CursoN3: undefined;
  Perfil: undefined;
  Notificaciones: undefined;
  Chat: undefined;
};

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeNav>();
  const [ready, setReady] = useState(false);

  // Precarga imágenes usadas en Home
  useEffect(() => {
    async function preloadImages() {
      try {
        await Asset.loadAsync([
          // Fondos / decor
          require('../../assets/images/final_home_background.webp'),
          require('../../assets/images/cloud_swirl.webp'),

          // Cursos
          require('../../assets/images/cursos/n5_mapache.webp'),
          require('../../assets/images/cursos/n4_zorro.webp'),
          require('../../assets/images/cursos/n3_leon.webp'),
          require('../../assets/images/cursos/n5_mapache_avance.webp'),

          // Íconos header
          require('../../assets/icons/hamburger.webp'),
          require('../../assets/images/avatar_formal.webp'),

          // Íconos pill inferior
          require('../../assets/icons/bell.webp'),
          require('../../assets/icons/heart.webp'),
          require('../../assets/icons/ia.webp'),

          // Ícono reloj
          require('../../assets/icons/clock.webp'),

          // Gradiente tarjeta wide
          require('../../assets/images/gradient_red.webp'),
        ]);
      } catch (e) {
        console.warn('Error precargando imágenes', e);
      } finally {
        setReady(true);
      }
    }
    preloadImages();
  }, []);

  const openDrawer = () =>
    (navigation as any).dispatch(DrawerActions.openDrawer());

  const go = (route: keyof RootStackParamList) => {
    const parent = (navigation as any).getParent?.();
    if (parent?.navigate) parent.navigate(route as never);
    else (navigation as any).navigate(route as never);
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#b6111b" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Fondo absoluto, sin distorsión */}
      <ImageBackground
        source={require('../../assets/images/final_home_background.webp')}
        style={StyleSheet.absoluteFill}
        imageStyle={{ resizeMode: 'cover' }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.hamburger}
              activeOpacity={0.7}
              onPress={openDrawer}
            >
              <Image
                source={require('../../assets/icons/hamburger.webp')}
                style={styles.hamburgerIcon}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Hola, mapache</Text>

            <TouchableOpacity onPress={() => go('Perfil')} activeOpacity={0.8}>
              <Image
                source={require('../../assets/images/avatar_formal.webp')}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>

          {/* Card Progreso */}
          <View style={styles.progressCard}>
            <Image
              source={require('../../assets/images/cloud_swirl.webp')}
              style={styles.cloudDecor}
              resizeMode="contain"
            />
            <View style={styles.progressRow}>
              <View style={styles.levelCircle}>
                <Image
                  source={require('../../assets/images/cursos/n5_mapache_avance.webp')}
                  style={styles.levelIcon}
                />
              </View>
              <View style={styles.progressTextCol}>
                <Text style={styles.progressTitle}>
                  Consulta tu avance{'\n'}en el nivel N5
                </Text>
                <View style={styles.dotsRow}>
                  <View style={[styles.dot, styles.dotActive]} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.progressBtn}
              onPress={() => go('ProgresoN5')}
              activeOpacity={0.9}
            >
              <Text style={styles.progressBtnText}>Ver progreso N5</Text>
            </TouchableOpacity>
          </View>

          {/* Tarjetas de cursos */}
          <View style={styles.cardsGrid}>
            <CourseCard
              color="#7a0e14"
              title="Tanuki: Nivel N5"
              minutes="50 minutos"
              image={require('../../assets/images/cursos/n5_mapache.webp')}
              onPress={() => go('CursoN5')}
            />
            <CourseCard
              color="#b2453c"
              title="Kitsune: Nivel N4"
              minutes="50 minutos"
              image={require('../../assets/images/cursos/n4_zorro.webp')}
              onPress={() => go('CursoN4')}
            />
            <CourseWide
              from="#f8b7a9"
              to="#c3192e"
              title="Ryū: Nivel N3"
              minutes="50 minutos"
              image={require('../../assets/images/cursos/n3_leon.webp')}
              onPress={() => go('CursoN3')}
            />
          </View>

          {/* espacio extra para no tapar contenido con el pill fijo */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* === PILL FIJO (negro sólido) === */}
        <View pointerEvents="box-none" style={styles.bottomBarFixed}>
          <View style={styles.bottomBg}>
            <TouchableOpacity onPress={() => go('Notificaciones')} style={styles.bottomItem} activeOpacity={0.8}>
              <Image source={require('../../assets/icons/bell.webp')} style={styles.bottomIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => go('Notas')} style={styles.bottomItem} activeOpacity={0.8}>
              <Image source={require('../../assets/icons/heart.webp')} style={styles.bottomIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => go('Chat')} style={styles.bottomItem} activeOpacity={0.8}>
              <Image source={require('../../assets/icons/ia.webp')} style={styles.bottomIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function CourseCard({
  color,
  title,
  minutes,
  image,
  onPress,
}: {
  color: string;
  title: string;
  minutes: string;
  image: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: color }]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardArt}>
        <Image source={image} style={styles.cardIcon} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.timeRow}>
          <Image source={require('../../assets/icons/clock.webp')} style={styles.timeIcon} />
          <Text style={styles.timeText}>{minutes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CourseWide({
  from,
  to,
  title,
  minutes,
  image,
  onPress,
}: {
  from: string;
  to: string;
  title: string;
  minutes: string;
  image: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.wide} onPress={onPress} activeOpacity={0.9}>
      <ImageBackground
        source={require('../../assets/images/gradient_red.webp')}
        style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
        imageStyle={{ borderRadius: 22 }}
      />
      <View style={styles.wideRow}>
        <Image source={image} style={styles.wideIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.wideTitle}>{title}</Text>
          <View style={styles.timeRow}>
            <Image source={require('../../assets/icons/clock.webp')} style={styles.timeIcon} />
            <Text style={styles.timeText}>{minutes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // padding superior e inferior del contenido scrolleable
  scroll: { paddingTop: 50, paddingBottom: 120 },

  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hamburger: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  hamburgerIcon: { width: 80, height: 80, resizeMode: 'contain' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '800' },
  avatar: { width: 80, height: 80, borderRadius: 19, resizeMode: 'cover' },

  progressCard: {
    backgroundColor: '#b6111b',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cloudDecor: {
    position: 'absolute',
    right: 14,
    top: 10,
    width: 90,
    height: 60,
    opacity: 1,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5e9e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelIcon: { width: 120, height: 120, resizeMode: 'contain' },
  progressTextCol: { flex: 1, paddingRight: 60 },
  progressTitle: { color: '#fff', fontSize: 16, fontWeight: '800', lineHeight: 24 },
  dotsRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff' },
  progressBtn: {
    backgroundColor: '#f7f7f7',
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  progressBtnText: { fontWeight: '800' },

  cardsGrid: {
    marginTop: 16,
    paddingHorizontal: 16,
    rowGap: 12,
    columnGap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    width: (width - 16 * 2 - 12) / 2,
    borderRadius: 18,
    padding: 12,
  },
  cardArt: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cardIcon: { width: 160, height: 90, resizeMode: 'contain' },
  cardTitle: { color: '#fff', fontWeight: '800', marginBottom: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeIcon: { width: 14, height: 14, resizeMode: 'contain', tintColor: '#fff' },
  timeText: { color: '#fff' },

  wide: { width: '100%', borderRadius: 22, padding: 14 },
  wideRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wideIcon: { width: 105, height: 105, resizeMode: 'contain' },
  wideTitle: { color: '#fff', fontWeight: '800', fontSize: 16, marginBottom: 6 },

  // --- PILL FIJO (negro sólido) ---
  bottomBarFixed: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  bottomBg: {
    width: '70%',
    height: 74,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  bottomItem: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  bottomIcon: { width: 32, height: 32, resizeMode: 'contain' }, // iconos un poquito más grandes
});
