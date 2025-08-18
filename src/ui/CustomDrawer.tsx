// src/ui/CustomDrawer.tsx
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { CommonActions } from "@react-navigation/native";
import { Asset } from "expo-asset";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import AvatarWithFrame from "../components/AvatarWithFrame";
import { auth, db } from "../config/firebaseConfig";
import { getAvatarUri } from "../services/uploadAvatar";

// Decor
const BAMBOO_FULL = require("../../assets/images/bamboo_strip_full.png");
const BARRA_FULL = require("../../assets/images/barra_full2.png");
const DRAWER_BG = require("../../assets/images/drawer_bgx.webp");

const SEP_FULL = require("../../assets/images/sep_full.png");
const KNOT = require("../../assets/images/knot.png");
const FOOTER_SEAL = require("../../assets/images/stamp_footer.png");

// Íconos
const ICO_PREMIUM = require("../../assets/icons/drawer/premium.png");
const ICO_CLASIF = require("../../assets/icons/drawer/clasificacion.png");
const ICO_IA = require("../../assets/icons/drawer/ia.png");
const ICO_LIBRO = require("../../assets/icons/drawer/libro.png");
const ICO_INSTAGRAM = require("../../assets/icons/drawer/instagram.png");
const ICO_NOTIF = require("../../assets/icons/drawer/notificacion.png");
const ICO_FAQ = require("../../assets/icons/drawer/faq.png");
const ICO_PRIV = require("../../assets/icons/drawer/privacidad.png");
const ICO_HOME = require("../../assets/icons/drawer/home_end.png");
const ICO_LOGOUT = require("../../assets/icons/drawer/logout_end.png");

