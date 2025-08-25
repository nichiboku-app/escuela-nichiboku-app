// src/screens/EntradaActividadesN5Screen.tsx
import { Audio } from 'expo-av';
import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    ImageBackground,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// ASSETS (ajusta rutas si cambian)
const BG = require('../../assets/images/fondonegro.webp');
const MAPACHE = require('../../assets/images/mapache_n5.webp');
const SOUND = require('../../assets/sounds/comienzon5full.mp3');

export default function EntradaActividadesN5Screen() {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  // Animación del logro (0 oculto → 1 visible)
  const ach = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let sound: Audio.Sound | undefined;
    const run = async () => {
      try {
        sound = new Audio.Sound();
        await sound.loadAsync(SOUND);
        await sound.playAsync();
      } catch {}

      // Animación general
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();

      // Mostrar logro (flor): aparece, espera y desaparece
      ach.setValue(0);
      Animated.timing(ach, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(ach, {
            toValue: 0,
            duration: 280,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }).start();
        }, 2400);
      });
    };

    run();
    return () => { if (sound) sound.unloadAsync(); };
  }, []);

  // Estilo animado del logro (fade + pequeño “bloom”)
  const achStyle = {
    opacity: ach,
   transform: [{ translateY:180}]
  };

  // Parámetros de la flor
  const PETAL_COLOR = '#6B0015'; // vino
  const CENTER_COLOR = '#5A0012'; // vino más oscuro
  const PETAL_COUNT = 8;
  const FLOWER_SIZE = 35;
  const PETAL_SIZE = 45
  const CENTER_SIZE = 104;
  const R = 56; // radio donde se colocan los pétalos
  const CX = FLOWER_SIZE / 2;
  const CY = FLOWER_SIZE / 2;

  const petals = Array.from({ length: PETAL_COUNT }, (_, i) => {
    const theta = (i * 2 * Math.PI) / PETAL_COUNT;
    const left = CX + R * Math.cos(theta) - PETAL_SIZE / 2;
    const top = CY + R * Math.sin(theta) - PETAL_SIZE / 2;
    return (
      <View
        key={i}
        style={[
          s.petal,
          {
            left,
            top,
            width: PETAL_SIZE,
            height: PETAL_SIZE,
            borderRadius: PETAL_SIZE / 2,
            backgroundColor: PETAL_COLOR,
          },
        ]}
      />
    );
  });

  return (
    <View style={s.container}>
      {/* Translucent para que la imagen llegue detrás del notch/estatus */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={BG}
        resizeMode="cover"
        style={s.bg}
        imageStyle={s.bgImage}
      >
        {/* LOGRO en el CENTRO: flor vino + icono + texto */}
        <Animated.View
          pointerEvents="none"
          style={[s.achOverlay, achStyle]}
        >
          <View style={[s.flowerWrap, { width: FLOWER_SIZE, height: FLOWER_SIZE }]}>
            {/* Pétalos */}
            {petals}
            {/* Centro de la flor */}
            <View
              style={[
                s.flowerCenter,
                {
                  width: CENTER_SIZE,
                  height: CENTER_SIZE,
                  borderRadius: CENTER_SIZE / 2,
                  backgroundColor: CENTER_COLOR,
                },
              ]}
            >
              <ExpoImage source={MAPACHE} style={s.achIcon} contentFit="contain" />
              <Text style={s.achTitle}>forja tu destino</Text>
              <Text style={s.achXP}>+10 XP</Text>
            </View>
          </View>
        </Animated.View>

        {/* Contenido principal */}
        <Animated.View
          style={[
            s.centerWrap,
            { opacity: fade, transform: [{ translateY: slide }, { scale }] },
          ]}
        >
          <ExpoImage source={MAPACHE} style={s.logo} contentFit="contain" transition={250} />
          <Text style={s.kicker}>NIVEL</Text>
          <Text style={s.kicker}>MAPACHE</Text>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bg: { ...StyleSheet.absoluteFillObject },
  bgImage: {},

  // Overlay centrado para el logro
  achOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Flor
  flowerWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra general de la flor
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  petal: {
    position: 'absolute',
  },
  flowerCenter: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: 13,   // ↑ Empuja ICONO+texto un poco hacia abajo dentro del círculo
  paddingHorizontal: 8,
  },

  // Icono y textos del logro
  achIcon: {
  width: 38,
  height: 38,
  tintColor: '#fff',
  marginTop: -20,       
  marginBottom: 4,     // ↓ Reduce espacio antes del texto
  },
  achTitle: {
  color: '#fff',
  fontWeight: '900',
  fontSize: 8,       // ↓ Más pequeño (antes 12)
  marginTop: 2,
  },
  achXP: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 8,
    marginTop: 2,
  },

  // Contenido principal
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.select({ ios: 96, android: 72 }),
  },
  logo: {
    width: 190,
    aspectRatio: 1,
    marginBottom: -7,
  },
  kicker: {
    fontSize: 18,
    letterSpacing: 6,
    color: '#111',
    fontWeight: '700',
  },
});
