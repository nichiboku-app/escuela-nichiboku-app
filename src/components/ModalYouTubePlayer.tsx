import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Image,
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';

const BG_PATTERN  = require('../../assets/images/pattern_seigaiha.webp');
const ICON_SAKURA = require('../../assets/icons/n5/ic_sakura_small.webp');

type Props = {
  videoId: string | null;
  onClose: () => void;
};

export default function ModalYouTubePlayer({ videoId, onClose }: Props) {
  const playerRef = useRef<YoutubeIframeRef>(null);

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [isMuted, setIsMuted]       = useState(false);

  const [duration, setDuration] = useState(0);
  const [current, setCurrent]   = useState(0);
  const [trackW, setTrackW]     = useState(1);

  const thumbUri = useMemo(
    () => (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null),
    [videoId]
  );

  useEffect(() => {
    if (videoId) {
      setLoading(true);
      setError(null);
      setShowPlayer(false);
      setIsPlaying(false);
      setIsMuted(false);
      setDuration(0);
      setCurrent(0);
    }
  }, [videoId]);

  const handleReady = useCallback(async () => {
    setLoading(false);
    try {
      const d = await playerRef.current?.getDuration();
      if (typeof d === 'number') setDuration(d);
    } catch {}
  }, []);

  const handleChangeState = useCallback((state: string) => {
    if (state === 'playing') setIsPlaying(true);
    if (state === 'paused' || state === 'ended') setIsPlaying(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setIsPlaying(false);
    setError('No se pudo cargar el reproductor de YouTube. Intenta nuevamente.');
  }, []);

useEffect(() => {
  let id: ReturnType<typeof setInterval> | undefined;

  if (showPlayer && !loading && !error) {
    id = setInterval(async () => {
      try {
        const c = await playerRef.current?.getCurrentTime();
        if (typeof c === 'number') setCurrent(c);
      } catch {}
    }, 500);
  }

  return () => {
    if (id) clearInterval(id);
  };
}, [showPlayer, loading, error]);


  const startPlayback = () => {
    setShowPlayer(true);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying(p => !p);

  // TS-safe: usa mute/unMute si existen; si no, setVolume(0/100)
  const toggleMute = async () => {
    try {
      const api = playerRef.current as unknown as {
        mute?: () => void;
        unMute?: () => void;
        setVolume?: (n: number) => void;
        getVolume?: () => Promise<number>;
      };
      if (isMuted) {
        if (api?.unMute) api.unMute();
        else api?.setVolume?.(100);
        setIsMuted(false);
      } else {
        if (api?.mute) api.mute();
        else api?.setVolume?.(0);
        setIsMuted(true);
      }
    } catch {}
  };

  const onSeekPress = async (evt: GestureResponderEvent) => {
    try {
      const x = evt.nativeEvent.locationX;
      const pct = Math.max(0, Math.min(1, x / Math.max(1, trackW)));
      const to = pct * duration;
      await playerRef.current?.seekTo(to, true);
      setCurrent(to);
    } catch {}
  };

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackW(e.nativeEvent.layout.width || 1);
  };

  const injectedJS = `
    (function(){
      const style = document.createElement('style');
      style.innerHTML = \`
        .ytp-watermark,
        .ytp-youtube-button,
        .ytp-title,
        .ytp-chrome-top,
        .ytp-chrome-top-buttons,
        .ytp-pause-overlay,
        .ytp-gradient-bottom,
        .ytp-gradient-top,
        .ytp-large-play-button { display:none !important; opacity:0 !important; }
      \`;
      document.head.appendChild(style);
    })(); true;
  `;

  const fmt = (s: number) => {
    s = Math.max(0, Math.floor(s));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? '0' : ''}${r}`;
  };

  const progressPct = duration ? (current / duration) * 100 : 0;
  // RN necesita número, no 'calc()'
  const dotLeftPx = Math.max(0, Math.min(trackW, (progressPct / 100) * trackW) - 7);

  return (
    <Modal visible={!!videoId} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <Image source={BG_PATTERN} style={styles.pattern} resizeMode="repeat" />
        <View style={styles.backdropTint} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Image source={ICON_SAKURA} style={styles.sakuraLeft} />
            <Text style={styles.title}>Video</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>Cerrar ✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.playerBox}>
            <View style={styles.playerHolder}>
              {!showPlayer && !error && (
                <Pressable style={styles.thumbWrap} onPress={startPlayback}>
                  {!!thumbUri && (
                    <Image source={{ uri: thumbUri }} style={styles.thumbImage} resizeMode="cover" />
                  )}
                  <View style={styles.thumbOverlay} />
                  <View style={[styles.circleBtn, styles.circleBig, styles.btnAccent]}>
                    <Text style={styles.circleIcon}>▶️</Text>
                  </View>
                </Pressable>
              )}

              {showPlayer && !!videoId && (
                <>
                  {loading && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" />
                      <Text style={styles.loadingText}>Cargando video…</Text>
                    </View>
                  )}

                  <YoutubePlayer
                    ref={playerRef}
                    height={220}
                    play={isPlaying}
                    videoId={videoId}
                    onReady={handleReady}
                    onChangeState={handleChangeState}
                    onError={handleError}
                    webViewStyle={{ backgroundColor: 'transparent' }}
                    initialPlayerParams={{
                      controls: false,
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
                      pointerEvents: 'none', // 👈 bloquea toques del iframe
                    }}
                  />

                  {!loading && !error && (
                    <View style={styles.controls}>
                      <View style={styles.controlsRow}>
                        <Pressable onPress={togglePlay} style={[styles.circleBtn, styles.btnDark]}>
                          <Text style={styles.circleIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
                        </Pressable>

                        <Pressable onPress={toggleMute} style={[styles.circleBtn, styles.btnDark]}>
                          <Text style={styles.circleIcon}>{isMuted ? '🔇' : '🔊'}</Text>
                        </Pressable>

                        <View style={styles.timeBox}>
                          <Text style={styles.timeText}>{fmt(current)}</Text>
                          <Text style={styles.sep}> / </Text>
                          <Text style={styles.timeText}>{fmt(duration)}</Text>
                        </View>
                      </View>

                      <View style={styles.trackWrap} onLayout={onTrackLayout}>
                        <Pressable style={styles.trackTap} onPress={onSeekPress}>
                          <View style={styles.trackBg} />
                          <View style={[styles.trackFg, { width: `${progressPct}%` }]} />
                          <View style={[styles.trackDot, { left: dotLeftPx }]} />
                        </Pressable>
                      </View>
                    </View>
                  )}
                </>
              )}

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => {
                      setError(null);
                      setLoading(true);
                      setShowPlayer(false);
                      setIsPlaying(false);
                    }}
                  >
                    <Text style={styles.retryText}>Reintentar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const R = 16;

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  pattern: { ...StyleSheet.absoluteFillObject, opacity: 0.25 },
  backdropTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },

  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    overflow: 'hidden',
  },

  header: {
    backgroundColor: '#bf171c',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sakuraLeft: { width: 22, height: 22, marginRight: 8, tintColor: '#fff', opacity: 0.9 },
  title: { color: '#fff', fontSize: 16, fontWeight: '800', flex: 1 },
  close: { color: '#fff', fontSize: 14, fontWeight: '800' },

  playerBox: { paddingHorizontal: 16, paddingTop: 14 },
  playerHolder: {
    position: 'relative',
    height: 220,
    borderRadius: R,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },

  thumbWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  thumbImage: { position: 'absolute', width: '100%', height: '100%' },
  thumbOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },

  circleBtn: {
    width: 48, height: 48, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  circleBig: { width: 68, height: 68, borderRadius: 68 },
  btnAccent: { backgroundColor: '#f59e0b' },
  btnDark:   { backgroundColor: 'rgba(0,0,0,0.55)' },
  circleIcon: { fontSize: 22, color: '#fff', fontWeight: '900' },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
  },
  loadingText: { marginTop: 6, color: '#111827', fontWeight: '600' },
  errorBox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
    zIndex: 3,
  },
  errorText: { color: '#111827', textAlign: 'center' },
  retryBtn: {
    backgroundColor: '#bf171c',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#fff', fontWeight: '800' },

  controls: { padding: 10, backgroundColor: 'rgba(0,0,0,0.15)' },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  timeBox: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  timeText: { color: '#fff', fontWeight: '700' },
  sep: { color: '#ddd', marginHorizontal: 4 },

  trackWrap: { paddingHorizontal: 4, paddingBottom: 2 },
  trackTap: { height: 16, justifyContent: 'center' },
  trackBg: {
    position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)',
  },
  trackFg: {
    position: 'absolute', left: 0, height: 4, borderRadius: 4, backgroundColor: '#f59e0b',
  },
  trackDot: {
    position: 'absolute', top: -4, width: 14, height: 14, borderRadius: 14, backgroundColor: '#f59e0b',
  },
});
