import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { entrarComTokenGoogle } from './auth.js';
import { entrarGoogleWeb, prepararGoogleWeb } from './googleWeb';
export { prepararGoogleWeb };

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '301093505148-3lkiubvtgon6h1e4jt59gck1uh8h2jgk.apps.googleusercontent.com';
let nativeGoogle;
let emAndamento = false;

function acessoInterrompido() {
  const error = new Error('O Google não concluiu o acesso. Se você escolheu uma conta e voltou para esta tela sem cancelar, informe o suporte para verificar o acesso Google desta versão do aplicativo.');
  error.code = 'google/sign-in-incomplete';
  return error;
}

export async function entrarComGoogle({ cadastro = false } = {}) {
  if (emAndamento) return null;
  emAndamento = true;
  try {
    if (Platform.OS === 'web') {
      return await entrarGoogleWeb(WEB_CLIENT_ID, { cadastro });
    }
    if (Constants.executionEnvironment === 'storeClient') {
      throw new Error('O acesso com Google precisa de uma versão própria do aplicativo. No Expo Go, utilize e-mail e senha.');
    }
    if (!nativeGoogle) {
      try {
        nativeGoogle = require('react-native-nitro-google-signin').GoogleOneTapSignIn;
        nativeGoogle.configure({ webClientId: WEB_CLIENT_ID });
      } catch {
        nativeGoogle = null;
        throw new Error('Atualize a versão instalada do aplicativo para usar o acesso com Google.');
      }
    }
    await nativeGoogle.checkPlayServices();
    // O seletor explícito permite escolher outra conta também após sair do Firebase.
    const response = await nativeGoogle.presentExplicitSignIn();
    // No Android, uma configuração OAuth inválida também pode retornar cancelled.
    if (response?.type === 'cancelled') throw acessoInterrompido();
    if (response.type !== 'success' || !response.data?.idToken) {
      throw new Error('Não foi possível obter a conta Google. Tente novamente.');
    }
    return await entrarComTokenGoogle(response.data.idToken, { email: response.data.user?.email, cadastro });
  } catch (error) {
    if (error.code === 'SIGN_IN_CANCELLED') throw acessoInterrompido();
    if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(error.code)) return null;
    throw error;
  } finally { emAndamento = false; }
}

export function mensagemErroGoogle(error) {
  if (error.code === 'auth/account-exists-with-different-credential') {
    return 'Este e-mail já possui uma conta com outra forma de acesso. Entre usando e-mail e senha.';
  }
  if (['DEVELOPER_ERROR', 'auth/operation-not-allowed', 'auth/unauthorized-domain', 'auth/invalid-credential'].includes(error.code)) {
    return 'O acesso com Google não está configurado para esta versão do aplicativo. Utilize e-mail e senha e informe o suporte.';
  }
  if (['auth/network-request-failed', 'PLAY_SERVICES_NOT_AVAILABLE'].includes(error.code)) {
    return 'Verifique sua conexão e se o Google Play Services está atualizado.';
  }
  return error.message || 'Não foi possível entrar com Google. Tente novamente.';
}
