// src/screens/PerfilScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import CameraIcon from '../../assets/icons/camera.svg';
import CrownIcon from '../../assets/icons/crown.svg';
import EditIcon from '../../assets/icons/edit.svg';

import dividerImg from '../../assets/icons/DividerIcon.webp';

import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { pickAndSaveAvatar } from '../services/uploadAvatar';

const { width } = Dimensions.get('window');

const BG_HEIGHT = Math.round(width * 0.62);
const CARD_RADIUS = 26;

// Avatar
const AVATAR_OUTER = 180;
const RING_WIDTH = 13;
const RING_GAP = 18;
const AVATAR_INNER = AVATAR_OUTER - 2 * (RING_WIDTH + RING_GAP);

// Cache-busting helper para imágenes (evita que se quede la foto anterior en caché)
function bust(url: string, v?: number | string) {
  if (!v) return url;
  return url.includes('?') ? `${url}&v=${v}` : `${url}?v=${v}`;
}

export default function PerfilScreen() {
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const onPickCover = () => {};
  const onEditName = () => {};

  const onPickAvatar = async () => {
    try {
      if (updating) return;
      setUpdating(true);
      const url = await pickAndSaveAvatar();
      if (url) setAvatarSrc(url); // refresca en pantalla al instante
    } catch (e: any) {
      Alert.alert('Ups', e?.message ?? 'No se pudo actualizar tu foto.');
    } finally {
      setUpdating(false);
    }
  };

  // Escucha cambios en Firestore (photoURL + avatarUpdatedAt).
  // Mantiene compatibilidad con photoBase64 y con auth.photoURL como último fallback.
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;

    const unsub = onSnapshot(doc(db, 'Usuarios', u.uid), (snap) => {
      const url = snap.get('photoURL') as string | undefined;
      const v   = snap.get('avatarUpdatedAt') as number | string | undefined;
      const b64 = snap.get('photoBase64') as string | undefined;

      if (url) {
        setAvatarSrc(bust(url, v));
      } else if (b64) {
        setAvatarSrc(`data:image/jpeg;base64,${b64}`);
      } else if (u.photoURL) {
        setAvatarSrc(u.photoURL);
      } else {
        setAvatarSrc(null);
      }
    });

    return () => unsub();
  }, []);

  const soundRef = useRef<Audio.Sound | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      (async () => {
        try {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
          });

          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/enter_profile.mp3'),
            { shouldPlay: true, volume: 0.6, isLooping: false }
          );

          if (!mounted) {
            await sound.unloadAsync();
            return;
          }
          soundRef.current = sound;
        } catch (e) {
          console.warn('Error reproduciendo sonido de perfil:', e);
        }
      })();

      return () => {
        mounted = false;
        if (soundRef.current) {
          soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.cc}
        showsVerticalScrollIndicator={false}
      >
        {/* ====== FONDO MONTAÑAS ====== */}
        <TouchableOpacity activeOpacity={0.9} onPress={onPickCover}>
          <ImageBackground
            source={require('../../assets/images/profile_bg.webp')}
            style={styles.bg}
            imageStyle={styles.bgImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* ====== TARJETA BLANCA + HEADER ====== */}
        <View style={styles.card}>
          {/* Avatar superpuesto */}
          <View style={styles.avatarAbs}>
            <View style={styles.avatarOuter}>
              <ImageBackground
                source={require('../../assets/images/circulo_perfil.webp')}
                style={styles.avatarOuter}
                imageStyle={{ borderRadius: AVATAR_OUTER / 2 }}
                resizeMode="cover"
              >
                <View style={styles.avatarRing}>
                  <View style={styles.avatarClip}>
                    <Image
                      source={
                        avatarSrc
                          ? { uri: avatarSrc }
                          : require('../../assets/images/avatar_placeholder.webp')
                      }
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              </ImageBackground>

              {/* Botón de cámara */}
              <TouchableOpacity
                onPress={onPickAvatar}
                activeOpacity={0.9}
                style={styles.camBtn}
                disabled={updating}
              >
                <View style={styles.camBtnInner}>
                  <CameraIcon width={26} height={26} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Nombre + lapicito */}
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1} onPress={onEditName}>
              Mapache Medina
            </Text>
            <TouchableOpacity
              onPress={onEditName}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <EditIcon width={22} height={22} />
            </TouchableOpacity>
          </View>

          {/* Email */}
          <Text style={styles.email} numberOfLines={1}>
            mapache@gmail.com
          </Text>

          {/* Botón premium */}
          <TouchableOpacity style={styles.premiumBtn} activeOpacity={0.9}>
            <CrownIcon width={18} height={18} />
            <Text style={styles.premiumTxt}>Obtener premium</Text>
          </TouchableOpacity>

          {/* Stats + separadores */}
          <View style={styles.statsRow}>
            <Stat label="Puntos" value="825" />
            <View style={styles.dividerWrap}>
              <Image source={dividerImg} style={styles.dividerIcon} resizeMode="contain" />
            </View>
            <Stat label="Nivel mundial" value="#2481" />
            <View style={styles.dividerWrap}>
              <Image source={dividerImg} style={styles.dividerIcon} resizeMode="contain" />
            </View>
            <Stat label="Nivel local" value="#56" />
          </View>

          {/* ====== BLOQUE INFERIOR (4 TARJETAS) ====== */}
          <View style={styles.bottomWrap}>
            {/* Fila 1 */}
            <View style={styles.row}>
              {/* Meta semanal */}
              <Card>
                <Image
                  source={
                    require('../../assets/icons/achievement_bg2.webp') as ImageSourcePropType
                  }
                  style={styles.bgSoft}
                  resizeMode="cover"
                />
                <Text style={styles.cardTitle}>Meta semanal</Text>

                <View style={styles.metaRow}>
                  <Image
                    source={
                      require('../../assets/icons/icono_circular.webp') as ImageSourcePropType
                    }
                    style={styles.metaCircle}
                    resizeMode="contain"
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.metaBig}>3/5</Text>
                    <Text style={styles.metaLabel}>Racha de{'\n'}estudio</Text>
                  </View>
                </View>
              </Card>

              {/* Racha de estudio */}
              <Card>
                <Image
                  source={
                    require('../../assets/icons/achievement_bg2.webp') as ImageSourcePropType
                  }
                  style={styles.bgSoft}
                  resizeMode="cover"
                />
                <Text style={styles.cardTitle}>Racha de estudio</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hScroll}
                >
                  <IconWithLabel
                    src={require('../../assets/icons/samurai.webp') as ImageSourcePropType}
                    label="Samurai"
                  />
                  <LevelPill text="L1" />
                  <LevelPill
                    text="L3"
                    icon={require('../../assets/icons/l3.webp') as ImageSourcePropType}
                  />
                  <LevelPill
                    text="L5"
                    icon={require('../../assets/icons/l5.webp') as ImageSourcePropType}
                  />
                  <LevelPill text="L7" />
                  <LevelPill text="L9" />
                </ScrollView>
              </Card>
            </View>

            {/* Fila 2 */}
            <View style={styles.row}>
              {/* Logros */}
              <Card>
                <Image
                  source={
                    require('../../assets/icons/achievement_bg2.webp') as ImageSourcePropType
                  }
                  style={styles.bgSoft}
                  resizeMode="cover"
                />
                <Text style={styles.cardTitle}>Logros</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hScroll}
                >
                  <Achievement
                    src={require('../../assets/icons/logro_n1.webp') as ImageSourcePropType}
                    sub="N1"
                  />
                  <Achievement
                    src={require('../../assets/icons/logro_n1.webp') as ImageSourcePropType}
                    sub="N1"
                  />
                  <Achievement
                    src={require('../../assets/icons/logro_n1.webp') as ImageSourcePropType}
                    sub="N1"
                  />
                  <Achievement
                    src={require('../../assets/icons/logro_n1.webp') as ImageSourcePropType}
                    sub="N2"
                  />
                  <Achievement
                    src={require('../../assets/icons/logro_n1.webp') as ImageSourcePropType}
                    sub="N3"
                  />
                </ScrollView>
              </Card>

              {/* Juegos */}
              <Card>
                <Image
                  source={
                    require('../../assets/icons/achievement_bg2.webp') as ImageSourcePropType
                  }
                  style={styles.bgSoft}
                  resizeMode="cover"
                />
                <Text style={styles.cardTitle}>Juegos</Text>

                <View style={styles.gamesRow}>
                  <Image
                    source={
                      require('../../assets/icons/juego_mapache.webp') as ImageSourcePropType
                    }
                    style={styles.gameIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.pointsBadge}>
                    <Image
                      source={
                        require('../../assets/icons/juegos_puntos.webp') as ImageSourcePropType
                      }
                      style={styles.pointsImg}
                      resizeMode="contain"
                    />
                    <Text style={styles.pointsTxt}>+150</Text>
                  </View>
                </View>
              </Card>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* —————— Subcomponentes —————— */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <ImageBackground
      source={require('../../assets/icons/fondo_decorativo.webp')}
      style={styles.cardInner}
      imageStyle={styles.cardInnerImg}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

