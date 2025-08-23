import React, { useEffect } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  packs: string[];
  title?: string;
  onDone: () => void;
  debug?: boolean;
  /** Tiempo máximo de seguridad; si se excede, cerramos y continuamos */
  safetyTimeoutMs?: number;
  /** Función real de carga (opcional). Si no la pasas, se simula. */
  loadFn?: (packs: string[]) => Promise<void>;
};

function nowMs() {
  // RN soporta performance.now(); si no, Date.now()
  // @ts-ignore
  return (globalThis?.performance?.now?.() as number | undefined) ?? Date.now();
}

export default function AudioPreloader({
  visible,
  packs,
  title = 'Cargando audio…',
  onDone,
  debug,
  safetyTimeoutMs = 4000,
  loadFn,
}: Props) {
  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    const t0 = nowMs();
    if (debug) console.log('[AudioPreloader] visible=true, packs=', packs, 't0=', t0);

    const safety = setTimeout(() => {
      if (!cancelled) {
        const t = nowMs() - t0;
        console.log(`[AudioPreloader] ⏱ safety timeout (${safetyTimeoutMs} ms) → onDone() (t=${Math.round(t)}ms)`);
        onDone();
      }
    }, safetyTimeoutMs);

    (async () => {
      try {
        if (loadFn) {
          await loadFn(packs);
        } else {
          // 🔧 Simulación de carga (reemplaza por tu carga real de audios)
          await new Promise((r) => setTimeout(r, 800));
        }
        if (!cancelled) {
          const t = nowMs() - t0;
          if (debug) console.log(`[AudioPreloader] ✔️ carga terminada → onDone() (t=${Math.round(t)}ms)`);
          onDone();
        }
      } catch (e) {
        console.log('[AudioPreloader] ❗ error cargando audios:', e);
        if (!cancelled) onDone();
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(safety);
      if (debug) console.log('[AudioPreloader] cleanup');
    };
  }, [visible, packs, onDone, debug, safetyTimeoutMs, loadFn]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={s.backdrop} pointerEvents="auto">
        <View style={s.card}>
          <ActivityIndicator />
          <Text style={s.title}>{title}</Text>
          <Text style={s.sub}>Esto puede tardar unos segundos…</Text>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#fff',
    minWidth: 240,
    alignItems: 'center',
    gap: 8,
  },
  title: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 12, color: '#666' },
});
