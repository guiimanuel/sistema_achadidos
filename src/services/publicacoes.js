import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../utils/firebase.js";

export const PUBLICACOES_COLLECTION = "itens";

const MAX_IMAGE_DATA_URL_LENGTH = 800000;
const SUPPORTED_IMAGE_PATTERN = /^(https?:|data:image\/)/i;

function requireCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Você precisa estar logado para publicar itens.");
  }

  return user;
}

function normalizeImageValue(value) {
  const imageUrl = String(value || "");

  if (!imageUrl) {
    return "";
  }

  if (!SUPPORTED_IMAGE_PATTERN.test(imageUrl)) {
    throw new Error("Escolha a imagem novamente antes de publicar.");
  }

  if (imageUrl.startsWith("data:image/") && imageUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    throw new Error("A imagem ficou grande demais. Escolha uma imagem menor ou tire outra foto.");
  }

  return imageUrl;
}

function buildItemPayload({ titulo, descricao, filtro, imageUrl }, user) {
  return {
    titulo: String(titulo || "").trim(),
    descricao: String(descricao || "").trim(),
    filtro: String(filtro || "").trim(),
    categoria: String(filtro || "").trim(),
    imageUrl: imageUrl || "",
    userId: user.uid,
    userEmail: user.email || "",
  };
}

export async function criarPublicacao({ titulo, descricao, filtro, imagem }) {
  const user = requireCurrentUser();
  const imageUrl = normalizeImageValue(imagem);

  return addDoc(collection(db, PUBLICACOES_COLLECTION), {
    ...buildItemPayload({ titulo, descricao, filtro, imageUrl }, user),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function atualizarPublicacao(item, { titulo, descricao, filtro, imagem }) {
  const user = requireCurrentUser();
  const docId = item?.docId || item?.id;
  const sourceCollection = item?.sourceCollection || PUBLICACOES_COLLECTION;

  if (!docId) {
    throw new Error("Publicação sem identificador.");
  }

  if ((item?.userId || item?.ownerId) && (item.userId || item.ownerId) !== user.uid) {
    throw new Error("Você só pode editar publicações da sua conta.");
  }

  const imageUrl = normalizeImageValue(imagem);

  await updateDoc(doc(db, sourceCollection, docId), {
    ...buildItemPayload({ titulo, descricao, filtro, imageUrl }, user),
    updatedAt: serverTimestamp(),
  });
}

export async function excluirPublicacao(item) {
  const user = requireCurrentUser();
  const docId = item?.docId || item?.id;
  const sourceCollection = item?.sourceCollection || PUBLICACOES_COLLECTION;

  if (!docId) {
    throw new Error("Publicação sem identificador.");
  }

  if ((item?.userId || item?.ownerId) && (item.userId || item.ownerId) !== user.uid) {
    throw new Error("Você só pode excluir publicações da sua conta.");
  }

  await deleteDoc(doc(db, sourceCollection, docId));
}

export function normalizePublicacao(docSnapshot, sourceCollection = PUBLICACOES_COLLECTION) {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,
    docId: docSnapshot.id,
    sourceCollection,
    titulo: data.titulo || data.title || data.nome || "Sem título",
    descricao: data.descricao || data.description || data.texto || "",
    filtro: data.filtro || data.categoria || data.category || "",
    imageUrl: data.imageUrl || data.imagem || data.fotoUrl || "",
    userId: data.userId || data.uid || "",
    userEmail: data.userEmail || data.email || "",
    createdAt: data.createdAt || data.dataCriacao || data.data || null,
    updatedAt: data.updatedAt || null,
  };
}

export function getDateMillis(value) {
  if (!value) {
    return 0;
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value.toDate === "function") {
    return value.toDate().getTime();
  }

  if (typeof value.seconds === "number") {
    return value.seconds * 1000;
  }

  return 0;
}
