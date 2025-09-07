// src/components/GlowCard.tsx
import React, { useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  glowColor?: string; // ej. "#f7c04a"
};

export default function GlowCard({
  children,
  onPress,
  style,
  disabled,
  glowColor = "#f7c04a",
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current; // 0..1 opacidad del brillo

  const startAnim = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.98,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // necesitamos animar estilos no soportados por el driver nativo
      }),
    ]).start();
  };

  const endAnim = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Tipado seguro con Animated.WithAnimatedObject
  const cardAnimatedStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () => ({
      transform: [{ scale }],
      // Sombra iOS (en Android usamos elevation fija)
      shadowColor: glowColor,
      shadowOpacity: Platform.OS === "ios" ? glow : 0,
      shadowRadius: Platform.OS === "ios" ? glow.interpolate({
        inputRange: [0, 1],
        outputRange: [6, 16],
      }) : 0,
      shadowOffset: Platform.OS === "ios" ? { width: 0, height: 8 } : { width: 0, height: 0 },
      elevation: Platform.OS === "android" ? 4 : 0,
    }),
    [glow, scale, glowColor]
  );

  // Capa de borde/brillo superpuesta con opacidad animada
  const glowBorderStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () => ({
      position: "absolute",
      top: -1,
      right: -1,
      bottom: -1,
      left: -1,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: glowColor,
      opacity: glow, // 👈 aquí animamos opacidad (numérica) -> sin errores TS
      pointerEvents: "none",
    }),
    [glow, glowColor]
  );

  return (
    <Animated.View
      style={[styles.card, cardAnimatedStyle, style]}
      onTouchStart={startAnim}
      onTouchEnd={endAnim}
      onTouchCancel={endAnim}
    >
      {/* Capa de borde "iluminado" */}
      <Animated.View style={glowBorderStyle} />

      {/* Contenido clickeable: el ripple no tapa bordes gracias al wrap */}
      <Pressable
        android_ripple={{ color: "#00000014", borderless: false }}
        onPress={onPress}
        disabled={disabled}
        style={styles.pressableFill}
        accessibilityRole="button"
      >
        <View style={styles.inner}>{children}</View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderColor: "rgba(0,0,0,0.08)", // borde base suave
    overflow: "hidden",
  },
  pressableFill: { flex: 1 },
  inner: { padding: 16 },
});
