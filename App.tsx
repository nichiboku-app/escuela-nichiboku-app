import "react-native-gesture-handler"; // 👈 Debe ir primero

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { B3ScoreProvider } from "./src/context/B3ScoreContext"; // ⭐ Puntaje global B3
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
import MatchingGrupoK from "./src/screens/N5/MatchingGrupoK";
import MemoriaGrupoK from "./src/screens/N5/MemoriaGrupoK";
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

// ✅ Pantallas reales (Grupo A)
import PronunciacionGrupoA from "./src/screens/N5/PronunciacionGrupoA";
import TrazosGrupoA from "./src/screens/N5/TrazosGrupoA";

// ✅ Grupo K real
import TrazosGrupoK from "./src/screens/N5/TrazosGrupoK";

// ✅ Familias S/T: menú combinado + trazos S/Z
import FamiliaSScreen from "./src/screens/N5/FamiliaS/SEscrituraGrupoS";
import TrazosFamiliaSZ from "./src/screens/N5/FamiliaS/TrazosFamiliaSZ";

// ✅ Familia S: pantallas auxiliares
import SCaligrafiaDigital from "./src/screens/N5/FamiliaS/SCaligrafiaDigital";
import SEjemplosGrupoS from "./src/screens/N5/FamiliaS/SEjemplosGrupoS";
import SLecturaSilabas from "./src/screens/N5/FamiliaS/SLecturaSilabas";

// ✅ Familia T: pantallas auxiliares
import TQuizEscucha from "./src/screens/N5/FamiliaS/TQuizEscucha";
import TTrazoGif from "./src/screens/N5/FamiliaS/TTrazoGif";

// familia N
import FamiliaNHScreen from "./src/screens/N5/FamiliaN/FamiliaNHScreen";
import HRoleplaySaludoScreen from "./src/screens/N5/FamiliaN/HRoleplaySaludoScreen";
import NLecturaGuiadaScreen from "./src/screens/N5/FamiliaN/NLecturaGuiadaScreen";

// Grupo M / Y–R
import HiraganaMMenu from "./src/screens/N5/HiraganaM/HiraganaMMenu";
import HiraganaYRMenu from "./src/screens/N5/HiraganaYR/HiraganaYRMenu";
// (opcional) subpantallas
import M_Dictado from "./src/screens/N5/HiraganaM/M_Dictado";
import M_PracticaVoz from "./src/screens/N5/HiraganaM/M_PracticaVoz";
import YR_AudioInteractivo from "./src/screens/N5/HiraganaYR/YR_AudioInteractivo";
import YR_CompletarPalabras from "./src/screens/N5/HiraganaYR/YR_CompletarPalabras";

// ✅ NUEVO: Grupo W–N — menú y subpantallas
import HiraganaWNMenu from "./src/screens/N5/HiraganaWN/HiraganaWNMenu";
import WN_LecturaFrases from "./src/screens/N5/HiraganaWN/WN_LecturaFrases";
import WN_PracticaNFinal from "./src/screens/N5/HiraganaWN/WN_PracticaNFinal";

// Katakana
import KatakanaChallenge from "./src/screens/Katakana/KatakanaChallenge";
import KatakanaMenu from "./src/screens/Katakana/KatakanaMenu";
import KatakanaRow from "./src/screens/Katakana/KatakanaRow";

// Bloques premium / examen
import B3VocabularioMenu from "./src/screens/N5/B3Vocabulario/B3VocabularioMenu";
import B4GramaticaIMenu from "./src/screens/N5/B4Gramatica/B4GramaticaIMenu";
import B5GramaticaIIMenu from "./src/screens/N5/B5Gramatica/B5GramaticaIIMenu";
import B6VidaCotidianaMenu from "./src/screens/N5/B6Vida/B6VidaCotidianaMenu";
import B7LecturaPracticaMenu from "./src/screens/N5/B7Lectura/B7LecturaPracticaMenu";
import B8EvaluacionesLogrosMenu from "./src/screens/N5/B8Evaluaciones/B8EvaluacionesLogrosMenu";
import ExamenFinalMapacheN5 from "./src/screens/N5/ExamenFinal/ExamenFinalMapacheN5";

