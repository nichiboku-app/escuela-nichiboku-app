// src/screens/VowelExercisesScreen.tsx
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { audioCache } from '../audio/cache';

type Key = 'a' | 'i' | 'u' | 'e' | 'o';
type SoundsMap = Record<Key, Audio.Sound | null>;

const KEYS: Key[] = ['a', 'i', 'u', 'e', 'o'];

export default function VowelExercisesScreen() {
  const soundsRef = useRef<SoundsMap>({ a: null, i: null, u: null, e: null, o: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: false,
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Verifica que existan URIs en caché
        for (const k of KEYS) {
          const uri = audioCache.get(`vowels:${k}`);
          if (!uri) {
            console.log(`[VowelExercises] ❗ no URI cache for vowels:${k}`);
          }
        }
        setReady(true);
      } catch (e) {
        console.log('[VowelExercises] setAudioMode error', e);
        setReady(true);
      }
    }
    setup();

    return () => {
      // descarga sonidos si estaban cargados
      (async () => {
        for (const k of KEYS) {
          const s = soundsRef.current[k];
          if (s) {
            try { await s.unloadAsync(); } catch {}
            soundsRef.current[k] = null;
          }
        }
      })();
    };
  }, []);

  const play = useCallback(async (k: Key) => {
    try {
      const cached = soundsRef.current[k];
      if (cached) {
        await cached.replayAsync();
        return;
      }

      const uri = audioCache.get(`vowels:${k}`);
      if (!uri) {
        Alert.alert('Audio', `No se encontró el audio en caché para "${k}". Intenta regresar y entrar de nuevo.`);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0 }
      );
      soundsRef.current[k] = sound;
    } catch (e) {
      console.log('[VowelExercises] play error', e);
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={s.content}>
      <Text style={s.title}>Ejercicios de Vocales</Text>
      {!ready && <Text style={s.note}>Preparando audio…</Text>}

      <View style={s.grid}>
        {KEYS.map((k) => (
          <Pressable key={k} onPress={() => play(k)} style={s.card}>
            <Text style={s.kanji}>{k.toUpperCase()}</Text>
            <Text style={s.small}>Tocar para escuchar</Text>
          </Pressable>
        ))}
      </View>

      <Text style={s.help}>
        Si no suena a la primera, vuelve a la pantalla anterior para recargar los audios.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  note: { color: '#666' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  card: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  kanji: { fontSize: 28, fontWeight: '800' },
  small: { fontSize: 12, color: '#666', marginTop: 4 },
  help: { marginTop: 16, color: '#666' },
});
