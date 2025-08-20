import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { auth } from '../config/firebaseConfig';


const { width } = Dimensions.get('window');

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  CrearCuenta: undefined;
  Bienvenida: undefined;
  Home: undefined;
};

type LoginScreenNav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen(): React.JSX.Element {

  const navigation = useNavigation<LoginScreenNav>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const uid = auth.currentUser?.uid;

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const showError = (mensaje: string) => {
    Vibration.vibrate(200);
    setErrorMessage(mensaje);
    setShowErrorModal(true);
    setTimeout(() => setShowErrorModal(false), 3000);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Por favor llena todos los campos.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Bienvenida');
    } catch (err) {
      const error = err as FirebaseError & { code?: string };
      let mensaje = 'Ocurrió un error. Intenta de nuevo.';
      switch (error.code) {
        case 'auth/invalid-email':
          mensaje = 'Correo inválido.'; break;
        case 'auth/user-not-found':
          mensaje = 'Usuario no encontrado.'; break;
        case 'auth/wrong-password':
          mensaje = 'Contraseña incorrecta.'; break;
        case 'auth/too-many-requests':
          mensaje = 'Demasiados intentos. Intenta más tarde.'; break;
        default:
          mensaje = 'No pudimos iniciar sesión. Revisa tus datos.';
      }
      showError(mensaje);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/onboarding/login_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, width: '100%' }}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Text style={styles.title}>INICIA SESIÓN</Text>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Image source={require('../../assets/icons/email.png')} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Correo Email"
                placeholderTextColor="#000"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />
            </View>

            {/* Contraseña */}
            <View style={styles.inputContainer}>
              <Image source={require('../../assets/icons/password.png')} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#000"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} accessibilityRole="button">
                <Image
                  source={
                    showPassword
                      ? require('../../assets/icons/eye_closed.png')
                      : require('../../assets/icons/eye_open.png')
                  }
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('CrearCuenta')}>
              <Text style={styles.registerLink}>¿No tienes cuenta? Regístrate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de error */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image source={require('../../assets/icons/alerta.png')} style={{ width: 60, height: 60, marginBottom: 10 }} />
            <Text style={styles.modalText}>{errorMessage}</Text>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 60,
  },
  container: { width: width * 0.9, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, color: '#000' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf6ec',
    borderRadius: 30,
    borderColor: '#000',
    borderWidth: 2,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '100%',
    height: 50,
  },
  icon: { width: 22, height: 22, marginRight: 10, resizeMode: 'contain' },
  input: { flex: 1, fontSize: 16, color: '#000' },
  eyeIcon: { width: 22, height: 22, marginLeft: 8, resizeMode: 'contain' },
  button: {
    backgroundColor: '#1a0000',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  buttonText: { color: '#fff', fontSize: 16 },
  registerLink: { marginTop: 20, color: '#000', fontSize: 14, textDecorationLine: 'underline' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: '#fff5f5',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderColor: '#ff4d4d',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: { color: '#b00020', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});
