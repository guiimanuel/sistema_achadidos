import { AppAlert as Alert } from '../services/alerts.js';
import * as React from 'react';
import { Text, View, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useExpoFonts } from '../hooks/useExpoFonts.js';
import { colors } from '../styles/colors.js';
import { entrar } from '../services/auth.js';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import PasswordInput from '../components/PasswordInput.js';
import GoogleAuthButton from '../components/GoogleAuthButton.js';

function LoginScreen({ navigation }) {
  const { fontsLoaded } = useExpoFonts();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  if (!fontsLoaded) {
    return null;
  }

  const signInUser = async () => {
    if (entrando || googleBusy) return;
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Campos vazios', 'Por favor, preencha os campos de e-mail e senha com as informações fornecidas aos servidores.');
      return;
    }

    setEntrando(true);
    try {
      const userCredential = await entrar(email, senha);
      const user = userCredential.user;

      navigation.navigate('Home', {
        uid: user.uid,
        email: user.email
      });

    } catch (error) {
      console.log('Erro de autenticação:', error);
      Alert.alert(error.code === 'auth/email-not-verified' ? 'Verifique seu e-mail' : 'Erro ao entrar', error.code === 'auth/email-not-verified' ? error.message : 'E-mail ou senha inválido.', undefined, { variant: error.code === 'auth/email-not-verified' ? 'success' : 'error' });
    } finally { setEntrando(false); }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      bottomOffset={24}
      keyboardShouldPersistTaps="handled"
    >
      <Image style={styles.image} source={require('../assets/images/caixa.png')} />
      <Text accessibilityRole="header" style={styles.title}>Bem-vindo de volta!</Text>

      <Text style={styles.titlemini}>
        Acesse sua conta para continuar.
      </Text>

      <View style={styles.form}>
        <Text style={styles.titulop}>
          Email
        </Text>

        <TextInput
          placeholder="Digite seu email..."
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

        <PasswordInput
          placeholder="Digite sua senha..."
          autoComplete="current-password"
          accessibilityLabel="Senha"
          style={styles.input}
          value={senha}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setSenha}
          placeholderTextColor={colors.gray_placeholder}
        />

        <TouchableOpacity style={styles.button} onPress={signInUser} disabled={entrando || googleBusy}>
          <Text style={styles.buttonText}>{entrando ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>
        <GoogleAuthButton navigation={navigation} disabled={entrando} onBusyChange={setGoogleBusy} />

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
    </KeyboardAwareScrollView>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white_background,
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  form: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
    textAlign: 'center',
    color: colors.green_dark,
    fontFamily: 'MontserratBold',
    marginBottom: 8,
    maxWidth: 380,
    alignSelf: 'center',
  },
  titlemini: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 32,
    textAlign: 'center',
    color: colors.text_secondary,
    fontFamily: 'MontserratRegular',
    maxWidth: 340,
    alignSelf: 'center',
  },

  titulop: {
    fontSize: 15,
    marginBottom: 4,
    color: '#101010',
    fontFamily: 'MontserratMedium',
  },
  image: {
    width: 250,
    height: 184,
    alignSelf: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.white,
    marginBottom: 12,
    borderRadius: 8,
    borderColor: colors.blue_border,
    borderWidth: 1,
    fontFamily: 'MontserratRegular',
    fontSize: 14,
    lineHeight: 22,
    width: '100%',
    height: 55,
    paddingHorizontal: 16,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  button: {
    backgroundColor: colors.green_primary,
    padding: 12,
    marginBottom: 5,
    marginTop: 30,
    borderRadius: 8,
    width: '100%',
    height: 55,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    textAlign: 'center',
    fontFamily: 'MontserratBold',
    fontSize: 15,
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
