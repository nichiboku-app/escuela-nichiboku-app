// src/components/SakuraFall.tsx
import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

export type SakuraFallProps = {
  count?: number;
  width?: number;
  height?: number;
  sizeMin?: number;
  sizeMax?: number;
  baseDuration?: number;
  wind?: number;
  sway?: number;
  /** 0..1: transparencia global de cada pétalo */
  opacity?: number;
  loop?: boolean;
  /** Pasa tu propia imagen si quieres (PNG/WebP con transparencia) */
  petalSource?: any;
  /** Color para “teñir” el pétalo y hacerlo más sólido (opcional) */
  tintColor?: string;
  /** Duplica el mismo pétalo N veces superpuesto (1..3 recomendado) para solidificarlo */
  boostLayers?: number;
  style?: StyleProp<ViewStyle>;
};

type PetalConfig = {
  key: string;
  startX: number;
  delay: number;
  duration: number;
  size: number;
  rotateDeg: number;
  swayAmp: number;
  windDrift: number;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const DEFAULT_PETAL = require('../../assets/icons/petal_sakura.webp');

export default function SakuraFall({
  count = 18,
  width = SCREEN_W,
  height = SCREEN_H,
  sizeMin = 16,
  sizeMax = 34,
  baseDuration = 9000,
  wind = 40,
  sway = 28,
  opacity = 1,
  loop = true,
  petalSource = DEFAULT_PETAL,
    tintColor="#FF8FB3",
  boostLayers = 1,     // ⬅ nuevo (1 = sin duplicar)
  style,
}: SakuraFallProps) {
  const petals = useMemo<PetalConfig[]>(() => {
    const arr: PetalConfig[] = [];
    for (let i = 0; i < count; i++) {
      const size = rand(sizeMin, sizeMax);
      arr.push({
        key: `petal-${i}-${Math.random().toString(36).slice(2)}`,
        startX: rand(0, width),
        delay: rand(0, 2000),
        duration: baseDuration * rand(0.85, 1.25),
        size,
        rotateDeg: rand(-30, 30),
        swayAmp: rand(sway * 0.5, sway * 1.2),
        windDrift: rand(wind * 0.6, wind * 1.4) * (Math.random() < 0.5 ? -1 : 1),
      });
    }
    return arr;
  }, [count, width, sizeMin, sizeMax, baseDuration, wind, sway]);

  const animYs = useRef(petals.map(() => new Animated.Value(0))).current;
  const animPhases = useRef(petals.map(() => new Animated.Value(0))).current;
  const animRot = useRef(petals.map(() => new Animated.Value(Math.random()))).current;

  useEffect(() => {
    petals.forEach((p, i) => {
      const yAnim = animYs[i];
      const phaseAnim = animPhases[i];
      const rotAnim = animRot[i];

      const swayLoop = Animated.loop(
        Animated.timing(phaseAnim, {
          toValue: 1,
          duration: Math.max(3000, p.duration * 0.8),
          useNativeDriver: true,
        })
      );

      const rotateLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(rotAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(rotAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ])
      );

      const fallOnce = (withDelay: boolean) =>
        Animated.sequence([
          withDelay ? Animated.delay(p.delay) : Animated.delay(0),
          Animated.timing(yAnim, { toValue: 1, duration: p.duration, useNativeDriver: true }),
        ]);

      let first = true;
      const cycle = () => {
        yAnim.setValue(0);
        phaseAnim.setValue(0);
        rotAnim.setValue(Math.random());
        fallOnce(first).start(() => {
          first = false;
          if (loop) cycle();
        });
      };

      swayLoop.start();
      rotateLoop.start();
      cycle();
    });

    // Animated.loop no expone stop; al desmontar RN limpia los valores
  }, [petals, animYs, animPhases, animRot, loop]);

  const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);
  const layers = Math.max(1, Math.min(5, Math.floor(boostLayers))); // bound 1..5 por seguridad

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {petals.map((p, i) => {
        const translateY = animYs[i].interpolate({
          inputRange: [0, 1],
          outputRange: [-p.size, height + p.size],
        });

        const swayX = animPhases[i].interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [0, 1, 0, -1, 0],
        });

        const translateX = Animated.add(
          new Animated.Value(p.startX - p.size / 2),
          Animated.add(
            Animated.multiply(swayX, new Animated.Value(p.swayAmp)),
            Animated.multiply(animYs[i], new Animated.Value(p.windDrift))
          )
        );

        const rot = animRot[i].interpolate({
          inputRange: [0, 1],
          outputRange: [`${p.rotateDeg - 15}deg`, `${p.rotateDeg + 15}deg`],
        });

        const commonStyle = {
          width: p.size,
          height: p.size * 1.2, // forma almendrada
          opacity,              // ⬅ opacidad global
          tintColor,            // ⬅ tinte opcional
          transform: [{ translateX }, { translateY }, { rotate: rot }],
        } as const;

        // Dibuja el mismo pétalo N veces superpuesto para “solidificar”
        return (
          <React.Fragment key={p.key}>
            {Array.from({ length: layers }).map((_, l) => (
              <AnimatedExpoImage
                key={`${p.key}-layer-${l}`}
                source={petalSource}
                style={[styles.petal, commonStyle]}
                contentFit="contain"
              />
            ))}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const styles = StyleSheet.create({
  petal: {
    position: 'absolute',
  },
});
