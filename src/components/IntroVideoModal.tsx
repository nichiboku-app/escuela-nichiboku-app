// src/components/IntroVideoModal.tsx
import { AVPlaybackStatusSuccess, Audio, ResizeMode, Video } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const DRAGON = require('../../assets/ui/dragon_frame_red.png');

type Props = {
  visible: boolean;
  sourceUrl: string | null;
  onClose: () => void;
  onDontShowAgain?: () => void;
};

export default function IntroVideoModal({ visible, sourceUrl, onClose, onDontShowAgain }: Props) {
  const videoRef = useRef<Video | null>(null);
  const [ready, setReady] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  // Permite audio en modo silencio iOS mientras el modal esté visible (sin usar enums que cambian entre versiones)
  useEffect(() => {
    const setMode = async (on: boolean) => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: on,     // 👈 clave para que suene con el switch silencioso
          shouldDuckAndroid: true,      // reduce otras apps en Android
          playThroughEarpieceAndroid: false,
          // ❌ sin interruptionModeIOS/Android para evitar TS errors entre versiones
        });
      } catch {}
    };
    setMode(visible);
    return () => { setMode(false); };
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setReady(false);
      fade.setValue(0);
    }
  }, [visible]);

  const handleReady = async () => {
    setReady(true);
    // Asegura volumen normal al iniciar
    try {
      await videoRef.current?.setStatusAsync({ isMuted: false, volume: 1.0, shouldPlay: true });
    } catch {}
    Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  };

  const onPlaybackUpdate = (status: any) => {
    const s = status as AVPlaybackStatusSuccess;
    if (!s.isLoaded) return;
    // sin loop; el usuario cierra manualmente
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity: fade }]}>
          <View style={styles.videoWrap}>
            {!sourceUrl && (
              <View style={styles.loader}>
                <ActivityIndicator />
                <Text style={styles.loaderText}>Cargando…</Text>
              </View>
            )}

            {sourceUrl && (
              <Video
                ref={videoRef}
                source={{ uri: sourceUrl }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping={false}
                isMuted={false}
                useNativeControls={false}
                // 👇 nada de playsInSilentModeIOS aquí; lo manejamos con Audio.setAudioModeAsync
                onReadyForDisplay={handleReady}
                onPlaybackStatusUpdate={onPlaybackUpdate}
              />
            )}

            {/* Marco dragón rojo encima, sin interceptar toques */}
            <View pointerEvents="none" style={styles.frame}>
              <Image source={DRAGON} style={styles.frameImg} resizeMode="stretch" />
            </View>
          </View>

          {/* Controles */}
          <View style={styles.row}>
            <Pressable style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]} onPress={onClose}>
              <Text style={styles.btnTxt}>Cerrar</Text>
            </Pressable>

            {onDontShowAgain && (
              <Pressable
                style={({ pressed }) => [styles.btnGhost, pressed && { opacity: 0.85 }]}
                onPress={onDontShowAgain}
              >
                <Text style={styles.btnGhostTxt}>No volver a mostrar</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    backgroundColor: '#0b0b0d',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4b0a0a',
    padding: 12,
  },
  videoWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#7a0c0c',
  },
  video: { width: '100%', height: '100%' },
  frame: { position: 'absolute', left: -2, top: -2, right: -2, bottom: -2 },
  frameImg: { width: '100%', height: '100%' },
  row: { marginTop: 12, flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  btn: {
    backgroundColor: '#B3001B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#000',
    flexGrow: 1,
    alignItems: 'center',
  },
  btnTxt: { color: '#fff', fontWeight: '900' },
  btnGhost: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#B3001B',
    flexGrow: 1,
    alignItems: 'center',
  },
  btnGhostTxt: { color: '#fff', fontWeight: '800' },
  loader: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  loaderText: { color: '#e5e7eb', marginTop: 6 },
});
