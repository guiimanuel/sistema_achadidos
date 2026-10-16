const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'wuhup7tw';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'storage';

export async function salvarImagemCloudinary(uri) {
  if (!uri) throw new Error('Selecione uma imagem antes de enviar.');
  const form = new FormData();
  // As telas já preparam JPEG em data URL; o Cloudinary aceita esse formato no campo file.
  form.append('file', uri.startsWith('data:') ? uri : { uri, type: 'image/jpeg', name: 'item.jpg' });
  form.append('upload_preset', UPLOAD_PRESET);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST', body: form, signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok || !data.secure_url?.startsWith(`https://res.cloudinary.com/${CLOUD_NAME}/`)) {
      throw new Error(data.error?.message || 'Não foi possível salvar a imagem no Cloudinary.');
    }
    return { url: data.secure_url, deleteToken: data.delete_token };
  } finally { clearTimeout(timeout); }
}

// O token é temporário; serve para desfazer um upload se o Firestore recusar o salvamento.
export async function desfazerUploadCloudinary(token) {
  if (!token) return;
  await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `token=${encodeURIComponent(token)}`, signal: AbortSignal.timeout(10000),
  });
}
