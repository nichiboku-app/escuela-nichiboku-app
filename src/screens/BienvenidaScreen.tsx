import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import React, { useEffect } from 'react';
import {
    Dimensions,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { RootStackParamList } from '../../types'; // Asegúrate que la ruta esté correcta

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Bienvenida'>;

export default function BienvenidaScreen() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const playSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/bienvenida_sound.mp3')
        );
        await sound.playAsync();
      } catch (error) {
        console.warn('Error al reproducir sonido de bienvenida:', error);
      }
    };

    Vibration.vibrate(300);
    playSound();
  }, []);

  const handleEntrar = () => {
    navigation.replace("Home"); // o 'Home' si no estás usando Drawer aún
  };

  return (
    <ImageBackground
      source={require('../../assets/onboarding/bienvenida_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.titulo}>¡Ya eres parte de la familia Nichiboku!</Text>

        <Text style={styles.subtitulo}>
          <Text style={styles.negrita}>Tu viaje al mundo del </Text>
          <Text style={styles.japones}>japonés </Text>
          <Text style={styles.normal}>comienza con un solo clic.</Text>
          <Text style={styles.normal}> ¡Avanza a tu ritmo y </Text>
          <Text style={styles.destacado}>desbloquea nuevas experiencias!</Text>
        </Text>

        <TouchableOpacity style={styles.boton} onPress={handleEntrar}>
          <Text style={styles.botonTexto}>Entra</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width,
    height,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.96)',
    padding: 30,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'NotoSerifJP-Black',
  },
  subtitulo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    fontFamily: 'NotoSerifJP-Regular',
  },
  negrita: {
    color: '#6a4a36',
    fontWeight: 'bold',
  },
  japones: {
    color: '#1f3f77',
    fontWeight: 'bold',
  },
  normal: {
    color: '#444',
  },
  destacado: {
    color: '#3c8c57',
    fontWeight: 'bold',
  },
  boton: {
    backgroundColor: 'black',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#6a0d0d',
    marginBottom: 10,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'NotoSerifJP-Black',
  },
});
