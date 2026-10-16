# Achados e Perdidos

Aplicativo Expo SDK 57 com React Navigation e Firebase.

## Notificações

Novas publicações usam Expo Push com tokens privados e fila no Supabase, mantendo Firebase
Auth e Firestore. Registro automático ao abrir o app, inclusive sem conta ou após logout,
mediante permissão de notificações no aparelho.
Consulte [configuração e validação](docs/notificacoes.md) para implantar funções, ativar Cron,
configurar credenciais FCM/APNs e gerar a nova build. Apenas instalar dependências não ativa push.

## Desenvolvimento

- `npm install`: instalar dependências.
- `npm start`: iniciar o Expo.
- `npm run android`: executar a versão Android.
- `npm run web`: executar a versão web.

## Organização

- `App.js`: composição dos providers, fontes e navegação.
- `src/navigation/`: definição das rotas e opções do React Navigation.
- `src/screens/`: telas e interação com o usuário.
- `src/components/`: componentes visuais compartilhados.
- `src/providers/`: estado compartilhado, incluindo a sessão de autenticação.
- `src/hooks/`: hooks React, como `useAuth` e `useExpoFonts`.
- `src/services/`: autenticação, publicações, contato e alertas. Os acessos ao Firebase e ao EmailJS ficam aqui.
- `src/lib/`: inicialização de bibliotecas externas; atualmente, Firebase.
- `src/constants/`: categorias e outros valores compartilhados.
- `src/utils/`: funções auxiliares de datas e texto, independentes do React.
- `src/styles/`: cores e tema.
- `src/assets/`: fontes, imagens e ícones. `src/assets/icons/` contém os ícones referenciados pela configuração Expo.

As telas acessam dados através dos serviços. O `AuthProvider` acompanha a sessão uma única vez e a disponibiliza pelo hook `useAuth`. O mural continua acessível sem login.

Os conversores de datas preservam os formatos legados de cada lista. As regras do banco estão em `firestore.rules`.

O ponto de entrada ativo é `node_modules/expo/AppEntry.js`, conforme `package.json`; `src/index.js` não é o ponto de entrada configurado.

## Validação

`npx expo export --platform android --output-dir .expo-export-test` verifica o bundle Android. A exportação não substitui a validação visual e dos fluxos em um dispositivo.
