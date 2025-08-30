// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppDrawerNavigator from './src/navigation/AppDrawerNavigator';
import BienvenidaScreen from './src/screens/BienvenidaScreen';
import EntradaActividadesN5Screen from './src/screens/EntradaActividadesN5Screen';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SplashScreen from './src/screens/SplashScreen';

// N5
import N5Bienvenida from './src/screens/N5/Bienvenida';
import CulturaScreen from './src/screens/N5/CulturaScreen';
import EscrituraScreen from './src/screens/N5/EscrituraScreen';
import GifSaludo from './src/screens/N5/GifSaludo';
import TemaN5 from './src/screens/N5/TemaN5';
import VowelExercisesScreen from './src/screens/VowelExercisesScreen';

// ✅ IMPORT CORRECTO DE LA NUEVA SCREEN
import QuizCultural from './src/screens/N5/QuizCultural';

// Destino final tras el logro
import IntroJaponesScreen from './src/screens/IntroJaponesScreen';

// Otras pantallas N5
import OrigenesDelIdiomaScreen from './src/screens/N5/OrigenesDelIdiomaScreen';
import SubtemaScreen from './src/screens/N5/SubtemaScreen';

import { RootStackParamList } from './types';

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

          {/* Drawer principal */}
          <Stack.Screen name="Home" component={AppDrawerNavigator} />

          {/* N5 */}
          <Stack.Screen name="N5Bienvenida" component={N5Bienvenida} />

          {/* Pantalla del logro */}
          <Stack.Screen
            name="EntradaActividadesN5"
            component={EntradaActividadesN5Screen}
            options={{ headerShown: false }}
          />

          {/* Destino final después del logro */}
          <Stack.Screen
            name="IntroJapones"
            component={IntroJaponesScreen}
            options={{ headerShown: false }}
          />

          {/* =========================
               NUEVAS PANTALLAS N5
             ========================= */}
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

          <Stack.Screen
            name="Subtema"
            component={SubtemaScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="TemaN5"
            component={TemaN5}
            options={({ route }) => ({
              headerShown: true,
              title: (route?.params as any)?.title ?? 'Hiragana',
            })}
          />
          
<Stack.Screen
  name="GifSaludo"
  component={GifSaludo}
  options={{ headerShown: true, title: 'Saludos (GIF)' }}
/>

          {/* Ejercicios */}
          <Stack.Screen
            name="VowelExercises"
            component={VowelExercisesScreen}
            options={{ headerShown: true, title: 'Ejercicios vocales' }}
          />

          {/* ✅ NUEVA RUTA REGISTRADA */}
          <Stack.Screen
            name="QuizCultural"
            component={QuizCultural}
            options={{ headerShown: true, title: 'Quiz cultural' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
