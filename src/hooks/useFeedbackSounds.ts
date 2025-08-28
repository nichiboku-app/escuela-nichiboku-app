// src/hooks/useFeedbackSounds.ts
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useEffect, useRef } from 'react';

export function useFeedbackSounds() {
  const correctRef = useRef<Audio.Sound | null>(null);
  const wrongRef   = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,       // 🔊 suena aunque el iPhone esté en silencio
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      });

      const correct = new Audio.Sound();
      const wrong   = new Audio.Sound();

      // Carga de assets locales
      await correct.loadAsync(require('../../assets/sounds/correct.mp3'));
      await wrong.loadAsync(require('../../assets/sounds/wrong.mp3'));

      if (isMounted) {
        correctRef.current = correct;
        wrongRef.current   = wrong;
      } else {
        await correct.unloadAsync();
        await wrong.unloadAsync();
      }
    })();

    return () => {
      isMounted = false;
      correctRef.current?.unloadAsync();
      wrongRef.current?.unloadAsync();
    };
  }, []);

  const playCorrect = async () => {
    try { await correctRef.current?.replayAsync(); } catch {}
  };
  const playWrong = async () => {
    try { await wrongRef.current?.replayAsync(); } catch {}
  };

  return { playCorrect, playWrong };
}
