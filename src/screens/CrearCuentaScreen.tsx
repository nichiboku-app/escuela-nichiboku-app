import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { auth, db } from '../config/firebaseConfig'; // Asegúrate de que esté bien

const { width, height } = Dimensions.get('window');

export default function CrearCuentaScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validarCampos = async () => {
    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {
      setErrorMensaje('Correo incorrecto');
      setShowError(true);
      return;
    }

    if (!/^\d{8,}$/.test(telefono)) {
      setErrorMensaje('Teléfono inválido');
      setShowError(true);
      return;
    }

    if (password.length < 6) {
      setErrorMensaje('Contraseña muy corta');
      setShowError(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'usuarios', uid), {
        uid,
        email,
        telefono,
        creado: new Date(),
      });

      Vibration.vibrate(200);
      navigation.replace('Bienvenida');
    } catch (error: any) {
      let msg = 'Ocurrió un error';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Este correo ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Correo inválido';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Contraseña débil';
      }
      setErrorMensaje(msg);
      setShowError(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ImageBackground
          source={require('../../assets/onboarding/crear_cuenta_bg.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.container}>
            <Text style={styles.title}>CREA TU CUENTA</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Correo Email"
                placeholderTextColor="#000"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome name="whatsapp" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                placeholderTextColor="#000"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#000"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={togglePasswordVisibility}>
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

            <TouchableOpacity style={styles.button} onPress={validarCampos}>
              <Text style={styles.buttonText}>Regístrate</Text>
            </TouchableOpacity>
          </View>

          {showError && (
            <View style={styles.modalContainer}>
              <ImageBackground
                source={require('../../assets/onboarding/error_pergamino.png')}
                style={styles.errorModal}
                resizeMode="contain"
              >
                <TouchableOpacity
                  style={styles.closeIconContainer}
                  onPress={() => setShowError(false)}
                />
                <Text style={styles.modalTitle}>Error</Text>
                <Text style={styles.modalMessage}>{errorMensaje}</Text>
              </ImageBackground>
            </View>
          )}
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginTop: height * 0.45,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    fontFamily: 'NotoSerifJP-Black',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fdf7ed',
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 15,
    width: '100%',
    height: 50,
  },
  icon: {
    marginRight: 10,
    color: '#000',
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    fontFamily: 'NotoSerifJP-Regular',
  },
  eyeIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginLeft: 8,
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'NotoSerifJP-Black',
  },
  modalContainer: {
    position: 'absolute',
    top: '25%',
    left: '5%',
    right: '5%',
    alignItems: 'center',
    zIndex: 999,
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  errorModal: {
    width: 320,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#000',
  },
  closeIconContainer: {
    position: 'absolute',
    top: 10,
    right: -5,
    width: 110,
    height: 110,
  },
});
