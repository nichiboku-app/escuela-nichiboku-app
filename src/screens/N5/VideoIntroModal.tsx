import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoIntroModal'>;

const extractYouTubeId = (input: string) => {
  const m1 = input.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (m1?.[1]) return m1[1];
  const m2 = input.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (m2?.[1]) return m2[1];
  const m3 = input.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (m3?.[1]) return m3[1];
  const m4 = input.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (m4?.[1]) return m4[1];
  return input;
};

export default function VideoIntroModal({ navigation, route }: Props) {
  const playerRef = useRef<YoutubeIframeRef>(null);

  const id = useMemo(
    () => extractYouTubeId(route.params?.videoId ?? 'https://youtu.be/E31rKTOjZdM'),
    [route.params?.videoId]
  );

  // 🔒 Pantalla negra total (status + nav bar)
  useEffect(() => {
    StatusBar.setBackgroundColor?.('#000', true);
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#000').catch(() => {});
      NavigationBar.setButtonStyleAsync('light').catch(() => {});
    }
  }, []);

  const { width, height } = Dimensions.get('window');
  const videoW = width;
  const videoH = Math.min((width * 9) / 16, height); // 16:9, ocupa todo lo posible

  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const onReady = useCallback(() => setLoading(false), []);
  const onChangeState = useCallback((s: string) => {
    if (s === 'ended') setIsPlaying(false);
  }, []);

  const injectedJS = `
    (function(){
      const style = document.createElement('style');
      style.innerHTML = '.ytp-watermark,.ytp-title,.ytp-gradient-bottom,.ytp-gradient-top{display:none!important;opacity:0!important;}';
      document.head.appendChild(style);
    })(); true;
  `;

  return (
    <SafeAreaView style={st.root} edges={['top','bottom']}>
      {/* Cerrar */}
      <Pressable onPress={() => navigation.goBack()} style={st.closeBtn} hitSlop={12}>
        <Ionicons name="close" size={26} color="#fff" />
      </Pressable>

      <View style={st.center}>
        <YoutubePlayer
          ref={playerRef}
          height={videoH}
          width={videoW}
          play={isPlaying}
          videoId={id}
          onReady={onReady}
          onChangeState={onChangeState}
          initialPlayerParams={{ controls: true, rel: false, modestbranding: true, playsinline: true as any }}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
            javaScriptEnabled: true,
            injectedJavaScript: injectedJS,
          }}
          webViewStyle={{ backgroundColor: '#000' }}
          forceAndroidAutoplay
        />

        {loading && (
          <View style={st.loading}>
            <ActivityIndicator size="large" />
            <Text style={st.loadingTxt}>Cargando…</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loading: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  loadingTxt: { marginTop: 8, color: '#fff', fontWeight: '700' },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
});
