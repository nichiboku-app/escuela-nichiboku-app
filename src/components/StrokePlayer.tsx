import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { G, Line, Path } from "react-native-svg";
import type { KanaData, KanaStroke } from "../strokes";

type Props = {
  data: KanaData;
  speedMs?: number;     // tiempo por trazo
  paused?: boolean;
  brushOverride?: number; // para cambiar el grosor
  showGuide?: boolean;  // líneas guía/cuadrícula
  onChangeStep?: (n: number) => void;
};

function AnimatedStroke({
  d,
  strokeWidth = 6,
  playing
}: {
  d: string;
  strokeWidth?: number;
  playing: boolean;
}) {
  // truco simple: 'revelar' el trazo con segmentos acumulados
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (playing) setVisible(true);
    else setVisible(false);
  }, [playing]);

  return (
    <Path
      d={d}
      stroke="black"
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={visible ? 1 : 0}
    />
  );
}

export default function StrokePlayer({
  data,
  speedMs = 1100,
  paused = false,
  brushOverride,
  showGuide = false,
  onChangeStep
}: Props) {
  const [step, setStep] = useState(0);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const next = () => setStep((s) => Math.min(s + 1, data.strokes.length));
  const reset = () => setStep(0);

  useEffect(() => {
    if (paused) {
      if (timer.current) clearTimeout(timer.current);
      return;
    }
    if (step < data.strokes.length) {
      timer.current = setTimeout(next, speedMs);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [step, paused, data, speedMs]);

  useEffect(() => {
    onChangeStep?.(step);
  }, [step]);

  const viewBox = data.viewBox || "0 0 100 100";
  const shown = useMemo<KanaStroke[]>(
    () => data.strokes.slice(0, step),
    [data, step]
  );

  return (
    <View>
      <Svg width="100%" height={260} viewBox={viewBox}>
        {showGuide && (
          <G opacity={0.2}>
            <Line x1="0" y1="50" x2="100" y2="50" stroke="gray" strokeWidth="0.8" />
            <Line x1="50" y1="0" x2="50" y2="100" stroke="gray" strokeWidth="0.8" />
            <RectFrame />
          </G>
        )}
        {shown.map((s, i) => (
          <AnimatedStroke
            key={s.id ?? i}
            d={s.path}
            strokeWidth={brushOverride ?? s.width ?? 6}
            playing
          />
        ))}
      </Svg>

      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={reset}>
          <Text style={styles.btnTxt}>Reiniciar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function RectFrame() {
  return (
    <>
      <Line x1="2" y1="2" x2="98" y2="2" stroke="gray" strokeWidth="0.8" />
      <Line x1="98" y1="2" x2="98" y2="98" stroke="gray" strokeWidth="0.8" />
      <Line x1="98" y1="98" x2="2" y2="98" stroke="gray" strokeWidth="0.8" />
      <Line x1="2" y1="98" x2="2" y2="2" stroke="gray" strokeWidth="0.8" />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, justifyContent: "center", marginTop: 8 },
  btn: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  btnTxt: { color: "#fff", fontWeight: "600" }
});
