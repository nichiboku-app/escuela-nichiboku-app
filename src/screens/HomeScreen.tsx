// src/screens/HomeScreen.tsx
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Asset } from "expo-asset";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
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
} from "react-native";

import { doc, onSnapshot } from "firebase/firestore";
import AvatarWithFrame from "../components/AvatarWithFrame";
import { auth, db } from "../config/firebaseConfig";
import { getAvatarUri } from "../services/uploadAvatar";
import { openDrawerDeep } from "../utils/nav";

// Intro video modal
import IntroVideoModal from "../components/IntroVideoModal";
import {
  getIntroVideoUrl,
  markIntroVideoSeen,
  wasIntroVideoSeen,
} from "../services/introVideo";

const { width } = Dimensions.get("window");

// Tipos locales para navegación (autocompletado básico)
type RootStackParamList = {
  Home: undefined;
  ProgresoN5: undefined;
  Notas: undefined;
  Calendario: undefined;
  BienvenidaCursoN5: undefined;
  CursoN5: undefined;
  CursoN4: undefined;
  CursoN3: undefined;
  Perfil: undefined;
  Notificaciones: undefined;
  Chat: undefined;
  ActividadesN5?: undefined;
};

type HomeNav = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeNav>();

  // 🔧 Oculta el header nativo del padre SOLO en Home
  useFocusEffect(
    useCallback(() => {
      const parent = (navigation as any).getParent?.();
      parent?.setOptions?.({ headerShown: false });
      return () => parent?.setOptions?.({ headerShown: true });
    }, [navigation])
  );

  const [ready, setReady] = useState(false);
  const [userDoc, setUserDoc] = useState<any>(null);

  // Estado del video de introducción
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    async function preloadImages() {
      try {
        await Asset.loadAsync([
          require("../../assets/images/final_home_background.webp"),
          require("../../assets/images/cloud_swirl.webp"),

          require("../../assets/images/cursos/n5_mapache.webp"),
          require("../../assets/images/cursos/n4_zorro.webp"),
          require("../../assets/images/cursos/n3_leon.webp"),
          require("../../assets/images/cursos/n5_mapache_avance.webp"),
          require("../../assets/images/cursos/rueda2.webp"), // aro bicolor

          require("../../assets/icons/hamburger.webp"),
          require("../../assets/images/avatar_formal.webp"),
          require("../../assets/images/avatar_frame.webp"),

          require("../../assets/images/cuadroNotas.webp"),
          require("../../assets/images/Notas.webp"),
          require("../../assets/images/Calendario.webp"),

          require("../../assets/icons/bell.webp"),
          require("../../assets/icons/heart.webp"),
          require("../../assets/icons/ia.webp"),

          require("../../assets/icons/clock.webp"),
          require("../../assets/images/gradient_red.webp"),
        ]);
      } catch (e) {
        console.warn("Error precargando imágenes", e);
      } finally {
        setReady(true);
      }
    }
    preloadImages();
  }, []);

  // Mostrar video de introducción si aplica
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const seen = await wasIntroVideoSeen();
        if (seen) return;
        const url = await getIntroVideoUrl();
        if (!alive) return;
        setVideoUrl(url);
        setShowIntro(true);
      } catch (e) {
        console.warn("No se pudo cargar el video de introducción", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Suscripción al doc del usuario
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db, "Usuarios", uid), (snap) => {
      setUserDoc({ id: snap.id, ...snap.data() });
    });
  }, []);

  const openDrawer = () => {
    const ok = openDrawerDeep(navigation as any);
    if (__DEV__ && !ok) console.warn("No se encontró Drawer por encima de HomeScreen.");
  };

  // Navegación hacia el HomeStack dentro del Drawer (Main)
  const navigateToHomeStack = (
    screen: "BienvenidaCursoN5" | "Calendario" | "Notas" | "CursoN5" | "ActividadesN5",
    params?: Record<string, any>
  ) => {
    (navigation as any).navigate("Main" as never, { screen, params } as never);
  };

  const go = (route: keyof RootStackParamList) => {
    switch (route) {
      case "BienvenidaCursoN5":
      case "Calendario":
      case "Notas":
      case "CursoN5":
      case "ActividadesN5":
        navigateToHomeStack(route);
        break;
      case "ProgresoN5":
        navigateToHomeStack("ActividadesN5");
        break;
      case "Perfil":
      case "Notificaciones":
      case "Chat":
        (navigation as any).getParent?.()?.navigate(route as never);
        break;
      default:
        (navigation as any).navigate(route as never);
        break;
    }
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#1a1818ff" />
      </View>
    );
  }

  const avatarUri = getAvatarUri(userDoc);
  const displayName =
    userDoc?.displayName || auth.currentUser?.displayName || "Mapache";
  const firstName = (displayName || "Mapache").split(" ")[0];

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/final_home_background.webp")}
        style={StyleSheet.absoluteFill}
        imageStyle={{ resizeMode: "cover" }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header propio */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.hamburger} activeOpacity={0.7} onPress={openDrawer}>
              <Image source={require("../../assets/icons/hamburger.webp")} style={styles.hamburgerIcon} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Hola, {firstName}</Text>

            <TouchableOpacity onPress={() => (navigation as any).getParent?.()?.navigate("Perfil" as never)}>
              <AvatarWithFrame size={80} uri={avatarUri} />
            </TouchableOpacity>
          </View>

          {/* Card Progreso */}
          <View style={styles.progressCard}>
            <Image
              source={require("../../assets/images/cloud_swirl.webp")}
              style={styles.cloudDecor}
              resizeMode="contain"
            />
            <View style={styles.progressRow}>
              <View style={styles.levelCircle}>
                <ExpoImage
                  source={require("../../assets/images/cursos/rueda2.webp")}
                  style={styles.levelIcon}
                  contentFit="contain"
                />
              </View>
              <View style={styles.progressTextCol}>
                <Text style={styles.progressTitle}>
                  Consulta tu avance{"\n"}en el nivel N5
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
            <TouchableOpacity style={styles.progressBtn} onPress={() => go("ProgresoN5")} activeOpacity={0.9}>
              <Text style={styles.progressBtnText}>Ver progreso N5</Text>
            </TouchableOpacity>
          </View>

          {/* Panel Notas / Calendario */}
          <View style={styles.panelWrap}>
            <ImageBackground
              source={require("../../assets/images/cuadroNotas.webp")}
              style={styles.panelBg}
              imageStyle={styles.panelBgImage}
            >
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => go("Notas")} style={styles.actionBtn} activeOpacity={0.9}>
                  <Image source={require("../../assets/images/Notas.webp")} style={styles.actionIcon} />
                  <Text style={styles.actionText}>Notas</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => go("Calendario")} style={styles.actionBtn} activeOpacity={0.9}>
                  <Image source={require("../../assets/images/Calendario.webp")} style={styles.actionIcon} />
                  <Text style={styles.actionText}>Calendario</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>

          {/* Tarjetas de cursos */}
          <View style={styles.cardsGrid}>
            <CourseCard
              from="#6b0213"
              to="#b46b72"
              title="Tanuki: Nivel N5"
              minutes="50 minutos"
              image={require("../../assets/images/cursos/n5_mapache.webp")}
              onPress={() => go("BienvenidaCursoN5")}
            />
            <CourseCard
              from="#4e000e"
              to="#b46b72"
              title="Kitsune: Nivel N4"
              minutes="50 minutos"
              image={require("../../assets/images/cursos/n4_zorro.webp")}
              onPress={() => go("CursoN4")}
            />
            <CourseWide
              from="#914961"
              to="#b46b72"
              title="Ryū: Nivel N3"
              minutes="50 minutos"
              image={require("../../assets/images/cursos/n3_leon.webp")}
              onPress={() => go("CursoN3")}
            />
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Pill fijo */}
        <View pointerEvents="box-none" style={styles.bottomBarFixed}>
          <View style={styles.bottomBg}>
            <TouchableOpacity onPress={() => go("Notificaciones")} style={styles.bottomItem} activeOpacity={0.8}>
              <Image source={require("../../assets/icons/bell.webp")} style={styles.bottomIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => go("Notas")} style={styles.bottomItem} activeOpacity={0.8}>
              <Image source={require("../../assets/icons/heart.webp")} style={styles.bottomIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => go("Chat")} style={styles.bottomItem} activeOpacity={0.8}>
              <Image source={require("../../assets/icons/ia.webp")} style={styles.bottomIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Modal de video de introducción */}
      <IntroVideoModal
        visible={showIntro}
        sourceUrl={videoUrl}
        onClose={() => setShowIntro(false)}
        onDontShowAgain={async () => {
          await markIntroVideoSeen();
          setShowIntro(false);
        }}
      />
    </View>
  );
}

