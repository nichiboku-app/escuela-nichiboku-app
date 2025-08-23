// src/screens/N5/TemaN5.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import type { RootStackParamList } from '../../../types';
import { loadAudioPacks } from '../../audio/loadAudioPacks';
import AudioPreloader from '../../components/AudioPreloader';

type Nav = NativeStackNavigationProp<RootStackParamList, 'TemaN5'>;

function nowMs() {
  // @ts-ignore
  return (globalThis?.performance?.now?.() as number | undefined) ?? Date.now();
}

export default function TemaN5() {
  const navigation = useNavigation<Nav>();

  // Estado / refs
  const [clickCount, setClickCount] = useState(0);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);

  const navigatingRef = useRef(false);
  const showPreloaderRef = useRef(showPreloader);
  useEffect(() => { showPreloaderRef.current = showPreloader; }, [showPreloader]);

  // Métricas
  const tClickRef = useRef<number | null>(null);
  const tOverlayMountedRef = useRef<number | null>(null);

  useEffect(() => { console.log('[TemaN5] montado'); }, []);

  useEffect(() => {
    if (showPreloader) {
      tOverlayMountedRef.current = nowMs();
      if (tClickRef.current != null) {
        const dt = tOverlayMountedRef.current - tClickRef.current;
        console.log(`[Métrica] ⏱ t_click→overlay = ${Math.round(dt)} ms`);
      }
    }
  }, [showPreloader]);

  const safeNavigate = useCallback(() => {
    try {
      const tNavStart = nowMs();
      if (tClickRef.current != null) {
        const dtClickToNavStart = tNavStart - tClickRef.current;
        console.log(`[Métrica] ⏱ t_click→navigate(start) = ${Math.round(dtClickToNavStart)} ms`);
      }
      console.log('[TemaN5] navegando -> VowelExercises');
      requestAnimationFrame(() => navigation.navigate('VowelExercises'));
    } catch (e) {
      console.log('[TemaN5] error navegando', e);
      Alert.alert('Navegación', 'No se pudo abrir VowelExercises. Revisa el registro en App.tsx.');
    } finally {
      setTimeout(() => {
        navigatingRef.current = false;
        setLoadingBtn(false);
      }, 300);
    }
  }, [navigation]);

  const handlePreloadDone = useCallback(() => {
    const tDone = nowMs();
    if (tOverlayMountedRef.current != null) {
      const dtOverlayToDone = tDone - tOverlayMountedRef.current;
      console.log(`[Métrica] ⏱ t_overlay→done = ${Math.round(dtOverlayToDone)} ms`);
    }
    if (tClickRef.current != null) {
      const dtClickToDone = tDone - tClickRef.current;
      console.log(`[Métrica] ⏱ t_click→done = ${Math.round(dtClickToDone)} ms`);
    }
    console.log('[TemaN5] preload DONE → cerrar overlay y navegar');
    setShowPreloader(false);
    safeNavigate();
  }, [safeNavigate]);

  const go = useCallback(async () => {
    setClickCount((prev) => {
      const next = prev + 1;
      console.log(`[Log] 👆 Click #${next} en "Ejercicios (Vocales)"`);
      return next;
    });

    if (navigatingRef.current) {
      console.log('[TemaN5] bloqueo anti-doble toque');
      return;
    }
    navigatingRef.current = true;
    setLoadingBtn(true);

    tClickRef.current = nowMs();

    setShowPreloader(true);

    // Fallback si el overlay no llega a montarse
    setTimeout(() => {
      if (!showPreloaderRef.current) {
        const dt = nowMs() - (tClickRef.current ?? nowMs());
        console.log(`[Métrica] ⚠️ overlay no visible en 800 ms → navegar directo (t=${Math.round(dt)}ms)`);
        safeNavigate();
      }
    }, 800);
  }, [safeNavigate]);

  return (
    <>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="always"   
        scrollEnabled={!showPreloader}      
        bounces={false}
      >
        <Text style={s.title}>Nivel N5 — Bloque 1 (Vocales)</Text>
        <Text style={s.p}>
          Dividimos el silabario en familias. Esta unidad trabaja las <Text style={s.bold}>vocales</Text> y prepara tu oído con audio.
        </Text>

        <View style={s.ctas}>
          <RectButton
            onPress={go}
            enabled={!loadingBtn}
            rippleColor="rgba(255,255,255,0.2)"
            style={s.btnRed}
          >
            <View style={s.btn}>
              {loadingBtn ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnTxt}>Ejercicios (Vocales)</Text>
              )}
            </View>
          </RectButton>
        </View>

        <Text style={s.meta}>Clics acumulados: {clickCount}</Text>
      </ScrollView>

      {/* Modal "Cargando audio…" */}
      {showPreloader && (
        <AudioPreloader
          visible
          debug
          packs={['vowels']}
          title="Cargando audio…"
          onDone={handlePreloadDone}
          loadFn={(packs) => loadAudioPacks(packs as any, true)}
          safetyTimeoutMs={7000}
        />
      )}
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  p: { fontSize: 16, lineHeight: 22, color: '#333' },
  bold: { fontWeight: '700' },
  ctas: { marginTop: 18 },
  btnRed: { backgroundColor: '#E74C3C', borderRadius: 12, alignSelf: 'center' },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  meta: { textAlign: 'center', marginTop: 12, color: '#666' },
});
