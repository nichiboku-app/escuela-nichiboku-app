import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  StyleSheet,
  View
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types'; // Ruta ajustada según donde tengas el archivo

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.replace('Onboarding'); // ✅ Aquí redirigimos correctamente
    });
  }, [fadeAnim, navigation]);

  return (
    <ImageBackground
      source={require('../../assets/images/fondo_japones_tradicional.jpg')}
      style={styles.fondo}
    >
      <View style={styles.container}>
      <Animated.Image
  source={require('../../assets/images/logo_nichiboku.png')} // ✅ asegúrate que exista
  style={[styles.logo, { opacity: fadeAnim }]}
/>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: 'contain',
  },
});
