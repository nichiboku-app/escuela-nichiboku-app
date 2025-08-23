import React, { useEffect, useMemo } from 'react';
import { Animated, Dimensions, Easing, ImageSourcePropType, StyleSheet, View } from 'react-native';

type PetalRainProps = {
  count?: number;                 // cuántos pétalos simultáneos
  speedMinMs?: number;            // duración mínima de caída
  speedMaxMs?: number;            // duración máxima de caída
  drift?: number;                 // cuánto se “mueven” en X (px)
  sizeMin?: number;               // tamaño mínimo (px)
  sizeMax?: number;               // tamaño máximo (px)
  source?: ImageSourcePropType;   // imagen del pétalo
  fade?: boolean;                 // que desvanezcan
};

const { width: W, height: H } = Dimensions.get('window');
const defaultPetal = require('../../assets/particles/petal_gold.webp');

export default function PetalRain({
  count = 20,
  speedMinMs = 6000,
  speedMaxMs = 12000,
  drift = 60,
  sizeMin = 28,
  sizeMax = 56,
  source = defaultPetal,
  fade = true,
}: PetalRainProps) {
  // presets aleatorios para cada pétalo (para no recalcular en cada render)
  const petals = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const size = rand(sizeMin, sizeMax);
      const startX = Math.random() * W;
      const xDrift = (Math.random() - 0.5) * 2 * drift; // [-drift, drift]
      const duration = rand(speedMinMs, speedMaxMs);
      const delay = Math.floor(Math.random() * 2000); // arranque desfasado
      const rotateFrom = rand(-25, 25);
      const rotateTo = rotateFrom + rand(120, 360) * (Math.random() > 0.5 ? 1 : -1);
      return { key: `p-${i}`, size, startX, xDrift, duration, delay, rotateFrom, rotateTo };
    });
  }, [count, speedMinMs, speedMaxMs, drift, sizeMin, sizeMax]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {petals.map((p) => (
        <FallingPetal
          key={p.key}
          size={p.size}
          startX={p.startX}
          xDrift={p.xDrift}
          duration={p.duration}
          delay={p.delay}
          rotateFrom={p.rotateFrom}
          rotateTo={p.rotateTo}
          source={source}
          fade={fade}
        />
      ))}
    </View>
  );
}

function FallingPetal({
  size,
  startX,
  xDrift,
  duration,
  delay,
  rotateFrom,
  rotateTo,
  source,
  fade,
}: {
  size: number;
  startX: number;
  xDrift: number;
  duration: number;
  delay: number;
  rotateFrom: number;
  rotateTo: number;
  source: ImageSourcePropType;
  fade: boolean;
}) {
  const progress = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress, duration, delay]);

  // Y: -80 → H + 60
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, H + 60],
  });

  // X: startX → startX + xDrift (curvita sutil)
  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startX, startX + xDrift, startX + xDrift * 0.6],
  });

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [`${rotateFrom}deg`, `${rotateTo}deg`],
  });

  const opacity = fade
    ? progress.interpolate({
        inputRange: [0, 0.05, 0.9, 1],
        outputRange: [0, 1, 1, 0],
      })
    : 1;

  return (
    <Animated.Image
      source={source}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: [{ translateX }, { translateY }, { rotate }],
        opacity: typeof opacity === 'number' ? opacity : (opacity as any),
      }}
      resizeMode="contain"
    />
  );
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
