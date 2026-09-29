import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../config/firebase.js";

export const PUBLICACOES_COLLECTION = "itens";
export const COLECOES_PUBLICACOES = ["itens", "item"];

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
    status: "disponivel",
    expiraEm: null,
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

// FUNÇÃO ATUALIZADA: MARCAR COMO ACHADO
export async function marcarComoAchado(item, horas = 24) {
  const user = requireCurrentUser();
  const docId = typeof item === "string" ? item : (item?.docId || item?.id);
  const sourceCollection = item?.sourceCollection || PUBLICACOES_COLLECTION;

  if (!docId) {
    throw new Error("Publicação sem identificador.");
  }

  // Se passares um valor menor que 1 (ex: 0.003), ele aceita frações de hora.
  // Calcula a expiração com base no valor recebido no parâmetro 'horas'
  const tempoExpiraEm = Date.now() + Math.round(horas * 60 * 60 * 1000);

  await updateDoc(doc(db, sourceCollection, docId), {
    status: "achado",
    expiraEm: tempoExpiraEm,
    updatedAt: serverTimestamp(),
  });

  return tempoExpiraEm;
}

export async function excluirPublicacao(item) {
  const user = requireCurrentUser();
  const docId = typeof item === "string" ? item : (item?.docId || item?.id);
  const sourceCollection = item?.sourceCollection || PUBLICACOES_COLLECTION;

  if (!docId) {
    throw new Error("Publicação sem identificador.");
  }

  if ((item?.userId || item?.ownerId) && (item.userId || item.ownerId) !== user.uid) {
    throw new Error("Você só pode excluir publicações da sua conta.");
  }

  await deleteDoc(doc(db, sourceCollection, docId));
}

export function observarPublicacoes(onCollectionChange, onError) {
  const unsubscribers = COLECOES_PUBLICACOES.map((collectionName) =>
    onSnapshot(
      collection(db, collectionName),
      (snapshot) => onCollectionChange(collectionName, snapshot.docs),
      (error) => onError?.(collectionName, error)
    )
  );

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

export function observarMinhasPublicacoes(userId, onChange, onError) {
  const minhasPublicacoesQuery = query(
    collection(db, PUBLICACOES_COLLECTION),
    where("userId", "==", userId)
  );

  return onSnapshot(
    minhasPublicacoesQuery,
    (snapshot) => {
      const publicacoes = snapshot.docs
        .map((docSnapshot) => normalizePublicacao(docSnapshot, PUBLICACOES_COLLECTION))
        .sort((a, b) => getDateMillis(b.createdAt) - getDateMillis(a.createdAt));

      onChange(publicacoes);
    },
    onError
  );
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
    status: data.status || "disponivel",
    expiraEm: data.expiraEm || null,
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
