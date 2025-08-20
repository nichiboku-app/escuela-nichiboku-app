// src/navigation/AppDrawerNavigator.tsx
import {
  createDrawerNavigator,
  type DrawerContentComponentProps,
  type DrawerNavigationOptions,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CustomDrawer from '../ui/CustomDrawer';

import ContactoScreen from '../screens/ContactoScreen';
import EventosScreen from '../screens/EventosScreen';
import HomeScreen from '../screens/HomeScreen';
import IAScreen from '../screens/IAScreen';
import NoticiasScreen from '../screens/NoticiasScreen';
import PagosScreen from '../screens/PagosScreen';
import PerfilScreen from '../screens/PerfilScreen';
import PoliticaScreen from '../screens/PoliticaScreen';
import PreguntasScreen from '../screens/PreguntasScreen';

import ActividadesN5Screen from '../screens/ActividadesN5Screen';
import BienvenidaCursoN5 from '../screens/BienvenidaCursoN5_1Screen';
import CalendarioScreen from '../screens/CalendarioScreen';
import CursoN5Screen from '../screens/CursoN5Screen';
import NotasScreen from '../screens/NotasScreen';

export type DrawerParamList = {
  Main: undefined;
  Perfil: undefined;
  Pagos: undefined;
  Noticias: undefined;
  Eventos: undefined;
  IA: undefined;
  Contacto: undefined;
  Preguntas: undefined;
  Politica: undefined;
};

type HomeStackParamList = {
  HomeMain: undefined;
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
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
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
  headerShown: false,
  drawerType: 'slide',
  drawerPosition: 'left',
  swipeEnabled: true,
  swipeEdgeWidth: 80,
  overlayColor: 'rgba(0,0,0,0.25)',
  drawerStyle: {
    width: 320,
    backgroundColor: 'transparent',
  },
  // ❌ sceneContainerStyle no va aquí en tu versión
};

export default function AppDrawerNavigator() {
  return (
    <Drawer.Navigator
      // Si tu TS se queja por 'id', puedes quitar esta línea y usar getParent() sin id.
      // @ts-expect-error - compat de tipos entre versiones
      id="AppDrawer"
      initialRouteName="Main"
      screenOptions={screenOptions}
      // ✅ Pon sceneContainerStyle aquí, en el Navigator:
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
      drawerContent={(props: DrawerContentComponentProps) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen
        name="Main"
        component={HomeStackNavigator}
        options={{ drawerLabel: 'Inicio' }}
      />
      <Drawer.Screen name="Perfil" component={PerfilScreen} />
      <Drawer.Screen name="Pagos" component={PagosScreen} />
      <Drawer.Screen name="Noticias" component={NoticiasScreen} />
      <Drawer.Screen name="Eventos" component={EventosScreen} />
      <Drawer.Screen name="IA" component={IAScreen} />
      <Drawer.Screen name="Contacto" component={ContactoScreen} />
      <Drawer.Screen name="Preguntas" component={PreguntasScreen} />
      <Drawer.Screen name="Politica" component={PoliticaScreen} />
    </Drawer.Navigator>
  );
}
