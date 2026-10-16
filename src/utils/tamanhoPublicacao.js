import { MAX_DOCUMENT_BYTES, MAX_IMAGE_DATA_URL_LENGTH, DOCUMENT_SAFETY_BYTES } from '../constants/imagens.js';

export function tamanhoUtf8(value) {
  let size = 0;
  for (const char of String(value)) {
    const code = char.codePointAt(0);
    size += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
  }
  return size;
}

export function limiteImagemPublicacao(payload, path) {
  // Document name: UTF-8 path segments + terminators + 16; document overhead: 32.
  let used = 48 + path.split('/').reduce((sum, part) => sum + tamanhoUtf8(part) + 1, 0);
  for (const [key, value] of Object.entries(payload)) {
    used += tamanhoUtf8(key) + 1;
    if (key === 'imageUrl') used += 1;
    else if (typeof value === 'string') used += tamanhoUtf8(value) + 1;
    else if (value == null || typeof value === 'boolean') used += 1;
    else used += 8; // Numeric fields and Firestore timestamps/server timestamps.
  }
  const available = Math.min(MAX_IMAGE_DATA_URL_LENGTH, MAX_DOCUMENT_BYTES - used - DOCUMENT_SAFETY_BYTES);
  if (available < 1024) throw new Error('O título e a descrição ocupam muito espaço. Reduza o texto antes de publicar.');
  return available;
}
