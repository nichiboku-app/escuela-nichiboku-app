import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';

// ⚠️ Si quieres el patrón y la cabecera del modal, puedes traer tus imágenes aquí.
// En fullscreen lo dejo limpio para evitar recortes.

type Props = {
  videoId: string | null;
  onClose: () => void;
};

export default function ModalYouTubePlayerFullscreen({ videoId, onClose }: Props) {
  const playerRef = useRef<YoutubeIframeRef>(null);

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Medidas para 16:9 centrado
  const { width, height } = Dimensions.get('window');
  const videoW = width;
  const videoH = Math.min((width * 9) / 16, height * 0.8); // 80% de alto máx, centrado

  useEffect(() => {
    if (!videoId) return;
    setLoading(true);
    setError(null);
    setIsPlaying(true);
  }, [videoId]);

  const onReady = useCallback(() => setLoading(false), []);
  const onChangeState = useCallback((s: string) => {
    if (s === 'ended') setIsPlaying(false);
  }, []);
  const onError = useCallback(() => {
    setLoading(false);
    setError('No se pudo cargar el video. Intenta nuevamente.');
  }, []);

  // Oculta overlays de YouTube para look limpio
  const injectedJS = useMemo(
    () => `
      (function(){
        const style = document.createElement('style');
        style.innerHTML = \`
          .ytp-watermark,.ytp-youtube-button,.ytp-title,.ytp-pause-overlay,
          .ytp-gradient-bottom,.ytp-gradient-top,.ytp-large-play-button {
            display:none !important; opacity:0 !important;
          }
        \`;
        document.head.appendChild(style);
      })(); true;
    `,
    []
  );

  return (
    <Modal
      visible={!!videoId}
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      animationType="fade"
      // 🔴 Fullscreen real sin “sheet” ni transparencia
      transparent={false}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <SafeAreaView style={st.root}>
        {/* Botón Cerrar flotante */}
        <Pressable onPress={onClose} style={st.closeBtn} hitSlop={12}>
          <Text style={st.closeTxt}>✕</Text>
        </Pressable>

        <View style={st.center}>
          <View style={[st.playerBox, { width: videoW, height: videoH }]}>
            <YoutubePlayer
              ref={playerRef}
              height={videoH}
              width={videoW}
              play={isPlaying}
              videoId={videoId ?? undefined}
              onReady={onReady}
              onChangeState={onChangeState}
              onError={onError}
              initialPlayerParams={{
                controls: true,
                modestbranding: true,
                rel: false,
                // @ts-ignore
                playsinline: 1,
              }}
              webViewProps={{
                javaScriptEnabled: true,
                allowsInlineMediaPlayback: true,
                mediaPlaybackRequiresUserAction: false,
                injectedJavaScript: injectedJS,
              }}
              webViewStyle={{ backgroundColor: 'black' }}
              forceAndroidAutoplay
            />

            {loading && !error && (
              <View style={st.loading}>
                <ActivityIndicator size="large" />
                <Text style={st.loadingTxt}>Cargando…</Text>
              </View>
            )}

            {error && (
              <View style={st.errorBox}>
                <Text style={st.errorTxt}>{error}</Text>
                <Pressable style={st.retry} onPress={() => { setError(null); setLoading(true); setIsPlaying(true); }}>
                  <Text style={st.retryTxt}>Reintentar</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  playerBox: { backgroundColor: '#000' },

  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 12,
    zIndex: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: { color: '#fff', fontSize: 20, fontWeight: '800' },

  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  loadingTxt: { marginTop: 8, color: '#fff', fontWeight: '700' },

  errorBox: {
    ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', padding: 16,
  },
  errorTxt: { color: '#fff', marginBottom: 10, textAlign: 'center' },
  retry: { backgroundColor: '#bf171c', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  retryTxt: { color: '#fff', fontWeight: '800' },
});
