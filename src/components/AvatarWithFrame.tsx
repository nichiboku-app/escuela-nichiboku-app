// src/ui/AvatarWithFrame.tsx
import React from 'react';
import { Image, StyleProp, View, ViewStyle } from 'react-native';

const FALLBACK = require('../../assets/images/avatar_formal.webp');
const FRAME    = require('../../assets/images/avatar_frame.webp');

type Props = {
  size?: number;                  // diámetro del AVATAR (no cambia)
  uri?: string | null;            // foto del user
  framePx?: number;               // grosor fijo del marco (px)
  frameShiftX?: number;           // + derecha / - izquierda (ajusta solo el marco)
  frameShiftY?: number;           // + abajo   / - arriba   (ajusta solo el marco)
  style?: StyleProp<ViewStyle>;   // mueve TODO el componente en el layout
};

export default function AvatarWithFrame({
  size = 80,
  uri,
  framePx = 6,
  frameShiftX = -30,
  frameShiftY = -35,
  style,
}: Props) {
  // IMPORTANTE: el marco es 2 * framePx más grande (izq + der, arriba + abajo)
  const frameW = size + framePx * 13;

  return (
    <View style={[{ width: size, height: size }, style]}>
      {/* Avatar exacto */}
      <Image
        source={uri ? { uri } : FALLBACK}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          resizeMode: 'cover',
        }}
      />

      {/* Marco: crece hacia afuera; 'shift' lo mueve finamente */}
      <Image
        source={FRAME}
        style={{
          position: 'absolute',
          left: -framePx + frameShiftX,
          top:  -framePx + frameShiftY,
          width: frameW,
          height: frameW,
          resizeMode: 'contain',
        }}
      />
    </View>
  );
}
