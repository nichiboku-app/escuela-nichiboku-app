// src/screens/SplashScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Bienvenida: undefined;
  Home: undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const [msg, setMsg] = useState('Cargando…');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setMsg('Leyendo estado…');
        // ⚙️ Flags recomendados (ajústalos a tu lógica real):
        const onboardingDone = (await AsyncStorage.getItem('onboarding_done')) === '1';
        const userToken = await AsyncStorage.getItem('user_token'); // setéalo tras login

        // Pequeña pausa para que se vea el Splash
        await new Promise((r) => setTimeout(r, 200));

        let next: keyof RootStackParamList;
        if (!onboardingDone) {
          next = 'Onboarding';
        } else if (!userToken) {
          next = 'Login';
        } else {
          // Puedes mandar a Bienvenida o directo al Drawer Home
          next = 'Home';
        }

        if (!alive) return;
        navigation.reset({
          index: 0,
          routes: [{ name: next as never }],
        });
      } catch (e) {
        console.log('Splash error', e);
        if (!alive) return;
        // Ante cualquier error, abre Onboarding para no bloquear
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' as never }],
        });
      }
    })();

    return () => { alive = false; };
  }, [navigation]);

  return (
    <View style={s.container}>
      <Text style={s.title}>Nichiboku</Text>
      <ActivityIndicator />
      <Text style={s.p}>{msg}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
  p: { fontSize: 14, marginTop: 8, color: '#666' },
});
