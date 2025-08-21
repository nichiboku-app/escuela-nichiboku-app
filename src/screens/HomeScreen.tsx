// src/screens/HomeScreen.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Asset } from "expo-asset";
import React, { useEffect, useState } from "react";
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
import { openDrawerDeep } from "../utils/nav"; // ⬅️ NUEVO

const { width } = Dimensions.get("window");

// Este tipo aquí ya no representa el Root real; lo mantenemos para autocompletado básico.
type RootStackParamList = {
  Home: undefined;
  ProgresoN5: undefined;           // ⚠️ No existe en tu árbol actual; lo redirigimos a ActividadesN5
  Notas: undefined;
  Calendario: undefined;
  BienvenidaCursoN5: undefined;
  CursoN5: undefined;
  CursoN4: undefined;
  CursoN3: undefined;
  Perfil: undefined;
  Notificaciones: undefined;       // ⚠️ Drawer no la tiene; ajusta cuando exista
  Chat: undefined;                 // ⚠️ Drawer no la tiene; ajusta cuando exista
};

type HomeNav = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeNav>();
  const [ready, setReady] = useState(false);
  const [userDoc, setUserDoc] = useState<any>(null);

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

  // Suscripción al doc del usuario (colección 'Usuarios')
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db, "Usuarios", uid), (snap) => {
      setUserDoc({ id: snap.id, ...snap.data() });
    });
  }, []);

  // ⬇️ Abre el Drawer de forma robusta (Opción B + helper)
  const openDrawer = () => {
    const ok = openDrawerDeep(navigation as any);
    if (__DEV__ && !ok) {
      console.warn("No se encontró Drawer por encima de HomeScreen.");
    }
  };

  // ⬇️ Helper para navegar SIEMPRE al HomeStack dentro del Drawer (Main)
  const navigateToHomeStack = (
    screen: "BienvenidaCursoN5" | "Calendario" | "Notas" | "CursoN5" | "ActividadesN5",
    params?: Record<string, any>
  ) => {
    (navigation as any).navigate(
      "Main" as never,                   // Drawer.Screen que contiene el HomeStackNavigator
      { screen, params } as never        // HomeStack.Screen de destino
    );
  };

  // ⬇️ Router unificado para tus botones actuales
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
        // ⚠️ No existe en tu navegación actual, lo redirigimos a ActividadesN5 (ajusta si quieres CursoN5)
        navigateToHomeStack("ActividadesN5");
        break;

      case "Perfil":
      case "Notificaciones":
      case "Chat":
        // Estos están (o estarán) a nivel Drawer; usa el parent (Drawer) para ir directo
        (navigation as any).getParent?.()?.navigate(route as never);
        break;

      default:
        // Intento local por si en el futuro agregas rutas al HomeStack con el mismo nombre
        (navigation as any).navigate(route as never);
        break;
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
                source={require("../../assets/icons/hamburger.webp")}
                style={styles.hamburgerIcon}
              />
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
                <Image
                  source={require("../../assets/images/cursos/n5_mapache_avance.webp")}
                  style={styles.levelIcon}
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
            <TouchableOpacity
              style={styles.progressBtn}
              onPress={() => go("ProgresoN5")} // ⬅️ redirige a ActividadesN5 vía switch
              activeOpacity={0.9}
            >
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
                <TouchableOpacity
                  onPress={() => go("Notas")}
                  style={styles.actionBtn}
                  activeOpacity={0.9}
                >
                  <Image
                    source={require("../../assets/images/Notas.webp")}
                    style={styles.actionIcon}
                  />
                  <Text style={styles.actionText}>Notas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => go("Calendario")}
                  style={styles.actionBtn}
                  activeOpacity={0.9}
                >
                  <Image
                    source={require("../../assets/images/Calendario.webp")}
                    style={styles.actionIcon}
                  />
                  <Text style={styles.actionText}>Calendario</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>

          {/* Tarjetas de cursos */}
          <View style={styles.cardsGrid}>
            <CourseCard
              color="#7a0e14"
              title="Tanuki: Nivel N5"
              minutes="50 minutos"
              image={require("../../assets/images/cursos/n5_mapache.webp")}
              onPress={() => go("BienvenidaCursoN5")} // ⬅️ ahora es navegación anidada al HomeStack
            />
            <CourseCard
              color="#b2453c"
              title="Kitsune: Nivel N4"
              minutes="50 minutos"
              image={require("../../assets/images/cursos/n4_zorro.webp")}
              onPress={() => go("CursoN4")} // ⚠️ aún no está en Drawer/HomeStack; añade cuando exista
            />
            <CourseWide
              from="#f8b7a9"
              to="#c3192e"
              title="Ryū: Nivel N3"
              minutes="50 minutos"
              image={require("../../assets/images/cursos/n3_leon.webp")}
              onPress={() => go("CursoN3")} // ⚠️ igual que arriba
            />
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Pill fijo */}
        <View pointerEvents="box-none" style={styles.bottomBarFixed}>
          <View style={styles.bottomBg}>
            <TouchableOpacity
              onPress={() => go("Notificaciones")} // ⚠️ agrega esta pantalla al Drawer cuando la crees
              style={styles.bottomItem}
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets/icons/bell.webp")}
                style={styles.bottomIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => go("Notas")}
              style={styles.bottomItem}
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets/icons/heart.webp")}
                style={styles.bottomIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => go("Chat")} // ⚠️ agrega al Drawer en cuanto lo tengas
              style={styles.bottomItem}
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets/icons/ia.webp")}
                style={styles.bottomIcon}
              />
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
    <TouchableOpacity
      style={[styles.card, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.cardArt}>
        <Image source={image} style={styles.cardIcon} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.timeRow}>
          <Image
            source={require("../../assets/icons/clock.webp")}
            style={styles.timeIcon}
          />
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
        source={require("../../assets/images/gradient_red.webp")}
        style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
        imageStyle={{ borderRadius: 22 }}
      />
      <View style={styles.wideRow}>
        <Image source={image} style={styles.wideIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.wideTitle}>{title}</Text>
          <View style={styles.timeRow}>
            <Image
              source={require("../../assets/icons/clock.webp")}
              style={styles.timeIcon}
            />
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
// 🔴 Antes
// hamburger: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
// hamburgerIcon: { width: 80, height: 80, resizeMode: "contain" },

