import { getDateMillis as getPersonalDateMillis } from '../utils/datas.js';
import {
  setDoc,
  collection,
  deleteDoc,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase.js";
import { notificarNovaPublicacao } from './notifications.js';
import { MAX_IMAGE_DATA_URL_LENGTH } from '../constants/imagens.js';
import { CATEGORIAS, normalizarCategoria } from '../constants/categorias.js';
import { limiteImagemPublicacao } from '../utils/tamanhoPublicacao.js';
import { prepararImagem } from './imagens.js';
import { podePublicar } from '../utils/permissoes.js';
import { salvarImagemCloudinary, desfazerUploadCloudinary } from './storageCloudinary.js';

export const PUBLICACOES_COLLECTION = "itens";
export const COLECOES_PUBLICACOES = ["itens", "item"];

const SUPPORTED_IMAGE_PATTERN = /^(https?:|data:image\/)/i;

function requireCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Você precisa estar logado para publicar itens.");
  }

  if (!podePublicar(user)) throw new Error('Sua conta não tem acesso às funcionalidades de publicação. Confirme seu e-mail; contas de discentes não podem publicar.');

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
  const categoria = normalizarCategoria(filtro);
  if (!CATEGORIAS.includes(String(filtro || '').trim())) throw new Error('Escolha uma das categorias disponíveis.');
  return {
    titulo: String(titulo || "").trim(),
    descricao: String(descricao || "").trim(),
    filtro: categoria,
    categoria,
    imageUrl: imageUrl || "",
    userId: user.uid,
    userEmail: user.email || "",
  };
}

export async function criarPublicacao({ titulo, descricao, filtro, imagem }) {
  const user = requireCurrentUser();
  if (!String(descricao || "").trim()) {
    throw new Error("Informe uma descrição para a publicação.");
  }
  const imageUrl = normalizeImageValue(imagem);
  if (!imageUrl) {
    throw new Error("Adicione uma foto do item antes de publicar.");
  }

  const itemRef = doc(collection(db, PUBLICACOES_COLLECTION));
  const payload = {
    ...buildItemPayload({ titulo, descricao, filtro, imageUrl }, user),
    status: "disponivel",
    expiraEm: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const imageLimit = limiteImagemPublicacao(payload, itemRef.path);
  if (imageUrl.startsWith('data:image/') && imageUrl.length > imageLimit) {
    payload.imageUrl = await prepararImagem({ uri: imageUrl }, imageLimit);
  }
  const upload = await salvarImagemCloudinary(payload.imageUrl);
  payload.imageUrl = upload.url;
  try { await setDoc(itemRef, payload); }
  catch (error) {
    await desfazerUploadCloudinary(upload.deleteToken).catch(() => {});
    throw error;
  }
  void notificarNovaPublicacao(itemRef.id, user);
  return itemRef;
}

export async function buscarPublicacao(itemId, collectionName = PUBLICACOES_COLLECTION) {
  if (!COLECOES_PUBLICACOES.includes(collectionName)) throw new Error('Coleção inválida.');
  const snapshot = await getDoc(doc(db, collectionName, itemId));
  return snapshot.exists() ? normalizePublicacao(snapshot, collectionName) : null;
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

  const itemRef = doc(db, sourceCollection, docId);
  const payload = {
    ...buildItemPayload({ titulo, descricao, filtro, imageUrl }, user),
    updatedAt: serverTimestamp(),
  };
  const imageLimit = limiteImagemPublicacao({ ...payload, createdAt: serverTimestamp(), status: item?.status || 'disponivel', expiraEm: item?.expiraEm ?? null }, itemRef.path);
  if (imageUrl.startsWith('data:image/') && imageUrl.length > imageLimit) {
    payload.imageUrl = await prepararImagem({ uri: imageUrl }, imageLimit);
  }
  const upload = imageUrl !== item.imageUrl ? await salvarImagemCloudinary(payload.imageUrl) : null;
  if (upload) payload.imageUrl = upload.url;
  try { await updateDoc(itemRef, payload); }
  catch (error) {
    if (upload) await desfazerUploadCloudinary(upload.deleteToken).catch(() => {});
    throw error;
  }
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
    filtro: normalizarCategoria(data.filtro || data.categoria || data.category),
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

function normalizeMinhaPublicacao(
  docSnapshot
) {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,

    titulo:
      data.titulo ||
      data.title ||
      data.nome ||
      'Item sem título',

    descricao:
      data.descricao ||
      data.description ||
      data.texto ||
      data.detalhes ||
      '',

    categoria:
      data.categoria ||
      data.categoriaNome ||
      data.category ||
      data.tipo ||
      data.filtro ||
      '',

    imageUrl:
      data.imageUrl ||
      data.imagem ||
      data.fotoUrl ||
      data.photoUrl ||
      data.image ||
      data.foto ||
      '',

    userId:
      data.userId ||
      data.uid ||
      data.id_usuario ||
      data.usuarioId ||
      '',

    userEmail:
      data.userEmail ||
      data.email ||
      data.usuarioEmail ||
      '',

    createdAt:
      data.createdAt ||
      data.dataCriacao ||
      data.data ||
      null,

    status: data.status || 'disponivel',

    expiraEm: data.expiraEm || null,
  };
}

export async function listarMinhasPublicacoes(user) {
  if (!podePublicar(user)) return [];
  const snapshot =
    await getDocs(
      collection(db, 'itens')
    );

  const minhasPublicacoes = [];
  const agora = Date.now();

  snapshot.forEach(
    (docSnapshot) => {
      const data =
        docSnapshot.data();

      const userId = String(
        data.userId ||
        data.uid ||
        data.ownerId ||
        ''
      );

      const userEmail = String(
        data.userEmail ||
        data.email ||
        data.ownerEmail ||
        ''
      );

      const pertenceAoUsuario =
        userId === user.uid ||
        (
          user.email &&
          userEmail.toLowerCase() ===
          user.email.toLowerCase()
        );

      if (pertenceAoUsuario) {
        const itemNormalizado = normalizeMinhaPublicacao(docSnapshot);

        // Oculta itens marcados como "achado" que já ultrapassaram o tempo limite
        const jaExpirou =
          itemNormalizado.status === 'achado' &&
          itemNormalizado.expiraEm &&
          agora >= itemNormalizado.expiraEm;

        if (!jaExpirou) {
          minhasPublicacoes.push(itemNormalizado);
        }
      }
    }
  );

  minhasPublicacoes.sort(
    (a, b) =>
      getPersonalDateMillis(
        b.createdAt
      ) -
      getPersonalDateMillis(
        a.createdAt
      )
  );

  return minhasPublicacoes;
}
