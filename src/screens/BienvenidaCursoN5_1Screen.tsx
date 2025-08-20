import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Asset } from 'expo-asset';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    Image,
    Pressable,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';

type RootStackParamList = {
  BienvenidaCursoN5_1: undefined;
  CursoN5: undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

// === ARCHIVO DE IMAGEN ===
const HERO_SRC: number = require('../../assets/images/bienvenida1_cropped.png');

// === ENCUADRE (0 a 1) ===
// 0 = alinear a la izquierda/arriba, 0.5 = centro, 1 = derecha/abajo
const FOCUS_X = 0.92;  // mueve horizontal (0 izq, 1 der)
const FOCUS_Y = -9;  // mueve vertical   (0 arriba, 1 abajo)

// === ZOOM / ANCHO VISIBLE ===
// 1 = full-bleed. Menor que 1 = menos zoom (se ve “menos ancho”).
const SCALE_BIAS = 0.72;

// === Asegura sobrante vertical para que FOCUS_Y sí mueva ===
// 0.05–0.15 suele ir bien (5–15% de recorte vertical)
const EXTRA_CROP_Y = -0.23;

export default function BienvenidaCursoN5_1Screen() {
  const navigation = useNavigation<Nav>();
  const { width: W, height: H } = useWindowDimensions();

  const [ready, setReady] = useState(false);
  const [imgW, setImgW] = useState<number>(0);
  const [imgH, setImgH] = useState<number>(0);

  // Animación (fade + zoom-out)
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1.04)).current;

  useEffect(() => {
    (async () => {
      await Asset.fromModule(HERO_SRC).downloadAsync();
      const res = Image.resolveAssetSource(HERO_SRC);
      setImgW(res?.width ?? 0);
      setImgH(res?.height ?? 0);
      setReady(true);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    })();
  }, [opacity, scaleAnim]);

  // === Cálculo "cover" manual con control de zoom y PAN ===
  // Escala mínima para cubrir la pantalla
  const baseScale = imgW && imgH ? Math.max(W / imgW, H / imgH) : 1;

  // Aplicamos el sesgo de zoom (para “menos ancho”)
  let coverScale = baseScale * SCALE_BIAS;

  // --- Clave: garantizar SOBRANTE vertical ---
  // Si la altura escalada no llega a H (no hay overflowY), forzamos un poco de zoom
  // para que sí exista recorte vertical y FOCUS_Y pueda mover hacia arriba/abajo.
  const scaledHTest = imgH * coverScale;
  if (imgW && imgH && scaledHTest <= H) {
    // al menos cubrir la altura + un extra para permitir PAN vertical
    coverScale = (H / imgH) * (1 + EXTRA_CROP_Y);
  }

  // Tamaños finales
  const scaledW = Math.ceil(imgW * coverScale);
  const scaledH = Math.ceil(imgH * coverScale);

  // Sobrante a recortar en cada eje (si no hay, queda 0)
  const overflowX = Math.max(0, scaledW - W);
  const overflowY = Math.max(25, scaledH - H);

  // Offset según el foco (0..1)
  const offsetLeft = -Math.round(overflowX * FOCUS_X);
  const offsetTop  = -Math.round(overflowY * FOCUS_Y);

  const goNext = () => navigation.navigate('CursoN5');

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Pressable style={styles.full} onPress={goNext}>
        {!ready && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        )}

        {ready && (
          <Animated.Image
            source={HERO_SRC}
            style={[
              styles.image,
              {
                width: scaledW || W,
                height: scaledH || H,
                left: offsetLeft,
                top: offsetTop,
                opacity,
                transform: [{ scale: scaleAnim }],
              },
            ]}
            resizeMode="stretch" // controlamos proporción nosotros
          />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f6f2ea' },
  full: { flex: 1, overflow: 'hidden' }, // recorta lo que sobresale
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { position: 'absolute' },
});
