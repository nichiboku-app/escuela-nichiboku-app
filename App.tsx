// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AppDrawerNavigator from './src/navigation/AppDrawerNavigator'; // Drawer dentro de Home
import ActividadN5 from './src/screens/ActividadesN5Screen';
import BienvenidaCursoN5_1 from './src/screens/BienvenidaCursoN5_1Screen';
import BienvenidaScreen from './src/screens/BienvenidaScreen';
import CalendarioScreen from './src/screens/CalendarioScreen';
import CrearCuentaScreen from './src/screens/CrearCuentaScreen';
import CursoN5Screen from './src/screens/CursoN5Screen';
import LoginScreen from './src/screens/LoginScreen';
import NotasScreen from './src/screens/NotasScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SplashScreen from './src/screens/SplashScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CrearCuenta" component={CrearCuentaScreen} />
        <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />
        <Stack.Screen name="Notas" component={NotasScreen} />
        <Stack.Screen name="Calendario" component={CalendarioScreen} />
        <Stack.Screen name="Home" component={AppDrawerNavigator} />
        <Stack.Screen name="BienvenidaCursoN5" component={BienvenidaCursoN5_1} />
        <Stack.Screen name="CursoN5" component={CursoN5Screen} />
          <Stack.Screen name="ActividadesN5" component={ActividadN5} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
