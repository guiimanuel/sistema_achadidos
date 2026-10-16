import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { MAX_IMAGE_DATA_URL_LENGTH } from '../constants/imagens.js';

export async function prepararImagem(asset, limit = MAX_IMAGE_DATA_URL_LENGTH) {
  if (!asset?.uri) throw new Error('Não foi possível carregar a imagem selecionada.');
  const context = ImageManipulator.manipulate(asset.uri);
  let image;
  try {
    image = await context.renderAsync();
    const { width, height } = image;
    image.release();
    image = null;
    const originalEdge = Math.max(width, height);
    const edges = [originalEdge];
    while (edges[edges.length - 1] > 800) edges.push(Math.max(800, Math.floor(edges[edges.length - 1] * 0.8)));
    for (const edge of edges) {
      context.reset();
      if (Math.max(width, height) > edge) {
        context.resize(width >= height ? { width: edge, height: null } : { width: null, height: edge });
      }
      image = await context.renderAsync();
      for (const compress of [1, 0.95, 0.9, 0.85, 0.75, 0.65, 0.55]) {
        const result = await image.saveAsync({ format: SaveFormat.JPEG, compress, base64: true });
        if (!result.base64) throw new Error('Não foi possível preparar os dados da imagem.');
        const dataUrl = `data:image/jpeg;base64,${result.base64}`;
        if (dataUrl.length <= Math.min(limit, MAX_IMAGE_DATA_URL_LENGTH)) return dataUrl;
      }
      image.release();
      image = null;
    }
    throw new Error('Não foi possível ajustar esta imagem. Tente selecionar outra foto.');
  } finally {
    image?.release();
    context.release();
  }
}
