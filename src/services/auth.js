import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase.js";

export function observarAutenticacao(callback) {
  return onAuthStateChanged(auth, callback);
}

export function usuarioAtual() {
  return auth.currentUser;
}

export function entrar(email, senha) {
  return signInWithEmailAndPassword(auth, email.trim(), senha);
}

export function salvarNomeUsuario(user, nome) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) {
    throw new Error("Informe seu nome para concluir o cadastro.");
  }
  return updateProfile(user, { displayName: nomeLimpo });
}

export async function criarConta(email, senha, nome) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) {
    throw new Error("Informe seu nome para concluir o cadastro.");
  }
  const credential = await createUserWithEmailAndPassword(
    auth, email.trim().toLowerCase(), senha
  );
  try {
    await salvarNomeUsuario(credential.user, nomeLimpo);
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

export function sair() {
  return signOut(auth);
}
