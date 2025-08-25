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
import N5Bienvenida from './src/screens/N5/Bienvenida'; // ← pantalla “roja”
import TemaN5 from './src/screens/N5/TemaN5';
import VowelExercisesScreen from './src/screens/VowelExercisesScreen';

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
          {/* <Stack.Screen name="CrearCuenta" component={CrearCuentaScreen} /> */}
          <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />

          {/* Drawer principal (sin su propio NavigationContainer) */}
          <Stack.Screen name="Home" component={AppDrawerNavigator} />

          {/* N5 */}
          <Stack.Screen name="N5Bienvenida" component={N5Bienvenida} />
          <Stack.Screen
  name="EntradaActividadesN5"
  component={EntradaActividadesN5Screen}
  options={{ headerShown: false }}
/>
          <Stack.Screen
            name="TemaN5"
            component={TemaN5}
            options={({ route }) => ({
              headerShown: true,
              title: route?.params?.title ?? 'Hiragana',
            })}
          />

          {/* Ejercicios */}
          <Stack.Screen
            name="VowelExercises"
            component={VowelExercisesScreen}
            options={{ headerShown: true, title: 'Ejercicios vocales' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
