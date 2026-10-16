import { doc, runTransaction } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../lib/firebase.js';

// O nome escolhido no aplicativo tem prioridade sobre o perfil do provedor Google.
export async function preservarNomeCadastro(user, nomeCadastro = '') {
  const nomeInformado = String(nomeCadastro || '').trim();
  const nomeSenha = String(user.providerData?.find((provider) => provider.providerId === 'password')?.displayName || '').trim();
  const referencia = doc(db, 'perfis', user.uid);
  const nome = await runTransaction(db, async (transaction) => {
    const perfil = await transaction.get(referencia);
    if (perfil.exists()) return perfil.data().nome;
    const original = nomeInformado || nomeSenha;
    if (original) transaction.set(referencia, { nome: original });
    return original;
  });
  if (nome && user.displayName !== nome) await updateProfile(user, { displayName: nome });
}
