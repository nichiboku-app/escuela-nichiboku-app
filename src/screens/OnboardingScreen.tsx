import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  { key: 'slide1', image: require('../../assets/onboarding/1_inicio.png') },
  { key: 'slide2', image: require('../../assets/onboarding/_aprende.png') },
  { key: 'slide3', image: require('../../assets/onboarding/_explora.png') },
  { key: 'slide4', image: require('../../assets/onboarding/_progreso.png') },
];

export default function OnboardingScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(slide);
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/onboarding/fondo_japones_tradicional.png')}
      style={styles.background}
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        ref={scrollRef}
        style={styles.scroll}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={styles.slide}>
            <Image
              source={slide.image}
              style={styles.image}
              resizeMode="contain" // ✅ Esto evita distorsión
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === activeIndex ? '#d32f2f' : '#ccc' },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {activeIndex === slides.length - 1 ? '¡Comenzar!' : 'Siguiente'}
          </Text>
        </TouchableOpacity>

        {activeIndex === slides.length - 1 && (
        <TouchableOpacity
  style={styles.botonLogin}
  onPress={() => navigation.navigate('Login' as never)}
>
  <Text style={styles.textoBotonLogin}>¿Ya tienes cuenta? Inicia sesión</Text>
</TouchableOpacity>

        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.9,
    height: height * 0.75,
  },
  controls: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: '#b71c1c',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  link: {
    color: '#b71c1c',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 8,
  },
linkGrande: {
  color: '#FFD700', // dorado
  fontSize: 15,
  fontWeight: 'bold',
  textDecorationLine: 'underline',
  marginTop: 10,
  textShadowColor: 'rgba(0, 0, 0, 0.4)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 1,
},
botonLogin: {
  backgroundColor: '#000',
  paddingVertical: 10,
  paddingHorizontal: 30,
  borderRadius: 25,
  marginTop: 10,
},

textoBotonLogin: {
  color: '#FFFFFF', 
  fontSize: 14,
  fontWeight: 'bold',
  textAlign: 'center',
  textDecorationLine: 'underline',
},


});
