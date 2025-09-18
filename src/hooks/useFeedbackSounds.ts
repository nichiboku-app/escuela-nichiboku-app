// src/hooks/useFeedbackSounds.ts
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";

type UseFeedbackSoundsReturn = {
  playCorrect: () => Promise<void>;
  playWrong: () => Promise<void>;
  ready: boolean;
};

export function useFeedbackSounds(): UseFeedbackSoundsReturn {
  const correctRef = useRef<Audio.Sound | null>(null);
  const wrongRef = useRef<Audio.Sound | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        });

        const correct = new Audio.Sound();
        const wrong = new Audio.Sound();

        // Rutas desde src/hooks → ../../assets/...
        await correct.loadAsync(require("../../assets/sounds/correct.mp3"), {
          shouldPlay: false,
        });
        await wrong.loadAsync(require("../../assets/sounds/wrong.mp3"), {
          shouldPlay: false,
        });

        if (isMounted) {
          correctRef.current = correct;
          wrongRef.current = wrong;
          setReady(true);
        } else {
          await correct.unloadAsync();
          await wrong.unloadAsync();
        }
      } catch (e) {
        console.warn("useFeedbackSounds preload error:", e);
      }
    })();

    return () => {
      isMounted = false;
      (async () => {
        try {
          await correctRef.current?.unloadAsync();
          await wrongRef.current?.unloadAsync();
        } catch {}
        correctRef.current = null;
        wrongRef.current = null;
      })();
    };
  }, []);

  const playCorrect = useCallback(async () => {
    try {
      const s = correctRef.current;
      if (!s) return;
      const st = await s.getStatusAsync();
      if ("isLoaded" in st && st.isLoaded && "isPlaying" in st && st.isPlaying) {
        await s.stopAsync();
      }
      await s.setPositionAsync(0);
      await s.playAsync();
    } catch (e) {
      console.warn("playCorrect error:", e);
    }
  }, []);

  const playWrong = useCallback(async () => {
    try {
      const s = wrongRef.current;
      if (!s) return;
      const st = await s.getStatusAsync();
      if ("isLoaded" in st && st.isLoaded && "isPlaying" in st && st.isPlaying) {
        await s.stopAsync();
      }
      await s.setPositionAsync(0);
      await s.playAsync();
    } catch (e) {
      console.warn("playWrong error:", e);
    }
  }, []);

  return { playCorrect, playWrong, ready };
}