function IconWithLabel({ src, label }: { src: ImageSourcePropType; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Image source={src} style={styles.iconMid} resizeMode="contain" />
      <Text style={styles.smallLabel}>{label}</Text>
    </View>
  );
}

function LevelPill({ text, icon }: { text: string; icon?: ImageSourcePropType }) {
  return (
    <View style={styles.levelPill}>
      {icon ? <Image source={icon} style={styles.levelIcon} resizeMode="contain" /> : null}
      <Text style={styles.levelTxt}>{text}</Text>
    </View>
  );
}

function Achievement({ src, sub }: { src: ImageSourcePropType; sub: string }) {
  return (
    <View style={styles.achItem}>
      <Image source={src} style={styles.achIcon} resizeMode="contain" />
      <Text style={styles.achSub}>{sub}</Text>
    </View>
  );
}

/* —————— Estilos —————— */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { flex: 1 },
  cc: {
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },

  /* Fondo montañas */
  bg: { width: '100%', height: BG_HEIGHT, backgroundColor: '#fff' },
  bgImage: {},

  /* Tarjeta blanca */
  card: {
    marginTop: -CARD_RADIUS,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    backgroundColor: '#fff',
    paddingTop: AVATAR_OUTER / 2 + 20,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },

  /* Avatar */
  avatarAbs: {
    position: 'absolute',
    top: -AVATAR_OUTER / 2,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  avatarOuter: {
    width: AVATAR_OUTER,
    height: AVATAR_OUTER,
    borderRadius: AVATAR_OUTER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarRing: {
    width: AVATAR_OUTER - 2 * RING_WIDTH,
    height: AVATAR_OUTER - 2 * RING_WIDTH,
    borderRadius: (AVATAR_OUTER - 2 * RING_WIDTH) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarClip: {
    width: AVATAR_INNER,
    height: AVATAR_INNER,
    borderRadius: AVATAR_INNER / 2,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  // Sin porcentajes ni transforms con strings
  avatarImage: {
    width: AVATAR_INNER * 1.15,
    height: AVATAR_INNER * 1.15,
    marginLeft: -(AVATAR_INNER * 0.075),
    marginTop: -(AVATAR_INNER * 0.075),
  },
  camBtn: { position: 'absolute', right: 18, bottom: 18 },
  camBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  /* Nombre y correo */
  nameRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  name: { fontSize: 24, lineHeight: 30, textAlign: 'center', fontWeight: '800', maxWidth: '90%' },
  email: { marginTop: 2, textAlign: 'center', color: '#777' },

  /* Premium */
  premiumBtn: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: '#c9a23a',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumTxt: { color: '#1b1200', fontWeight: '800' },

  /* Stats + separadores */
  statsRow: {
    marginTop: 16,
    backgroundColor: '#f5efe6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dividerWrap: { width: 16, alignItems: 'center', justifyContent: 'center' },
  dividerIcon: { width: 8, height: 40 },

  stat: { flex: 1, minWidth: 0, alignItems: 'center' },
  statLabel: { color: '#7b6d5a', marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '900' },

  /* BLOQUE INFERIOR */
  bottomWrap: {
    marginTop: 16,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },

  cardInner: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    overflow: 'hidden',
    minHeight: 150,
    justifyContent: 'flex-start',
  },
  cardInnerImg: {
    borderRadius: 20,
  },
  bgSoft: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.14,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
    color: '#3b2b1b',
    textAlign: 'center',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  metaCircle: { width: 64, height: 64 },
  metaBig: { fontSize: 24, fontWeight: '900', color: '#6b1f1f' },
  metaLabel: { marginTop: 4, color: '#3b2b1b' },

  hScroll: { alignItems: 'center', gap: 10, paddingRight: 4 },

  iconMid: { width: 46, height: 46 },
  smallLabel: { marginTop: 4, fontSize: 12, color: '#3b2b1b' },

  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#efe2cf',
    borderWidth: 1,
    borderColor: '#caa378',
    gap: 6,
  },
  levelIcon: { width: 20, height: 20 },
  levelTxt: { fontWeight: '800', color: '#3b2b1b' },

  achItem: {
    width: 66,
    height: 66,
    borderRadius: 12,
    backgroundColor: '#f6ead7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achIcon: { width: 40, height: 40 },
  achSub: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 6,
    color: '#3b2b1b',
  },

  gamesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  gameIcon: { width: 56, height: 56 },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e7f6ea',
  },
  pointsImg: { width: 20, height: 20 },
  pointsTxt: { color: '#2f7a3b', fontWeight: '800' },
});
