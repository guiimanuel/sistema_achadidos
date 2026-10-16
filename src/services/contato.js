const EMAILJS_SERVICE_ID = 'service_wuhafya';
const EMAILJS_TEMPLATE_ID = 'template_vwyjd8c';
const EMAILJS_PUBLIC_KEY = 'sf7es5fokN-JUdLiR';

export function resolverRemetenteContato(user, { nome, email }) {
  const accountName = String(user?.displayName || '').trim();
  const fromName = accountName || String(nome || '').trim();
  const fromEmail = String(user ? user.email || '' : email || '').trim();
  if (!fromName) throw new Error('Informe seu nome para enviar a mensagem.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) throw new Error('Informe um e-mail válido para receber a resposta do publicador.');
  return { fromName, fromEmail };
}

export function enviarContato({ toEmail, fromName, fromEmail, itemTitle, subject, message }) {
  return fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'origin': 'localhost',
    },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: toEmail,
        from_name: fromName,
        from_email: fromEmail,
        reply_to: fromEmail,
        item_title: itemTitle,
        subject,
        message: `${message.trim()}\n\n---\nNome do remetente: ${fromName}\nE-mail para resposta: ${fromEmail}`,
      },
    }),
  });
}
