// src/navigation/AppDrawerNavigator.tsx
import {
  createDrawerNavigator,
  type DrawerContentComponentProps,
  type DrawerNavigationOptions,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// Drawer UI
import CustomDrawer from '../ui/CustomDrawer';

// Pantallas del Drawer (en src/screens)
import ContactoScreen from '../screens/ContactoScreen';
import EventosScreen from '../screens/EventosScreen';
import HomeScreen from '../screens/HomeScreen';
import IAScreen from '../screens/IAScreen';
import NoticiasScreen from '../screens/NoticiasScreen';
import PagosScreen from '../screens/PagosScreen';
import PerfilScreen from '../screens/PerfilScreen';
import PoliticaScreen from '../screens/PoliticaScreen';
import PreguntasScreen from '../screens/PreguntasScreen';

// N5 que abrimos dentro del HomeStack
import ActividadesN5Screen from '../screens/ActividadesN5Screen';
import BienvenidaCursoN5 from '../screens/BienvenidaCursoN5_1Screen';
import CalendarioScreen from '../screens/CalendarioScreen';
import CursoN5Screen from '../screens/CursoN5Screen';
import NotasScreen from '../screens/NotasScreen';

// ===== Tipos =====
export type DrawerParamList = {
  Main: undefined;       // contiene el HomeStack
  Perfil: undefined;
  Pagos: undefined;
  Noticias: undefined;
  Eventos: undefined;
  IA: undefined;
  Contacto: undefined;
  Preguntas: undefined;
  Politica: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;   // pantalla raíz del stack interno
  ActividadesN5: undefined;
  CursoN5: undefined;
  Calendario: undefined;
  Notas: undefined;
  BienvenidaCursoN5: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator initialRouteName="HomeMain" screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ActividadesN5" component={ActividadesN5Screen} />
      <HomeStack.Screen name="CursoN5" component={CursoN5Screen} />
      <HomeStack.Screen name="Calendario" component={CalendarioScreen} />
      <HomeStack.Screen name="Notas" component={NotasScreen} />
      <HomeStack.Screen name="BienvenidaCursoN5" component={BienvenidaCursoN5} />
    </HomeStack.Navigator>
  );
}

const screenOptions: DrawerNavigationOptions = {
  drawerType: 'slide',
  drawerPosition: 'left',
  swipeEnabled: true,
  swipeEdgeWidth: 80,
  overlayColor: 'rgba(0,0,0,0.25)',
  drawerStyle: { width: 320, backgroundColor: 'transparent' },
};

export default function AppDrawerNavigator() {
  return (
    <Drawer.Navigator
      // @ts-expect-error id opcional para helpers
      id="AppDrawer"
      initialRouteName="Main"
      screenOptions={screenOptions}
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
      drawerContent={(props: DrawerContentComponentProps) => <CustomDrawer {...props} />}
    >
      {/* Home stack DENTRO del Drawer. SIN header para evitar hamburguesa doble */}
      <Drawer.Screen
        name="Main"
        component={HomeStackNavigator}
        options={{ drawerLabel: 'Inicio', headerShown: false }}
      />

      {/* El resto de pantallas del Drawer */}
      <Drawer.Screen name="Perfil" component={PerfilScreen} options={{ headerShown: false }} />
      <Drawer.Screen name="Pagos" component={PagosScreen} options={{ headerShown: false }} />
      <Drawer.Screen name="Noticias" component={NoticiasScreen} options={{ headerShown: false }} />
      <Drawer.Screen name="Eventos" component={EventosScreen} options={{ headerShown: false }} />
      <Drawer.Screen name="IA" component={IAScreen} options={{ headerShown: false }} />
      <Drawer.Screen name="Contacto" component={ContactoScreen} options={{ headerShown: false }} />
      <Drawer.Screen name="Preguntas" component={PreguntasScreen} options={{ headerShown: false }} />
      <Drawer.Screen name="Politica" component={PoliticaScreen} options={{ headerShown: false }} />
    </Drawer.Navigator>
  );
}
