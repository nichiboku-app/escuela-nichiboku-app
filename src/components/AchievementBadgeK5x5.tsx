import React from "react";
import Svg, { Circle, Path, Rect, Text as SvgText } from "react-native-svg";

export default function AchievementBadgeK5x5({
  size = 120,
  label = "K · 5×5",
}: { size?: number; label?: string }) {
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      {/* fondo con anillo */}
      <Circle cx="60" cy="60" r="56" fill="#111827" />
      <Circle cx="60" cy="60" r="54" fill="#8B5CF6" />
      <Circle cx="60" cy="60" r="44" fill="#F9FAFB" />

      {/* corona simple */}
      <Path d="M35 38 L45 54 L60 40 L75 54 L85 38 L83 62 L37 62 Z" fill="#F59E0B" stroke="#111827" strokeWidth="2" />

      {/* cinta */}
      <Rect x="26" y="68" width="68" height="16" rx="8" fill="#10B981" />
      <Rect x="26" y="68" width="68" height="16" rx="8" fill="none" stroke="#064E3B" strokeWidth="2" />
      <SvgText
        x="60" y="80" fontSize="12" fontWeight="bold" fill="#ffffff" textAnchor="middle"
      >
        {label}
      </SvgText>

      {/* borde exterior */}
      <Circle cx="60" cy="60" r="54" fill="none" stroke="#111827" strokeWidth="2" />
    </Svg>
  );
}
