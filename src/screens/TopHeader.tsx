// --- TopHeader.tsx ---
import React from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import CameraIcon from '../../assets/icons/camera.svg';
import CrownIcon from '../../assets/icons/crown.svg';
import dividerImg from '../../assets/icons/DividerIcon.webp';
import EditIcon from '../../assets/icons/edit.svg';

const { width } = Dimensions.get('window');

const BG_HEIGHT    = Math.round(width * 0.62);
const CARD_RADIUS  = 26;
const AVATAR_OUTER = 180;
const RING_WIDTH   = 13;
const RING_GAP     = 18;
const AVATAR_INNER = AVATAR_OUTER - 2 * (RING_WIDTH + RING_GAP);

type Props = {
  onPickCover: () => void;
  onPickAvatar: () => void;
  onEditName: () => void;
  name?: string;
  email?: string;
  /** Usa false cuando el contenedor (PerfilScreen) ya maneja el fondo o quieres blanco liso */
  showBg?: boolean;
};

export default function ProfileHeader({
  onPickCover,
  onPickAvatar,
  onEditName,
  name,
  email,
  showBg = false, // ← por defecto SIN fondo (PerfilScreen pone blanco)
}: Props) {
  const safeName  = name  ?? 'Mapache Medina';
  const safeEmail = email ?? 'mapache@gmail.com';

  return (
    <View style={styles.wrap}>
      {/* Fondo opcional */}
      {showBg ? (
        <TouchableOpacity activeOpacity={0.9} onPress={onPickCover}>
          <ImageBackground
            source={require('../../assets/images/profile_bg.webp')}
            style={styles.bg}
            imageStyle={styles.bgImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null}

      {/* Tarjeta */}
      <View style={[styles.card, !showBg && { marginTop: 0 }]}>
        {/* Avatar */}
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
                    source={require('../../assets/images/avatar_placeholder.webp')}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </ImageBackground>

            {/* Botón cámara (valores originales) */}
            <TouchableOpacity onPress={onPickAvatar} activeOpacity={0.9} style={styles.camBtn}>
              <View style={styles.camBtnInner}>
                <CameraIcon width={26} height={26} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nombre + editar */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1} onPress={onEditName}>
            {safeName}
          </Text>
          <TouchableOpacity onPress={onEditName} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <EditIcon width={22} height={22} />
          </TouchableOpacity>
        </View>

        {/* Email */}
        <Text style={styles.email} numberOfLines={1}>{safeEmail}</Text>

        {/* Premium */}
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
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: 'transparent' },   // ← hereda el blanco del Screen
  bg:   { width: '100%', height: BG_HEIGHT },
  bgImage: {},

  card: {
    marginTop: -CARD_RADIUS,                 // si no hay fondo, arriba lo anulo con !showBg
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    backgroundColor: '#fff',
    paddingTop: AVATAR_OUTER / 2 + 20,
    paddingHorizontal: 20,
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
  avatarImage: {
    width: '115%',
    height: '115%',
    transform: [{ translateX: '-7.5%' }, { translateY: '-7.5%' }],
  },
  camBtn: { position: 'absolute', right: 18, bottom: 18 },
  camBtnInner: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  /* Nombre y correo */
  nameRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  name:  { fontSize: 24, lineHeight: 30, textAlign: 'center', fontWeight: '800', maxWidth: '90%' },
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
  dividerWrap: { width: 16, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  dividerIcon: { width: 8, height: 40 },

  stat: { flex: 1, minWidth: 0, alignItems: 'center' },
  statLabel: { color: '#7b6d5a', marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '900' },
});
