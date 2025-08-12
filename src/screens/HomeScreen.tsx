import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
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

  const openDrawer = () =>
    (navigation as any).dispatch(DrawerActions.openDrawer());

  const go = (route: keyof RootStackParamList) => {
    const parent = (navigation as any).getParent?.();
    if (parent?.navigate) parent.navigate(route as never);
    else (navigation as any).navigate(route as never);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Fondo absoluto, sin distorsión */}
      <ImageBackground
        source={require('../../assets/images/final_home_background.png')}
        style={StyleSheet.absoluteFill}
        imageStyle={{ resizeMode: 'cover' }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Contenido scrollable */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.hamburger}
              activeOpacity={0.7}
              onPress={openDrawer}
            >
              <Image
                source={require('../../assets/icons/hamburger.png')}
                style={styles.hamburgerIcon}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Hola, mapache</Text>

            <TouchableOpacity onPress={() => go('Perfil')} activeOpacity={0.8}>
              <Image
                source={require('../../assets/images/avatar_formal.png')}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>

          {/* Card Progreso (roja) */}
          <View style={styles.progressCard}>
            {/* Nube decorativa arriba-derecha */}
            <Image
              source={require('../../assets/images/cloud_swirl.png')}
              style={styles.cloudDecor}
              resizeMode="contain"
            />

            <View style={styles.progressRow}>
              <View style={styles.levelCircle}>
                <Image
                  source={require('../../assets/images/cursos/n5_mapache_avance.png')}
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

          {/* Notas / Calendario con marco */}
          <View style={styles.frameWrapper}>
            <Image
              source={require('../../assets/images/frame_washi.png')}
              style={styles.frameBg}
              resizeMode="stretch"
            />
            <View style={styles.frameContent}>
              <TouchableOpacity style={styles.frameButton} onPress={() => go('Notas')}>
                <Image source={require('../../assets/icons/notas.png')} style={styles.frameIcon} />
                <Text style={styles.frameText}>Notas</Text>
              </TouchableOpacity>

              <View style={styles.frameDivider} />

              <TouchableOpacity
                style={styles.frameButton}
                onPress={() => go('Calendario')}
              >
                <Image source={require('../../assets/icons/calendario.png')} style={styles.frameIcon} />
                <Text style={styles.frameText}>Calendario</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tarjetas de cursos */}
          <View style={styles.cardsGrid}>
            <CourseCard
              color="#7a0e14"
              title="Tanuki: Nivel N5"
              minutes="50 minutos"
              image={require('../../assets/images/cursos/n5_mapache.png')}
              onPress={() => go('CursoN5')}
            />
            <CourseCard
              color="#b2453c"
              title="Kitsune: Nivel N4"
              minutes="50 minutos"
              image={require('../../assets/images/cursos/n4_zorro.png')}
              onPress={() => go('CursoN4')}
            />

            <CourseWide
              from="#f8b7a9"
              to="#c3192e"
              title="Ryū: Nivel N3"
              minutes="50 minutos"
              image={require('../../assets/images/cursos/n3_leon.png')}
              onPress={() => go('CursoN3')}
            />
          </View>

          {/* espacio extra para no tapar el contenido con el pill fijo */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* PILL FIJO (negro sólido, sin PNG) */}
        <View pointerEvents="box-none" style={styles.bottomBarFixed}>
          <View style={styles.bottomBg}>
            <TouchableOpacity onPress={() => go('Notificaciones')} style={styles.bottomItem}>
              <Image source={require('../../assets/icons/bell.png')} style={styles.bottomIcon} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => go('Notas')} style={styles.bottomItem}>
              <Image source={require('../../assets/icons/heart.png')} style={styles.bottomIcon} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => go('Chat')} style={styles.bottomItem}>
              <Image source={require('../../assets/icons/ia.png')} style={styles.bottomIcon} />

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
          <Image source={require('../../assets/icons/clock.png')} style={styles.timeIcon} />
          <Text style={styles.timeText}>{minutes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CourseWide({
  from,
  to, // no usado porque usas un PNG de gradiente
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
        source={require('../../assets/images/gradient_red.png')}
        style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
        imageStyle={{ borderRadius: 22 }}
      />
      <View style={styles.wideRow}>
        <Image source={image} style={styles.wideIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.wideTitle}>{title}</Text>
          <View style={styles.timeRow}>
            <Image source={require('../../assets/icons/clock.png')} style={styles.timeIcon} />
            <Text style={styles.timeText}>{minutes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

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
  hamburgerIcon: { width: 80, height: 80, resizeMode: 'contain' }, // tus medidas
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
  },
  avatar: { width: 80, height: 80, borderRadius: 19, resizeMode: 'cover' }, // tus medidas

  progressCard: {
    backgroundColor: '#b6111b',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },

  // Columna de texto
  progressTextCol: {
    flex: 1,
    paddingRight: 60,
  },
  // Nube decorativa
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

  frameWrapper: { marginTop: 18, marginHorizontal: 35, position: 'relative' },
  frameBg: { width: '100%', height: 105 },
  frameContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    justifyContent: 'space-between',
  },
  frameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  frameIcon: { width: 20, height: 20, resizeMode: 'contain' },
  frameText: { fontWeight: '800' },
  frameDivider: { width: 10 },

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

  wide: {
    width: '100%',
    borderRadius: 22,
    padding: 14,
  },
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
    width: '72%',
    height: 84,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  bottomItem: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  bottomIcon: { width: 28, height: 28, resizeMode: 'contain' },
});