// Const UI
const BAMBOO_WIDTH = 64;
const BARRA_WIDTH = 13;
const WHITE_BG_LEFT_PAD = 4;
const EDGE_INSET = 4;
const ICON_W = 55;
const ICON_GAP = 8;
const SEP_HEIGHT = 25;
const SEP_LEFT_EXTRA = -25;
const SEP_WIDTH_DP = 110;
const USE_SIMPLE_SEP = false;

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const email = auth.currentUser?.email ?? "Invitado";
  const [ready, setReady] = useState(false);
  const [userDoc, setUserDoc] = useState<any>(null);

  useEffect(() => {
    console.log('[DEBUG] UID en Drawer:', auth.currentUser?.uid);
    async function preloadDrawerAssets() {
      try {
        await Asset.loadAsync([
          BAMBOO_FULL,
          BARRA_FULL,
          DRAWER_BG,
          SEP_FULL,
          KNOT,
          FOOTER_SEAL,
          ICO_PREMIUM,
          ICO_CLASIF,
          ICO_IA,
          ICO_LIBRO,
          ICO_INSTAGRAM,
          ICO_NOTIF,
          ICO_FAQ,
          ICO_PRIV,
          ICO_HOME,
          ICO_LOGOUT,
        ]);
      } catch (e) {
        console.warn("Error precargando imágenes Drawer", e);
      } finally {
        setReady(true);
      }
    }
    preloadDrawerAssets();
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db, "Usuarios", uid), (snap) => {
      setUserDoc({ id: snap.id, ...snap.data() });
    });
  }, []);

  const go = (route: string) => props.navigation.navigate(route as never);

  const goHome = () => {
    props.navigation.navigate("HomeMain" as never);
    props.navigation.closeDrawer();
  };

  const doSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("signOut error", e);
    } finally {
      props.navigation.getParent()?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Onboarding" as never }],
        })
      );
    }
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#b6111b" />
      </View>
    );
  }

  const avatarUri = getAvatarUri(userDoc);
  const displayName =
    userDoc?.displayName || auth.currentUser?.displayName || "Usuario";

  return (
    <View style={styles.root}>
      {/* Decoración de fondo */}
      <View style={styles.decorLayer} pointerEvents="none">
        <ImageBackground
          source={BAMBOO_FULL}
          resizeMode="stretch"
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: BAMBOO_WIDTH }}
        />
        <ImageBackground
          source={BARRA_FULL}
          resizeMode="stretch"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: BAMBOO_WIDTH - 6,
            width: BARRA_WIDTH,
          }}
        />
        <ImageBackground
          source={DRAWER_BG}
          resizeMode="cover"
          style={{
            position: "absolute",
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
          <AvatarWithFrame size={86} uri={avatarUri} />
          <Text style={styles.nombre}>{displayName}</Text>
          <Text style={styles.correo}>{email}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => go("Perfil")}>
            <Text style={styles.primaryBtnText}>Mi página</Text>
          </TouchableOpacity>
        </View>

        {/* Menú */}
        <View style={styles.menuWrapper}>
          <View style={styles.menu}>
            <DrawerItem icon={ICO_PREMIUM} label="Obtén premium" onPress={() => go("Pagos")} />
            <DrawerItem icon={ICO_CLASIF} label="Clasificación" onPress={() => go("Noticias")} />
            <DrawerItem icon={ICO_IA} label="IA Bunkan" onPress={() => go("IA")} />
            <DrawerItem icon={ICO_LIBRO} label="Libro de palabras" onPress={() => go("Preguntas")} />
            <DrawerItem icon={ICO_INSTAGRAM} label="Instagram" onPress={() => {}} />
            <DrawerItem icon={ICO_NOTIF} label="Notificación" onPress={() => go("Eventos")} />
            <DrawerItem icon={ICO_FAQ} label="Preguntas frecuentes" onPress={() => go("Preguntas")} />
            <DrawerItem icon={ICO_PRIV} label="Política de privacidad" onPress={() => go("Politica")} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerGroup}>
          <View style={{ height: 8 }} />
          <DrawerItem icon={ICO_HOME} label="Inicio" onPress={goHome} />
          <DrawerItem icon={ICO_LOGOUT} label="Cerrar sesión" onPress={doSignOut} />
          <View style={{ height: 10 }} />
          <View style={styles.stampWrap}>
            <Image source={FOOTER_SEAL} style={styles.stamp} />
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
      <View style={styles.rowWrap}>
        <Image source={icon} style={styles.itemIcon} />
        <Text style={styles.itemText}>{label}</Text>
        <Image source={KNOT} style={styles.knotRight} />
      </View>
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
  root: { flex: 1, overflow: "hidden" },
  decorLayer: { ...StyleSheet.absoluteFillObject },
  container: { paddingTop: 28, paddingBottom: 24 },
  headerBox: { alignItems: "center", paddingVertical: 8, marginBottom: 6 },
  nombre: { fontSize: 20, fontWeight: "800", marginTop: 8, marginBottom: 2 },
  correo: { fontSize: 12, opacity: 0.8, marginBottom: 12 },
  primaryBtn: { borderWidth: 1.5, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  primaryBtnText: { fontWeight: "700" },
  menuWrapper: { position: "relative", paddingRight: EDGE_INSET },
  menu: { gap: 22, marginTop: 8 },
  footerGroup: { marginTop: 16, paddingTop: 8 },
  stampWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  stamp: { width: 64, height: 64, resizeMode: "contain", opacity: 0.96 },
  item: { paddingVertical: 10 },
  rowWrap: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    minHeight: Math.max(40, ICON_W + 6),
  },
  itemIcon: { width: ICON_W, height: ICON_W, marginRight: ICON_GAP, resizeMode: "contain" },
  itemText: { fontSize: 16, fontWeight: "700" },
  knotRight: {
    position: "absolute",
    right: EDGE_INSET,
    top: "50%",
    transform: [{ translateY: -9 }],
    width: 18,
    height: 18,
    resizeMode: "contain",
    opacity: 0.95,
  },
  sepUnder: {
    height: SEP_HEIGHT,
    marginTop: 6,
    marginLeft: ICON_W + ICON_GAP + SEP_LEFT_EXTRA,
    marginRight: EDGE_INSET + 6,
    width: SEP_WIDTH_DP,
    alignSelf: "flex-start",
  },
  sepSimple: {
    height: 2,
    backgroundColor: "#7a0e14",
    opacity: 0.9,
    marginTop: 6,
    marginLeft: ICON_W + ICON_GAP + SEP_LEFT_EXTRA,
    marginRight: EDGE_INSET + 6,
    width: SEP_WIDTH_DP,
    alignSelf: "flex-start",
  },
});