// ✅ Bloque 3 — Números y Edad (tres actividades)
import B3_Familia from "./src/screens/N5/B3_Familia/B3_Familia";
import B3_Familia_Arbol from "./src/screens/N5/B3_Familia/B3_Familia_Arbol";
import B3_Familia_Roleplay from "./src/screens/N5/B3_Familia/B3_Familia_Roleplay";
import B3_Familia_Tarjetas from "./src/screens/N5/B3_Familia/B3_Familia_Tarjetas";
import B3_NumerosEdad from "./src/screens/N5/B3Vocabulario/B3_NumerosEdad";
import B3_NumerosEdad_Contadores from "./src/screens/N5/B3Vocabulario/B3_NumerosEdad_Contadores";
import B3_NumerosEdad_Roleplay from "./src/screens/N5/B3Vocabulario/B3_NumerosEdad_Roleplay";
import B3_NumerosEdad_Tarjetas from "./src/screens/N5/B3Vocabulario/B3_NumerosEdad_Tarjetas";
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
      {/* ⭐ Provider de puntaje global (tope 100 pt para B3) */}
      <B3ScoreProvider>
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

            <Stack.Screen name="OrigenesDelIdioma" component={OrigenesDelIdiomaScreen} options={{ headerShown: true, title: "Orígenes del idioma" }} />
            <Stack.Screen name="EscrituraN5" component={EscrituraScreen} options={{ headerShown: true, title: "Sistemas de escritura" }} />
            <Stack.Screen name="CulturaN5" component={CulturaScreen} options={{ headerShown: true, title: "Cultura básica" }} />
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

            <Stack.Screen name="EjemplosGrupoA" component={EjemplosGrupoA} options={{ headerShown: true, title: "Ejemplos — Grupo A" }} />

            {/* === Vocabulario K (REAL, ÚNICO) === */}
            <Stack.Screen name="VocabularioGrupoK" component={VocabularioGrupoK} options={{ headerShown: true, title: "Vocabulario — Grupo K" }} />

            {/* === Flashcards educativas === */}
            <Stack.Screen name="ATarjetas" component={AtarjetasScreen} options={{ headerShown: false }} />

            {/* === Matching K REAL === */}
            <Stack.Screen name="MatchingGrupoK" component={MatchingGrupoK} options={{ headerShown: true, title: "Matching — Grupo K" }} />

            {/* === Otros N5 === */}
            <Stack.Screen name="GifSaludo" component={GifSaludo} options={{ headerShown: true, title: "Saludos (GIF)" }} />
            <Stack.Screen name="VowelExercises" component={VowelExercisesScreen} options={{ headerShown: true, title: "Ejercicios vocales" }} />
            <Stack.Screen name="QuizCultural" component={QuizCultural} options={{ headerShown: true, title: "Quiz cultural" }} />
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
            <Stack.Screen name="TrazosGrupoA" component={TrazosGrupoA} options={{ headerShown: true, title: "Trazos — Grupo A" }} />
            <Stack.Screen name="PronunciacionGrupoA" component={PronunciacionGrupoA} options={{ headerShown: true, title: "Pronunciación — Grupo A" }} />

            {/* === Implementadas === */}
            <Stack.Screen name="ATrazoAnimado" component={ATrazoAnimado} options={{ headerShown: true, title: "Trazo animado" }} />

            {/* === Dictado visual (REAL) === */}
            <Stack.Screen name="ADictadoVisual" component={ADictadoVisual} options={{ headerShown: false }} />

            {/* === Placeholders varios === */}
            <Stack.Screen name="TarjetasGrupoA" options={{ headerShown: true, title: "Tarjetas — Grupo A" }} children={() => <Placeholder title="TarjetasGrupoA" />} />
            <Stack.Screen name="TrazoAnimadoGrupoA" options={{ headerShown: true, title: "Trazo animado — Grupo A" }} children={() => <Placeholder title="TrazoAnimadoGrupoA" />} />

            {/* === Grupo K === */}
            <Stack.Screen name="TrazoGrupoK" component={TrazosGrupoK} options={{ headerShown: true, title: "Trazo — Grupo K" }} />
            <Stack.Screen name="MemoriaGrupoK" component={MemoriaGrupoK} options={{ headerShown: false }} />

            {/* === Familias S/T === */}
            <Stack.Screen name="FamiliaS" component={FamiliaSScreen} />
            <Stack.Screen name="SEscrituraGrupoS" component={TrazosFamiliaSZ} options={{ headerShown: true, title: "Escritura (S)" }} />
            <Stack.Screen name="SEjemplosGrupoS" component={SEjemplosGrupoS} options={{ headerShown: true, title: "Ejemplos (S)" }} />
            <Stack.Screen name="SCaligrafiaDigital" component={SCaligrafiaDigital} options={{ headerShown: true, title: "Caligrafía digital (S)" }} />
            <Stack.Screen name="SLecturaSilabas" component={SLecturaSilabas} options={{ headerShown: true, title: "Lectura de sílabas (S)" }} />
            <Stack.Screen name="TTrazoGif" component={TTrazoGif} options={{ headerShown: true, title: "Trazo (T)" }} />
            <Stack.Screen name="TQuizEscucha" component={TQuizEscucha} options={{ headerShown: true, title: "Quiz de escucha (T)" }} />
            <Stack.Screen name="FamiliaNH" component={FamiliaNHScreen} options={{ title: "Familias N y H" }} />
            <Stack.Screen name="NLecturaGuiada" component={NLecturaGuiadaScreen} options={{ title: "Lectura guiada (N)" }} />
            <Stack.Screen name="HRoleplaySaludo" component={HRoleplaySaludoScreen} options={{ title: "Roleplay: me llamo..." }} />

            {/* === Menús de unidades === */}
            <Stack.Screen name="HiraganaMMenu" component={HiraganaMMenu} options={{ title: "Hiragana M (まみむめも)" }} />
            <Stack.Screen name="HiraganaYRMenu" component={HiraganaYRMenu} options={{ title: "Hiragana Y–R (やゆよ・らりるれろ)" }} />
            {/* ✅ NUEVO: W–N */}
            <Stack.Screen name="HiraganaWNMenu" component={HiraganaWNMenu} options={{ title: "Hiragana W–N (わ・を・ん / contracciones)" }} />

            {/* opcional: subpantallas */}
            <Stack.Screen name="M_Dictado" component={M_Dictado} options={{ title: "Dictado (M)" }} />
            <Stack.Screen name="M_PracticaVoz" component={M_PracticaVoz} options={{ title: "Práctica con voz (M)" }} />
            <Stack.Screen name="YR_AudioInteractivo" component={YR_AudioInteractivo} options={{ title: "Audio interactivo (Y–R)" }} />
            <Stack.Screen name="YR_CompletarPalabras" component={YR_CompletarPalabras} options={{ title: "Completar palabras (Y–R)" }} />

            {/* ✅ Subpantallas W–N nuevas */}
            <Stack.Screen name="WN_LecturaFrases" component={WN_LecturaFrases} options={{ headerShown: true, title: "Lectura de frases (W–N)" }} />
            <Stack.Screen name="WN_PracticaNFinal" component={WN_PracticaNFinal} options={{ headerShown: true, title: "Cierre con ん (W–N)" }} />

            {/* === Katakana === */}
            <Stack.Screen name="KatakanaMenu" component={KatakanaMenu} options={{ title: "Katakana — Menú" }} />
            <Stack.Screen name="KatakanaRow" component={KatakanaRow} options={{ title: "Katakana — Práctica por fila" }} />
            <Stack.Screen name="KatakanaChallenge" component={KatakanaChallenge} options={{ title: "Katakana — Challenge" }} />

            {/* === Bloques premium / examen === */}
            <Stack.Screen name="B3VocabularioMenu" component={B3VocabularioMenu} options={{ title: "Bloque 3" }} />
            <Stack.Screen name="B4GramaticaIMenu" component={B4GramaticaIMenu} options={{ title: "Bloque 4" }} />
            <Stack.Screen name="B5GramaticaIIMenu" component={B5GramaticaIIMenu} options={{ title: "Bloque 5" }} />
            <Stack.Screen name="B6VidaCotidianaMenu" component={B6VidaCotidianaMenu} options={{ title: "Bloque 6" }} />
            <Stack.Screen name="B7LecturaPracticaMenu" component={B7LecturaPracticaMenu} options={{ title: "Bloque 7" }} />
            <Stack.Screen name="B8EvaluacionesLogrosMenu" component={B8EvaluacionesLogrosMenu} options={{ title: "Bloque 8" }} />
            <Stack.Screen name="ExamenFinalMapacheN5" component={ExamenFinalMapacheN5} options={{ title: "Examen final N5" }} />

            {/* ✅ Bloque 3: pantallas reales */}
            <Stack.Screen name="B3_NumerosEdad" component={B3_NumerosEdad} options={{ headerShown: true, title: "B3 — Números y edad" }} />
            <Stack.Screen name="B3_NumerosEdad_Roleplay" component={B3_NumerosEdad_Roleplay} options={{ headerShown: true, title: "Roleplay — Números y edad" }} />
            <Stack.Screen name="B3_NumerosEdad_Tarjetas" component={B3_NumerosEdad_Tarjetas} options={{ headerShown: true, title: "Tarjetas animadas — Números y edad" }} />
            <Stack.Screen name="B3_NumerosEdad_Contadores" component={B3_NumerosEdad_Contadores} options={{ headerShown: true, title: "Contadores — Números y edad" }} />

             <Stack.Screen name="B3_Familia" component={B3_Familia} />
      <Stack.Screen
        name="B3_Familia_Roleplay"
        component={B3_Familia_Roleplay}
        options={{ title: "Roleplay (Familia)" }}
      />
      <Stack.Screen
        name="B3_Familia_Tarjetas"
        component={B3_Familia_Tarjetas}
        options={{ title: "Tarjetas (Familia)" }}
      />
      <Stack.Screen
        name="B3_Familia_Arbol"
        component={B3_Familia_Arbol}
        options={{ title: "Árbol familiar" }}
      />
          </Stack.Navigator>
        </NavigationContainer>
      </B3ScoreProvider>
    </GestureHandlerRootView>
  );
}
