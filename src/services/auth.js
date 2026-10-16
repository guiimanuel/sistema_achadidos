import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase.js";
import { preservarNomeCadastro } from './perfil.js';

export function observarAutenticacao(callback) {
  return onAuthStateChanged(auth, callback);
}

export function usuarioAtual() {
  return auth.currentUser;
}

export function emailDiscente(email) {
  return /^[^\s@]+@discente\.ifpe\.edu\.br$/i.test(String(email || '').trim());
}

const ERRO_CADASTRO = 'O cadastro pelo aplicativo é exclusivo para e-mails @discente.ifpe.edu.br. Outras contas devem ser cadastradas pela administração no Firebase.';

export async function validarSessaoGoogle(credential) {
  // A confiança vem do Firebase após validar a credencial Google, nunca de dados do formulário.
  if (!credential.user.emailVerified) {
    await signOut(auth);
    throw new Error('O Google não confirmou este e-mail. Utilize uma conta Google com e-mail verificado.');
  }
  try {
    await preservarNomeCadastro(credential.user);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
  return credential;
}

async function autenticarGoogle(credential, postBody, email, cadastro) {
  if (cadastro && !emailDiscente(email)) throw new Error(ERRO_CADASTRO);
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${auth.app.options.apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postBody, requestUri: `https://${auth.app.options.authDomain}`,
      returnSecureToken: true, autoCreate: emailDiscente(email) }),
  });
  const result = await response.json();
  if (!response.ok) {
    if (['USER_NOT_FOUND', 'EMAIL_NOT_FOUND'].includes(result.error?.message)) throw new Error('Conta não cadastrada. Para e-mails que não sejam de discentes, solicite o cadastro à administração.');
    throw new Error('Não foi possível autenticar com Google. Se sua conta foi criada com senha, entre usando e-mail e senha.');
  }
  return validarSessaoGoogle(await signInWithCredential(auth, credential));
}

export async function entrarComTokenGoogle(idToken, { email, cadastro = false } = {}) {
  if (!idToken) throw new Error('Credencial Google ausente.');
  const credential = GoogleAuthProvider.credential(idToken);
  return autenticarGoogle(credential, `providerId=google.com&id_token=${encodeURIComponent(idToken)}`, email, cadastro);
}

export function entrarComAcessoGoogle(accessToken, email, { cadastro = false } = {}) {
  const credential = GoogleAuthProvider.credential(null, accessToken);
  return autenticarGoogle(credential, `providerId=google.com&access_token=${encodeURIComponent(accessToken)}`, email, cadastro);
}

export async function entrar(email, senha) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), senha);
  if (!credential.user.emailVerified) {
    let enviado = false;
    try { await sendEmailVerification(credential.user); enviado = true; }
    catch { /* Mantém o bloqueio mesmo se o Firebase limitar o reenvio. */ }
    finally { await signOut(auth); }
    const error = new Error(enviado
      ? 'Confirme seu e-mail pelo link de verificação antes de entrar. Um novo link foi enviado.'
      : 'Confirme seu e-mail pelo link enviado no cadastro. Não foi possível reenviar agora; tente novamente mais tarde.');
    error.code = 'auth/email-not-verified';
    throw error;
  }
  try {
    await preservarNomeCadastro(credential.user, credential.user.displayName);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
  return credential;
}

export async function concluirCadastro(user, nome) {
  if (!emailDiscente(user?.email)) throw new Error(ERRO_CADASTRO);
  await salvarNomeUsuario(user, nome);
  await sendEmailVerification(user);
  await signOut(auth);
}

export async function salvarNomeUsuario(user, nome) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) {
    throw new Error("Informe seu nome para concluir o cadastro.");
  }
  await preservarNomeCadastro(user, nomeLimpo);
}

export async function criarConta(email, senha, nome) {
  if (!emailDiscente(email)) throw new Error(ERRO_CADASTRO);
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) {
    throw new Error("Informe seu nome para concluir o cadastro.");
  }
  const credential = await createUserWithEmailAndPassword(
    auth, email.trim().toLowerCase(), senha
  );
  try {
    await concluirCadastro(credential.user, nomeLimpo);
  } catch (error) {
    // Permite concluir o perfil sem tentar criar a mesma conta novamente.
    error.usuarioCriado = credential.user;
    throw error;
  }
  return credential;
}

export function enviarRedefinicaoDeSenha(email) {
  return sendPasswordResetEmail(auth, email.trim());
}

export async function sair() {
  return signOut(auth);
}

export async function atualizarUsuarioAtual() {
  const user = usuarioAtual();
  if (user) await user.reload();
  return usuarioAtual();
}
