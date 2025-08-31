// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens raíz
import BienvenidaScreen from './src/screens/BienvenidaScreen';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SplashScreen from './src/screens/SplashScreen';

// Drawer principal (todo lo “Home” vive aquí dentro)
import AppDrawerNavigator from './src/navigation/AppDrawerNavigator';

// N5 (rutas que no viven dentro del Drawer)
import EntradaActividadesN5Screen from './src/screens/EntradaActividadesN5Screen';
import IntroJaponesScreen from './src/screens/IntroJaponesScreen';
import N5Bienvenida from './src/screens/N5/Bienvenida';
import CulturaScreen from './src/screens/N5/CulturaScreen';
import EscrituraScreen from './src/screens/N5/EscrituraScreen';
import GifSaludo from './src/screens/N5/GifSaludo';
import OrigenesDelIdiomaScreen from './src/screens/N5/OrigenesDelIdiomaScreen';
import QuizCultural from './src/screens/N5/QuizCultural';
import SubtemaScreen from './src/screens/N5/SubtemaScreen';
import TemaN5 from './src/screens/N5/TemaN5';
import VowelExercisesScreen from './src/screens/VowelExercisesScreen';

// Modal de video N5 (pantalla completa)
import VideoIntroModal from './src/screens/N5/VideoIntroModal';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Bienvenida: undefined;

  // Entrada al Drawer
  Home: undefined;

  // N5 fuera del Drawer
  N5Bienvenida: undefined;
  EntradaActividadesN5: undefined;
  IntroJapones: undefined;
  OrigenesDelIdioma: undefined;
  EscrituraN5: undefined;
  CulturaN5: undefined;
  Subtema: undefined;
  TemaN5: { title?: string } | undefined;

  GifSaludo: undefined;
  VowelExercises: undefined;
  QuizCultural: undefined;

  // Modal
  VideoIntroModal: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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

          {/* Drawer principal (Home + demás del Drawer) */}
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
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
