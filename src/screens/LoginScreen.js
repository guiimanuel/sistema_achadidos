import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { colors } from '../components/colors.js';
import { auth } from '../utils/firebase.js';
import { useExpoFonts } from '../components/expoFonts.js';

function LoginScreen({ navigation }) {
  const { fontsLoaded } = useExpoFonts();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  if (!fontsLoaded) {
    return null;
  }

  const signInUser = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Campos vazios', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Passando apenas dados simples/serializáveis (evita o crash no APK)
      navigation.navigate('Home', {
        uid: user.uid,
        email: user.email
      });

    } catch (error) {
      console.log('Erro de autenticação:', error);
      Alert.alert('Erro ao entrar', 'E-mail ou senha inválidos.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Image style={styles.image} source={require('../assets/images/caixa.png')} />
      <Text style={styles.title}>BEM VINDO!</Text>

      <Text style={styles.titlemini}>
        Faça o seu login com <Text style={styles.titlemini2}>email e senha</Text>
      </Text>

      <Text style={styles.titulop}>
        Email
      </Text>
     
      <TextInput
        placeholder="Email institucional..."
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
    </View>
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

  titulop:  {
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
    backgroundColor: '#fff',
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
    color: '#fff',
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
});