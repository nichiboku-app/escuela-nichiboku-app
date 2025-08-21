// src/navigation/AppDrawerNavigator.tsx
import {
  createDrawerNavigator,
  type DrawerContentComponentProps,
  type DrawerNavigationOptions,
} from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Image, Pressable } from 'react-native';

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

export type HomeStackParamList = {
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
    <HomeStack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{ headerShown: false }} // ⬅️ el stack NO muestra header
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ActividadesN5" component={ActividadesN5Screen} />
      <HomeStack.Screen name="CursoN5" component={CursoN5Screen} />
      <HomeStack.Screen name="Calendario" component={CalendarioScreen} />
      <HomeStack.Screen name="Notas" component={NotasScreen} />
      <HomeStack.Screen name="BienvenidaCursoN5" component={BienvenidaCursoN5} />
    </HomeStack.Navigator>
  );
}

// ⭐️ Hamburguesa grande personalizada que abre el Drawer
function CustomHamburger() {
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={{ paddingHorizontal: 12, paddingVertical: 6 }}
      hitSlop={12}
    >
      <Image
        source={require('../../assets/icons/hamburger.webp')}
        // Ajusta tamaño aquí
        style={{ width: 48, height: 48, resizeMode: 'contain' }}
      />
    </Pressable>
  );
}

const screenOptions: DrawerNavigationOptions = {
  // headerShown: false,  ⬅️ IMPORTANTE: lo controlaremos por pantalla
  drawerType: 'slide',
  drawerPosition: 'left',
  swipeEnabled: true,
  swipeEdgeWidth: 80,
  overlayColor: 'rgba(0,0,0,0.25)',
  drawerStyle: {
    width: 320,
    backgroundColor: 'transparent',
  },
};

export default function AppDrawerNavigator() {
  return (
    <Drawer.Navigator
      // @ts-expect-error - id opcional; lo usamos con openDrawerDeep
      id="AppDrawer"
      initialRouteName="Main"
      screenOptions={screenOptions}
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
      drawerContent={(props: DrawerContentComponentProps) => <CustomDrawer {...props} />}
    >
      {/* ⬇️ SOLO para Main (HomeStack) mostramos header con hamburguesa grande */}
      <Drawer.Screen
        name="Main"
        component={HomeStackNavigator}
        options={{
          drawerLabel: 'Inicio',
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,                  // header sin barra sólida
          headerLeft: () => <CustomHamburger />,    // ← hamburguesa grande
          headerRight: () => null,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />

      {/* El resto sin header (o personalízalos igual si quieres la hamburguesa visible ahí también) */}
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