function CourseCard({
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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient colors={[from, to]} style={StyleSheet.absoluteFill} />
      <View style={styles.cardArt}>
        <Image source={image} style={styles.cardIcon} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.timeRow}>
          <Image source={require("../../assets/icons/clock.webp")} style={styles.timeIcon} />
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
      <LinearGradient colors={[from, to]} style={StyleSheet.absoluteFill} />
      <View style={styles.wideRow}>
        <Image source={image} style={styles.wideIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.wideTitle}>{title}</Text>
          <View style={styles.timeRow}>
            <Image source={require("../../assets/icons/clock.webp")} style={styles.timeIcon} />
            <Text style={styles.timeText}>{minutes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 50, paddingBottom: 120 },

  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  hamburger: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  hamburgerIcon: { width: 56, height: 56, resizeMode: "contain" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 22, fontWeight: "800" },

  progressCard: {
    backgroundColor: "#6b0213",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    overflow: "hidden",
    position: "relative",
  },
  cloudDecor: { position: "absolute", right: 14, top: 10, width: 90, height: 60, opacity: 1 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12 },

  levelCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  levelIcon: {
    width: 64,
    height: 64,
  },

  progressTextCol: { flex: 1, paddingRight: 60 },
  progressTitle: { color: "#fff", fontSize: 16, fontWeight: "800", lineHeight: 24 },
  dotsRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.5)" },
  dotActive: { backgroundColor: "#fff" },
  progressBtn: {
    backgroundColor: "#f7f7f7",
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  progressBtnText: { fontWeight: "800" },

  panelWrap: { marginTop: 12, paddingHorizontal: 16 },
  panelBg: { height: 118, justifyContent: "center", paddingHorizontal: 18 },
  panelBgImage: { resizeMode: "stretch", borderRadius: 14 },
  actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", columnGap: 14 },
  actionBtn: {
    width: "42%",
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.94)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionIcon: { width: 26, height: 26, resizeMode: "contain" },
  actionText: { fontWeight: "800", fontSize: 16, color: "#5a0d12" },

  cardsGrid: {
    marginTop: 16,
    paddingHorizontal: 16,
    rowGap: 12,
    columnGap: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  card: {
    width: (width - 16 * 2 - 12) / 2,
    borderRadius: 18,
    padding: 12,
    overflow: "hidden",
  },
  cardArt: {
    borderRadius: 14,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  cardIcon: { width: 160, height: 90, resizeMode: "contain" },
  cardTitle: { color: "#fff", fontWeight: "800", marginBottom: 8 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  timeIcon: { width: 14, height: 14, resizeMode: "contain", tintColor: "#fff" },
  timeText: { color: "#fff" },

  wide: { width: "100%", borderRadius: 22, padding: 14, overflow: "hidden" },
  wideRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  wideIcon: { width: 105, height: 105, resizeMode: "contain" },
  wideTitle: { color: "#fff", fontWeight: "800", fontSize: 16, marginBottom: 6 },

  bottomBarFixed: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  bottomBg: {
    width: "70%",
    height: 74,
    borderRadius: 999,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  bottomItem: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  bottomIcon: { width: 32, height: 32, resizeMode: "contain" },
});
