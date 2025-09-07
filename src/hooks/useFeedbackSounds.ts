import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { useEffect, useRef, useState } from "react";

type UseFeedbackSoundsReturn = {
  playCorrect: () => Promise<void>;
  playWrong: () => Promise<void>;
  ready: boolean;
};

export function useFeedbackSounds(): UseFeedbackSoundsReturn {
  const correctRef = useRef<Audio.Sound | null>(null);
  const wrongRef   = useRef<Audio.Sound | null>(null);
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
        const wrong   = new Audio.Sound();

        await correct.loadAsync(require("../../assets/sounds/correct.mp3"), { shouldPlay: false });
        await wrong.loadAsync(require("../../assets/sounds/wrong.mp3"),     { shouldPlay: false });

        if (isMounted) {
          correctRef.current = correct;
          wrongRef.current   = wrong;
          setReady(true);
        } else {
          await correct.unloadAsync();
          await wrong.unloadAsync();
        }
      } catch {
        setReady(true); // aunque falle, no bloqueamos UI
      }
    })();

    return () => {
      isMounted = false;
      correctRef.current?.unloadAsync();
      wrongRef.current?.unloadAsync();
      correctRef.current = null;
      wrongRef.current = null;
    };
  }, []);

  const playWithReset = async (ref: React.MutableRefObject<Audio.Sound | null>) => {
    const s = ref.current;
    if (!s) return;
    try {
      await s.stopAsync().catch(() => {});
      await s.setPositionAsync(0);
      await s.playAsync();
    } catch {
      try { await s.replayAsync(); } catch {}
    }
  };

  const playCorrect = async () => { await playWithReset(correctRef); };
  const playWrong   = async () => { await playWithReset(wrongRef); };

  return { playCorrect, playWrong, ready };
}
