// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { RootStackParamList } from './types';

// Screens raíz
import BienvenidaScreen from './src/screens/BienvenidaScreen';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SplashScreen from './src/screens/SplashScreen';

// Drawer principal
import AppDrawerNavigator from './src/navigation/AppDrawerNavigator';

// N5 (rutas fuera del Drawer)
import EntradaActividadesN5Screen from './src/screens/EntradaActividadesN5Screen';
import IntroJaponesScreen from './src/screens/IntroJaponesScreen';
import N5Bienvenida from './src/screens/N5/Bienvenida';
import CulturaScreen from './src/screens/N5/CulturaScreen';
import EscrituraScreen from './src/screens/N5/EscrituraScreen';
import GifSaludo from './src/screens/N5/GifSaludo';
import HiraganaScreen from './src/screens/N5/HiraganaScreen';
import OrigenesDelIdiomaScreen from './src/screens/N5/OrigenesDelIdiomaScreen';
import QuizCultural from './src/screens/N5/QuizCultural';
import SubtemaScreen from './src/screens/N5/SubtemaScreen';
import TemaN5 from './src/screens/N5/TemaN5';
import VowelExercisesScreen from './src/screens/VowelExercisesScreen';

// Modal de video N5
import VideoIntroModal from './src/screens/N5/VideoIntroModal';

// ✅ NUEVA: pantalla real
import TrazosGrupoA from './src/screens/N5/TrazosGrupoA';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Helpers: Placeholders mientras implementamos pantallas nuevas
function Placeholder({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: '900', marginBottom: 8 }}>{title}</Text>
      <Text style={{ opacity: 0.7, textAlign: 'center' }}>
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
            animation: 'simple_push',
            gestureEnabled: true,
            freezeOnBlur: true,
          }}
        >
          {/* Arranque */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />

          {/* Drawer principal */}
          <Stack.Screen name="Home" component={AppDrawerNavigator} />

          {/* N5 fuera del Drawer */}
          <Stack.Screen name="N5Bienvenida" component={N5Bienvenida} />
          <Stack.Screen name="EntradaActividadesN5" component={EntradaActividadesN5Screen} />
          <Stack.Screen name="IntroJapones" component={IntroJaponesScreen} />

          <Stack.Screen
            name="OrigenesDelIdioma"
            component={OrigenesDelIdiomaScreen}
            options={{ headerShown: true, title: 'Orígenes del idioma' }}
          />
          <Stack.Screen
            name="EscrituraN5"
            component={EscrituraScreen}
            options={{ headerShown: true, title: 'Sistemas de escritura' }}
          />
          <Stack.Screen
            name="CulturaN5"
            component={CulturaScreen}
            options={{ headerShown: true, title: 'Cultura básica' }}
          />
          <Stack.Screen name="Subtema" component={SubtemaScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="TemaN5"
            component={TemaN5}
            options={({ route }) => ({
              headerShown: true,
              title: (route?.params as any)?.title ?? 'Hiragana',
            })}
          />
          <Stack.Screen
            name="Hiragana"
            component={HiraganaScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen name="GifSaludo" component={GifSaludo} options={{ headerShown: true, title: 'Saludos (GIF)' }} />
          <Stack.Screen
            name="VowelExercises"
            component={VowelExercisesScreen}
            options={{ headerShown: true, title: 'Ejercicios vocales' }}
          />
          <Stack.Screen
            name="QuizCultural"
            component={QuizCultural}
            options={{ headerShown: true, title: 'Quiz cultural' }}
          />
          <Stack.Screen
            name="VideoIntroModal"
            component={VideoIntroModal}
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'fade',
              contentStyle: { backgroundColor: '#000' },
            }}
          />

          {/* === RUTAS HIRAGANA === */}
          {/* 👉 TrazosGrupoA ya usa la pantalla real */}
          <Stack.Screen
            name="TrazosGrupoA"
            component={TrazosGrupoA}
            options={{ headerShown: true, title: 'Trazos — Grupo A' }}
          />

          {/* Estas quedan como placeholders por ahora */}
          <Stack.Screen
            name="PronunciacionGrupoA"
            options={{ headerShown: true, title: 'Pronunciación — Grupo A' }}
            children={() => <Placeholder title="PronunciacionGrupoA" />}
          />
          <Stack.Screen
            name="EjemplosGrupoA"
            options={{ headerShown: true, title: 'Ejemplos — Grupo A' }}
            children={() => <Placeholder title="EjemplosGrupoA" />}
          />

          <Stack.Screen
            name="TarjetasGrupoA"
            options={{ headerShown: true, title: 'Tarjetas — Grupo A' }}
            children={() => <Placeholder title="TarjetasGrupoA" />}
          />
          <Stack.Screen
            name="TrazoAnimadoGrupoA"
            options={{ headerShown: true, title: 'Trazo animado — Grupo A' }}
            children={() => <Placeholder title="TrazoAnimadoGrupoA" />}
          />
          <Stack.Screen
            name="DictadoVisualGrupoA"
            options={{ headerShown: true, title: 'Dictado visual — Grupo A' }}
            children={() => <Placeholder title="DictadoVisualGrupoA" />}
          />

          <Stack.Screen
            name="TrazoGrupoK"
            options={{ headerShown: true, title: 'Trazo — Grupo K' }}
            children={() => <Placeholder title="TrazoGrupoK" />}
          />
          <Stack.Screen
            name="VocabularioGrupoK"
            options={{ headerShown: true, title: 'Vocabulario — Grupo K' }}
            children={() => <Placeholder title="VocabularioGrupoK" />}
          />
          <Stack.Screen
            name="MatchingGrupoK"
            options={{ headerShown: true, title: 'Matching — Grupo K' }}
            children={() => <Placeholder title="MatchingGrupoK" />}
          />
          <Stack.Screen
            name="MemoriaGrupoK"
            options={{ headerShown: true, title: 'Memoria — Grupo K' }}
            children={() => <Placeholder title="MemoriaGrupoK" />}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