// 🟢 Después
hamburger: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
hamburgerIcon: { width: 56, height: 56, resizeMode: "contain" },

  headerTitle: { flex: 1, textAlign: "center", fontSize: 22, fontWeight: "800" },

  progressCard: {
    backgroundColor: "#b6111b",
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
    backgroundColor: "#f5e9e9",
    alignItems: "center",
    justifyContent: "center",
  },
  levelIcon: { width: 120, height: 120, resizeMode: "contain" },
  progressTextCol: { flex: 1, paddingRight: 60 },
  progressTitle: { color: "#fff", fontSize: 16, fontWeight: "800", lineHeight: 24 },
  dotsRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.5)" },
  dotActive: { backgroundColor: "#fff" },
  progressBtn: {
    backgroundColor: "#f7f7f7",
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  progressBtnText: { fontWeight: "800" },

  // Panel Notas / Calendario
  panelWrap: { marginTop: 12, paddingHorizontal: 16 },
  panelBg: { height: 118, justifyContent: "center", paddingHorizontal: 18 },
  panelBgImage: { resizeMode: "stretch", borderRadius: 14 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 14,
  },
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

  // Cursos
  cardsGrid: {
    marginTop: 16,
    paddingHorizontal: 16,
    rowGap: 12,
    columnGap: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  card: { width: (width - 16 * 2 - 12) / 2, borderRadius: 18, padding: 12 },
  cardArt: {
    backgroundColor: "rgba(255,255,255,0.15)",
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

  wide: { width: "100%", borderRadius: 22, padding: 14 },
  wideRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  wideIcon: { width: 105, height: 105, resizeMode: "contain" },
  wideTitle: { color: "#fff", fontWeight: "800", fontSize: 16, marginBottom: 6 },

  // Pill fijo
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
