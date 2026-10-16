import { AppAlert as Alert } from '../services/alerts.js';
import * as React from "react";
import { Text, TextInput, TouchableOpacity, StyleSheet, View} from "react-native";
import { useState } from "react";
import { colors } from '../styles/colors.js';
import { criarConta, concluirCadastro, emailDiscente } from "../services/auth.js";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import PasswordInput from '../components/PasswordInput.js';
import GoogleAuthButton from '../components/GoogleAuthButton.js';

const mensagensErroCadastro = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado. Entre com sua conta ou utilize a opção de recuperar senha na tela de login.',
  'auth/invalid-email': 'O e-mail informado é inválido. Confira o endereço e tente novamente.',
  'auth/weak-password': 'A senha é muito fraca. Utilize pelo menos 6 caracteres.',
  'auth/password-does-not-meet-requirements': 'A senha não atende aos requisitos de segurança. Escolha uma senha mais forte.',
  'auth/network-request-failed': 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.',
  'auth/too-many-requests': 'Foram realizadas muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/operation-not-allowed': 'O cadastro com e-mail e senha está indisponível. Entre em contato com o suporte.',
};

function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [cadastrando, setCadastrando] = useState(false);
  const [usuarioPendente, setUsuarioPendente] = useState(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  const registerUser = async () => {
    if (cadastrando || googleBusy) return;
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    if (!nomeLimpo) {
      Alert.alert('Aviso', 'Informe seu nome para se cadastrar');
      return;
    }
    if (!emailDiscente(emailLimpo)) {
      Alert.alert('Aviso', 'O cadastro é exclusivo para e-mails discentes. Outras contas são cadastradas pela administração.');
      return;
    }
    if (!usuarioPendente && (!senha || !confirmarSenha)) {
      Alert.alert('Aviso', 'Preencha a senha e a confirmação da senha.');
      return;
    }
    if (!usuarioPendente && senha !== confirmarSenha) {
      Alert.alert('Aviso', 'As senhas não coincidem. Confira a confirmação da senha.');
      return;
    }
    setCadastrando(true);
    try {
      if (usuarioPendente) {
        await concluirCadastro(usuarioPendente, nomeLimpo);
      } else {
        await criarConta(emailLimpo, senha, nomeLimpo);
      }
      Alert.alert('Verifique seu e-mail', 'Enviamos um link de confirmação. Abra o link antes de entrar no aplicativo. Confira também a pasta de spam.', undefined, { variant: 'success' });
      navigation.navigate('Login');
    } catch (error) {
      console.log(error.code, error.message);
      if (error.usuarioCriado || usuarioPendente) {
        setUsuarioPendente(error.usuarioCriado || usuarioPendente);
        Alert.alert('Aviso', 'Sua conta foi criada, mas não foi possível concluir o perfil ou enviar a verificação. Toque em Concluir cadastro para tentar novamente.', undefined, { variant: 'error' });
      } else {
        Alert.alert('Erro ao cadastrar', mensagensErroCadastro[error.code] || 'Não foi possível concluir o cadastro. Tente novamente mais tarde. Se o problema persistir, entre em contato com o suporte.', undefined, { variant: 'error' });
      }
    } finally {
      setCadastrando(false);
    }
  };
  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      bottomOffset={24}
      keyboardShouldPersistTaps="handled"
    >
      <Text accessibilityRole="header" style={styles.title}>Crie sua conta</Text>
      <Text style={styles.title1}>Use seu e-mail discente para se cadastrar com Google ou preencher os dados abaixo.</Text>
      <GoogleAuthButton navigation={navigation} cadastro disabled={cadastrando || Boolean(usuarioPendente)} onBusyChange={setGoogleBusy} />

    <View style={styles.form}>
      <Text style={styles.titulop}>Nome completo</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite seu nome completo..."
        placeholderTextColor={colors.gray_placeholder}
        autoCapitalize="words"
        autoComplete="name"
        accessibilityLabel="Nome"
        editable={!cadastrando}
      />

      <Text style={styles.titulop}>
        Email
      </Text>
      <Text style={styles.title3}>*Apenas email institucional</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!cadastrando && !usuarioPendente}
        placeholder="Digite seu email..."
        placeholderTextColor={colors.gray_placeholder}
      />
      <Text style={styles.titulop}>
        Senha
      </Text>

      <PasswordInput
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="Digite sua senha..."
        placeholderTextColor={colors.gray_placeholder}
        autoComplete="new-password"
        accessibilityLabel="Senha"
        editable={!cadastrando && !usuarioPendente}
      />

      <Text style={styles.titulop}>Confirmar senha</Text>
      <PasswordInput
        style={styles.input}
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        placeholder="Confirme sua senha..."
        placeholderTextColor={colors.gray_placeholder}
        autoComplete="new-password"
        accessibilityLabel="Confirmar senha"
        editable={!cadastrando && !usuarioPendente}
      />

      <TouchableOpacity
        style={[styles.button, cadastrando && styles.buttonDisabled]}
        onPress={registerUser}
        disabled={cadastrando || googleBusy}
      >
        <Text style={styles.buttonText}>
          {cadastrando ? 'Salvando...' : usuarioPendente ? 'Concluir cadastro' : 'Cadastrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity disabled={cadastrando} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.link}>Voltar para o mural</Text>
        </TouchableOpacity>
    </View>
    </KeyboardAwareScrollView>
  );
}
export default CadastroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white_background,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  form: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    color: colors.green_dark,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 8,
    fontFamily: 'MontserratBold',
    maxWidth: 380,
    alignSelf: 'center',
  },
  title1: {
    textAlign: 'center',
    color: colors.text_secondary,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: 'MontserratRegular',
    marginBottom: 24,
    maxWidth: 340,
    alignSelf: 'center',
  },
  title3: {
    justifyContent: 'center',
    color: colors.gray_placeholder,
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.white,
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: colors.blue_border,
    borderWidth: 1,
    height: 55,
    width: '100%',
    fontFamily: 'MontserratRegular',
    fontSize: 14,
    includeFontPadding: false,
  },

  titulop: {
    fontSize: 15,
    marginBottom: 2,
    color: '#101010',
    fontFamily: 'MontserratMedium',
  },

  button: {
    backgroundColor: colors.green_primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 1,
    marginTop: 30,
    borderRadius: 8,
    height: 55,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    fontFamily: 'MontserratBold',
    fontSize: 15,
  },
  link: {
    textAlign: 'center',
    marginTop: 10,
    color: colors.green_primary,
    fontFamily: 'MontserratMedium',
    fontSize: 14,
  }
});
