// src/navigation/AppDrawerNavigator.tsx
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
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

export type DrawerParamList = {
  HomeMain: undefined;
  Perfil: undefined;
  Pagos: undefined;
  Noticias: undefined;
  Eventos: undefined;
  IA: undefined;
  Contacto: undefined;
  Preguntas: undefined;
  Politica: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const screenOptions: DrawerNavigationOptions = {
   headerShown: false,
    drawerType: 'slide',
    drawerPosition: 'left',
    swipeEnabled: true,
    swipeEdgeWidth: 80,
    overlayColor: 'rgba(0,0,0,0.25)',
    drawerStyle: {
      width: 320,
      backgroundColor: 'transparent', // 👈 para ver las capas decorativas 👈 para que se vea tu ImageBackground del CustomDrawer
  },
};

export default function AppDrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="HomeMain"
      screenOptions={screenOptions}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="HomeMain" component={HomeScreen} />
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
