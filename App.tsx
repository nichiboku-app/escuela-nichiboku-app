// App.tsx
import "react-native-gesture-handler"; // 👈 Debe ir primero

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type { RootStackParamList } from "./types";

// Screens raíz
import BienvenidaScreen from "./src/screens/BienvenidaScreen";
import LoginScreen from "./src/screens/LoginScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import SplashScreen from "./src/screens/SplashScreen";

// Drawer principal
import AppDrawerNavigator from "./src/navigation/AppDrawerNavigator";

// N5 (rutas fuera del Drawer)
import EntradaActividadesN5Screen from "./src/screens/EntradaActividadesN5Screen";
import IntroJaponesScreen from "./src/screens/IntroJaponesScreen";
import AtarjetasScreen from "./src/screens/N5/AtarjetasScreen";
import ATrazoAnimado from "./src/screens/N5/ATrazoAnimado";
import N5Bienvenida from "./src/screens/N5/Bienvenida";
import CulturaScreen from "./src/screens/N5/CulturaScreen";
import EjemplosGrupoA from "./src/screens/N5/EjemplosGrupoA";
import EscrituraScreen from "./src/screens/N5/EscrituraScreen";
import GifSaludo from "./src/screens/N5/GifSaludo";
import HiraganaScreen from "./src/screens/N5/HiraganaScreen";
import MatchingGrupoK from "./src/screens/N5/MatchingGrupoK"; // 👈 NUEVO
import OrigenesDelIdiomaScreen from "./src/screens/N5/OrigenesDelIdiomaScreen";
import QuizCultural from "./src/screens/N5/QuizCultural";
import SubtemaScreen from "./src/screens/N5/SubtemaScreen";
import TemaN5 from "./src/screens/N5/TemaN5";
import VocabularioGrupoK from "./src/screens/N5/VocabularioGrupoK";
import VowelExercisesScreen from "./src/screens/VowelExercisesScreen";

// ✅ NUEVA RUTA (Dictado Visual con TTS)
import ADictadoVisual from "./src/screens/N5/ADictadoVisual";

// Modal de video N5
import VideoIntroModal from "./src/screens/N5/VideoIntroModal";

// ✅ Pantallas reales
import PronunciacionGrupoA from "./src/screens/N5/PronunciacionGrupoA";
import TrazosGrupoA from "./src/screens/N5/TrazosGrupoA";

// ✅ Grupo K real
import TrazosGrupoK from "./src/screens/N5/TrazosGrupoK";

const Stack = createNativeStackNavigator<RootStackParamList>();

function Placeholder({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "900", marginBottom: 8 }}>{title}</Text>
      <Text style={{ opacity: 0.7, textAlign: "center" }}>
        Pantalla aún no implementada. Crea {title}.tsx en /src/screens/N5/ y actualiza App.tsx.
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: "simple_push",
            gestureEnabled: true,
            freezeOnBlur: true,
          }}
        >
          {/* === Arranque === */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />

          {/* === Drawer principal === */}
          <Stack.Screen name="Home" component={AppDrawerNavigator} />

          {/* === N5 fuera del Drawer === */}
          <Stack.Screen name="N5Bienvenida" component={N5Bienvenida} />
          <Stack.Screen name="EntradaActividadesN5" component={EntradaActividadesN5Screen} />
          <Stack.Screen name="IntroJapones" component={IntroJaponesScreen} />

          <Stack.Screen
            name="OrigenesDelIdioma"
            component={OrigenesDelIdiomaScreen}
            options={{ headerShown: true, title: "Orígenes del idioma" }}
          />
          <Stack.Screen
            name="EscrituraN5"
            component={EscrituraScreen}
            options={{ headerShown: true, title: "Sistemas de escritura" }}
          />
          <Stack.Screen
            name="CulturaN5"
            component={CulturaScreen}
            options={{ headerShown: true, title: "Cultura básica" }}
          />
          <Stack.Screen name="Subtema" component={SubtemaScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="TemaN5"
            component={TemaN5}
            options={({ route }) => ({
              headerShown: true,
              title: (route?.params as any)?.title ?? "Hiragana",
            })}
          />
          <Stack.Screen name="Hiragana" component={HiraganaScreen} options={{ headerShown: false }} />

          <Stack.Screen
            name="EjemplosGrupoA"
            component={EjemplosGrupoA}
            options={{ headerShown: true, title: "Ejemplos — Grupo A" }}
          />

          {/* === Vocabulario K (REAL, ÚNICO) === */}
          <Stack.Screen
            name="VocabularioGrupoK"
            component={VocabularioGrupoK}
            options={{ headerShown: true, title: "Vocabulario — Grupo K" }}
          />

          {/* === Flashcards educativas === */}
          <Stack.Screen
            name="ATarjetas"
            component={AtarjetasScreen}
            options={{ headerShown: false }}
          />

          {/* === Matching K REAL (reemplaza placeholder) === */}
          <Stack.Screen
            name="MatchingGrupoK"
            component={MatchingGrupoK}
            options={{ headerShown: true, title: "Matching — Grupo K" }}
          />

          {/* === Otros N5 === */}
          <Stack.Screen
            name="GifSaludo"
            component={GifSaludo}
            options={{ headerShown: true, title: "Saludos (GIF)" }}
          />
          <Stack.Screen
            name="VowelExercises"
            component={VowelExercisesScreen}
            options={{ headerShown: true, title: "Ejercicios vocales" }}
          />
          <Stack.Screen
            name="QuizCultural"
            component={QuizCultural}
            options={{ headerShown: true, title: "Quiz cultural" }}
          />
          <Stack.Screen
            name="VideoIntroModal"
            component={VideoIntroModal}
            options={{
              headerShown: false,
              presentation: "fullScreenModal",
              animation: "fade",
              contentStyle: { backgroundColor: "#000" },
            }}
          />

          {/* === HIRAGANA — GRUPO A === */}
          <Stack.Screen
            name="TrazosGrupoA"
            component={TrazosGrupoA}
            options={{ headerShown: true, title: "Trazos — Grupo A" }}
          />
          <Stack.Screen
            name="PronunciacionGrupoA"
            component={PronunciacionGrupoA}
            options={{ headerShown: true, title: "Pronunciación — Grupo A" }}
          />

          {/* === Implementadas === */}
          <Stack.Screen
            name="ATrazoAnimado"
            component={ATrazoAnimado}
            options={{ headerShown: true, title: "Trazo animado" }}
          />

          {/* === Dictado visual (REAL) === */}
          <Stack.Screen
            name="ADictadoVisual"
            component={ADictadoVisual}
            options={{ headerShown: false }}
          />

          {/* === Placeholders varios === */}
          <Stack.Screen
            name="TarjetasGrupoA"
            options={{ headerShown: true, title: "Tarjetas — Grupo A" }}
            children={() => <Placeholder title="TarjetasGrupoA" />}
          />
          <Stack.Screen
            name="TrazoAnimadoGrupoA"
            options={{ headerShown: true, title: "Trazo animado — Grupo A" }}
            children={() => <Placeholder title="TrazoAnimadoGrupoA" />}
          />

          {/* === Grupo K (ruta SINGULAR en types) === */}
          <Stack.Screen
            name="TrazoGrupoK"
            component={TrazosGrupoK}
            options={{ headerShown: true, title: "Trazo — Grupo K" }}
          />

          <Stack.Screen
            name="MemoriaGrupoK"
            options={{ headerShown: true, title: "Memoria — Grupo K" }}
            children={() => <Placeholder title="MemoriaGrupoK" />}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
