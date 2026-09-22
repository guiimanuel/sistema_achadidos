import * as React from 'react';
import { Text, View, Image, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useState } from 'react';
import { useExpoFonts } from '../components/expoFonts.js';
import { colors } from '../styles/colors.js';
import { entrar } from '../services/auth.js';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

function LoginScreen({ navigation }) {
  const { fontsLoaded } = useExpoFonts();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  if (!fontsLoaded) {
    return null;
  }

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const signInUser = async () => {
    if (!email.trim() || !senha.trim()) {
      showAlert('Campos vazios', 'Por favor, preencha os campos de e-mail e senha com as informações fornecidas aos servidores.');
      return;
    }

    try {
      const userCredential = await entrar(email, senha);
      const user = userCredential.user;

      navigation.navigate('Home', {
        uid: user.uid,
        email: user.email
      });

    } catch (error) {
      console.log('Erro de autenticação:', error);
      showAlert('Erro ao Logar', 'E-mail ou senha inválido. ATENÇÂO: Login permitido apenas para Servidores.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Image style={styles.image} source={require('../assets/images/caixa.png')} />
      <Text style={styles.title}>BEM VINDO!</Text>

      <Text style={styles.titlemini}>
        Faça o seu login com <Text style={styles.titlemini2}>email e senha</Text>
      </Text>

      <Text style={styles.titulop}>
        Email
      </Text>

      <TextInput
        placeholder="Email de Servidor..."
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor={colors.gray_placeholder}
      />

      <Text style={styles.titulop}>
        Senha
      </Text>

      <TextInput
        placeholder="Senha..."
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholderTextColor={colors.gray_placeholder}
      />

      <TouchableOpacity style={styles.button} onPress={signInUser}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.link}>
          Ainda não tem conta? <Text style={styles.link2}>Cadastre-se</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('AlterarSenha')}>
        <Text style={styles.link}>
          Esqueceu a senha? <Text style={styles.link2}>Alterar</Text>
        </Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={alertVisible}
        animationType="fade"
        onRequestClose={() => setAlertVisible(false)}
      >
        <View style={styles.alertContainer}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>{alertTitle}</Text>

            <Text style={styles.alertMessage}>{alertMessage}</Text>

            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => setAlertVisible(false)}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white_background,
    flex: 1,
    justifyContent: 'center',
    padding: 56,
    position: 'relative',
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.green_primary,
    fontFamily: 'MontserratBold',
  },
  titlemini: {
    fontSize: 18,
    marginBottom: 65,
    textAlign: 'center',
    color: colors.green_primary,
    fontFamily: 'MontserratMedium',
  },

  titulop: {
    fontSize: 15,
    marginBottom: 6,
    color: '#101010',
    fontFamily: 'MontserratMedium',
  },

  titlemini2: {
    fontSize: 17,
    marginBottom: 100,
    textAlign: 'center',
    color: colors.green_primary,
  },
  image: {
    width: 250,
    height: 184,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: colors.white,
    padding: 15,
    marginBottom: 18,
    borderRadius: 8,
    borderColor: colors.blue_border,
    borderWidth: 1,
    fontFamily: 'MontserratRegular',
  },
  button: {
    backgroundColor: colors.green_primary,
    padding: 12,
    marginBottom: 11,
    marginTop: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    textAlign: 'center',
    fontFamily: 'MontserratBold',
  },
  link: {
    textAlign: 'left',
    fontFamily: 'MontserratMedium',
  },
  link2: {
    textAlign: 'left',
    color: colors.green_primary,
    fontSize: 15,
    fontFamily: 'MontserratBold',
  },

  alertContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  alertBox: {
    width: '80%',
    backgroundColor: '#d20000',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },

  alertTitle: {
    fontSize: 20,
    color: colors.white,
    fontFamily: 'MontserratBold',
    marginBottom: 12,
    textAlign: 'center',
  },

  alertMessage: {
    fontSize: 15,
    color: colors.white,
    fontFamily: 'MontserratMedium',
    textAlign: 'center',
    marginBottom: 20,
  },

  alertButton: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },

  alertButtonText: {
    color: '#da0000',
    fontFamily: 'MontserratBold',
    fontSize: 15,
  },
});