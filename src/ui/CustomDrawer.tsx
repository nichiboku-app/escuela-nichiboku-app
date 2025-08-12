// src/ui/CustomDrawer.tsx
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { getAuth } from 'firebase/auth';
import React from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ====== IMÁGENES ======
const BAMBOO_FULL = require('../../assets/images/bamboo_strip_full.png'); // franja verde izq
const BARRA_FULL  = require('../../assets/images/barra_full2.png');       // columna roja izq
const DRAWER_BG   = require('../../assets/images/drawer_bgx.png');         // fondo del área blanca

const SEP_FULL = require('../../assets/images/sep_full.png');             // separador horizontal
const KNOT     = require('../../assets/images/knot.png');                 // flor derecha

// ====== Íconos menú ======
const ICO_PREMIUM   = require('../../assets/icons/drawer/premium.png');
const ICO_CLASIF    = require('../../assets/icons/drawer/clasificacion.png');
const ICO_IA        = require('../../assets/icons/drawer/ia.png');
const ICO_LIBRO     = require('../../assets/icons/drawer/libro.png');
const ICO_INSTAGRAM = require('../../assets/icons/drawer/instagram.png');
const ICO_NOTIF     = require('../../assets/icons/drawer/notificacion.png');
const ICO_FAQ       = require('../../assets/icons/drawer/faq.png');
const ICO_PRIV      = require('../../assets/icons/drawer/privacidad.png');

// ====== CONST UI ======
const BAMBOO_WIDTH = 64;   // ancho visible del bambú
const BARRA_WIDTH  = 13;   // ancho visible de la barra roja interior

// ligero solape/aire entre barra roja y fondo blanco
const WHITE_BG_LEFT_PAD = 4;

// margen mínimo al borde derecho del drawer
const EDGE_INSET = 4;

// Items
const ICON_W = 55;
const ICON_GAP = 8;
const SEP_HEIGHT = 25;
const SEP_LEFT_EXTRA = -25;     // empuja el inicio del separador bajo el texto
const SEP_WIDTH_DP = 110;

const USE_SIMPLE_SEP = false;

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const auth = getAuth();
  const email = auth.currentUser?.email ?? 'Invitado';
  const go = (route: string) => props.navigation.navigate(route as never);

  return (
    <View style={styles.root}>
      {/* Decoración (NO intercepta toques) */}
      <View style={styles.decorLayer} pointerEvents="none">
        {/* Bambú izquierda */}
        <ImageBackground
          source={BAMBOO_FULL}
          resizeMode="stretch"
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: BAMBOO_WIDTH }}
        />
        {/* Barra roja interior */}
        <ImageBackground
          source={BARRA_FULL}
          resizeMode="stretch"
          style={{ position: 'absolute', top: 0, bottom: 0, left: BAMBOO_WIDTH - 6, width: BARRA_WIDTH }}
        />
        {/* Fondo del área blanca (derecha) */}
        <ImageBackground
          source={DRAWER_BG}
          resizeMode="cover"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: BAMBOO_WIDTH + BARRA_WIDTH + WHITE_BG_LEFT_PAD,
            right: 0,
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingLeft: BAMBOO_WIDTH + 20, paddingRight: EDGE_INSET },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerBox}>
          <Image source={require('../../assets/images/avatar_formal.png')} style={styles.avatar} />
          <Text style={styles.nombre}>Mapache Medina</Text>
          <Text style={styles.correo}>{email}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => go('Perfil')}>
            <Text style={styles.primaryBtnText}>Mi página</Text>
          </TouchableOpacity>
        </View>

        {/* Menú */}
        <View style={styles.menuWrapper}>
          <View style={styles.menu}>
            <DrawerItem icon={ICO_PREMIUM}   label="Obtén premium"         onPress={() => go('Pagos')} />
            <DrawerItem icon={ICO_CLASIF}    label="Clasificación"         onPress={() => go('Noticias')} />
            <DrawerItem icon={ICO_IA}        label="IA Bunkan"             onPress={() => go('IA')} />
            <DrawerItem icon={ICO_LIBRO}     label="Libro de palabras"     onPress={() => go('Preguntas')} />
            <DrawerItem icon={ICO_INSTAGRAM} label="Instagram"             onPress={() => {}} />
            <DrawerItem icon={ICO_NOTIF}     label="Notificación"          onPress={() => go('Eventos')} />
            <DrawerItem icon={ICO_FAQ}       label="Preguntas frecuentes"  onPress={() => go('Preguntas')} />
            <DrawerItem icon={ICO_PRIV}      label="Política de privacidad" onPress={() => go('Politica')} />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function DrawerItem({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.85}>
      {/* Fila superior: icono + texto + flor */}
      <View style={styles.rowWrap}>
        <Image source={icon} style={styles.itemIcon} />
        <Text style={styles.itemText}>{label}</Text>
        <Image source={KNOT} style={styles.knotRight} />
      </View>

      {/* Fila inferior: separador */}
      {USE_SIMPLE_SEP ? (
        <View style={styles.sepSimple} />
      ) : (
        <Image
          source={SEP_FULL}
          style={styles.sepUnder}
          resizeMode="stretch"
          capInsets={{ left: 18, right: 18, top: 12, bottom: 12 }}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  decorLayer: { ...StyleSheet.absoluteFillObject },

  container: { paddingTop: 28, paddingBottom: 24 },

  // Header
  headerBox: { alignItems: 'center', paddingVertical: 8, marginBottom: 6 },
  avatar: { width: 72, height: 72, borderRadius: 36, marginBottom: 10 },
  nombre: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  correo: { fontSize: 12, opacity: 0.8, marginBottom: 12 },
  primaryBtn: { borderWidth: 1.5, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  primaryBtnText: { fontWeight: '700' },

  // Menú
  menuWrapper: { position: 'relative', paddingRight: EDGE_INSET },
  menu: { gap: 22, marginTop: 8 },

  // Item
  item: { paddingVertical: 10 },

  rowWrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Math.max(40, ICON_W + 6),
  },
  itemIcon: { width: ICON_W, height: ICON_W, marginRight: ICON_GAP, resizeMode: 'contain' },
  itemText: { fontSize: 16, fontWeight: '700' },

  // Flor a la derecha
  knotRight: {
    position: 'absolute',
    right: EDGE_INSET,
    top: '50%',
    transform: [{ translateY: -9 }],
    width: 18, height: 18, resizeMode: 'contain', opacity: 0.95,
  },

  // Separador debajo del texto
  sepUnder: {
    height: SEP_HEIGHT,
    marginTop: 6,
    marginLeft: ICON_W + ICON_GAP + SEP_LEFT_EXTRA,
    marginRight: EDGE_INSET + 6,   // aire antes de la flor
    width: SEP_WIDTH_DP,
    alignSelf: 'flex-start',
  },
  sepSimple: {
    height: 2, backgroundColor: '#7a0e14', opacity: 0.9,
    marginTop: 6, marginLeft: ICON_W + ICON_GAP + SEP_LEFT_EXTRA, marginRight: EDGE_INSET + 6,
    width: SEP_WIDTH_DP, alignSelf: 'flex-start',
  },
});
