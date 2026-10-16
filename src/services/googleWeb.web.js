import { entrarComAcessoGoogle } from './auth.js';

let loading;
export function prepararGoogleWeb() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!loading) loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = setTimeout(() => { script.remove(); reject(new Error('Não foi possível carregar o acesso Google.')); }, 15000);
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => { clearTimeout(timeout); resolve(); };
    script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error('Verifique sua conexão para carregar o acesso Google.')); };
    document.head.appendChild(script);
  }).catch((error) => { loading = null; throw error; });
  return loading;
}

export function entrarGoogleWeb(clientId, options) {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) { reject(new Error('O acesso Google não carregou. Recarregue a página e tente novamente.')); return; }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId, scope: 'openid email profile',
      error_callback: (error) => {
        if (error.type === 'popup_closed') resolve(null);
        else reject(new Error('Permita a janela de acesso Google no navegador e tente novamente.'));
      },
      callback: async (response) => {
        if (response.error || !response.access_token) { reject(new Error('Não foi possível autorizar o acesso Google.')); return; }
        try {
          const result = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` },
          });
          if (!result.ok) throw new Error('Não foi possível consultar a conta Google.');
          const profile = await result.json();
          if (!profile.email_verified) throw new Error('Utilize uma conta Google com e-mail verificado.');
          resolve(await entrarComAcessoGoogle(response.access_token, profile.email, options));
        } catch (error) { reject(error); }
      },
    });
    client.requestAccessToken({ prompt: 'select_account' });
  });
}
