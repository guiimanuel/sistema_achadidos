# Notificações de novas publicações

O fluxo de contato e o vínculo dos aparelhos à conta estão descritos em [contato-cadastro-imagens.md](contato-cadastro-imagens.md). A migração `contact_push` acrescenta eventos individuais à mesma fila; logout mantém o broadcast, mas remove o vínculo para contatos.

Firebase continua responsável por autenticação e itens. Supabase armazena apenas dispositivos,
eventos e entregas; as tabelas privadas não têm políticas de acesso para clientes. Nenhuma senha
é copiada do Firebase. A referência `appSendNotification` forneceu a sequência de permissão/token
e o payload Expo (`to`, `sound`, `title`, `body`, `data`), agora usados com autenticação e fila.

## Ativar no projeto existente

Projeto: `yxntmaturcrogmkbijql`. Estes passos ainda exigem acesso administrativo ao Supabase/Firebase.

1. Instale/autentique a CLI Supabase e vincule: `npx supabase login` e
   `npx supabase link --project-ref yxntmaturcrogmkbijql`.
2. Revise a migração `supabase/migrations/202610140001_push.sql` e aplique com
   `npx supabase db push`. As novas tabelas usam o prefixo `push_`; a tabela `usuario`
   do protótipo não é utilizada. O envio fica desabilitado até a ativação explícita.
3. Crie uma conta de serviço Google exclusiva com `roles/datastore.viewer` no projeto
   `achadidos-15d82`; guarde seu JSON compacto em `FIREBASE_SERVICE_ACCOUNT_JSON`.
   Copie `supabase/secrets.env.example` para `supabase/secrets.env` e preencha os segredos
   privadamente. Gere dois segredos aleatórios diferentes de pelo menos 32 caracteres.
   Envie com `npx supabase secrets set --env-file supabase/secrets.env`.
   `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são provisionados pelo ambiente das funções.
4. Implante: `npx supabase functions deploy push-api --use-api` e
   `npx supabase functions deploy push-worker --use-api`. `--use-api` faz o bundle no servidor,
   sem depender do Docker local. Os imports compartilhados usam versões explícitas `npm:`
   para funcionar também no deploy remoto. O `verify_jwt = false` é intencional:
   `push-api` exige JWT Firebase e autoria para solicitar um envio por publicação;
   registro de instalações independe de login e exige uma capability assinada. `push-worker`
   exige seu segredo exclusivo. A função de desativação valida uma capability assinada
   restrita ao aparelho; não depende de uma sessão Firebase que já terminou.
5. No Supabase, habilite Cron (`pg_cron`), `pg_net` e Vault. Crie no Vault o segredo
   `push_worker_secret`, igual a `PUSH_WORKER_SECRET`. Execute `supabase/activate-push.sql`
   no SQL Editor. A primeira ativação define o início: itens anteriores não geram alertas.
   Reexecutar a ativação não muda esse início e atualiza o job pelo nome.
6. Implante as regras Firestore com `npx firebase-tools deploy --only firestore:rules --project achadidos-15d82`.
   Novos itens exigem timestamps do servidor; `createdAt` não pode mudar nas edições.

Não é preciso migrar o Firebase Auth nem adicionar claims Supabase aos usuários. Apenas a função
acessa o banco com credenciais administrativas, depois de validar o usuário Firebase.

## Preparar uma build com push

O app já usa a URL pública do projeto; `.env.example` mostra como sobrescrevê-la.
Não colocar segredos de backend em `.env` do Expo. `app.json` inclui o plugin de notificações.

Como `android/` e `ios/` existem no checkout, EAS não aplica automaticamente todos os plugins.
As permissões/canal Android e o entitlement iOS foram preparados no código nativo. Para Android,
baixe do Firebase um `google-services.json` de um app Android **com o package `com.company.achadidos`**,
salve em `android/app/google-services.json` e disponibilize-o também na build remota.
Esse arquivo contém a configuração pública Firebase e está incluído nos arquivos da build;
os JSONs de contas de serviço, que contêm chaves privadas, continuam ignorados pelo Git.
O app Firebase Web já configurado não substitui esse arquivo.
Configure uma credencial FCM V1 no EAS para o projeto Expo `ad3b0b7d-22ee-412d-bc1b-0d68a6f29cc5`;
para iOS configure a chave APNs e perfil com Push Notifications para `org.name.sistemaachadidos`.
Use `eas credentials` ou o painel EAS. Essas credenciais não são geradas por cadastro de usuário.

Gere e instale uma nova build; push Android não funciona no Expo Go. No iOS, instale os Pods
em macOS e confirme o entitlement `aps-environment` no perfil de assinatura de distribuição.
A biblioteca mantém o app funcional na web/Expo Go, mas não registra push nesses ambientes.

O identificador Android foi alinhado ao cadastro Firebase correto: `com.company.achadidos`
em `app.json`, no Gradle e nas classes Kotlin. Esse ID difere de builds antigas com
`com.sistemaachadidos`; o Android as trata como apps distintos. O arquivo Firebase precisa
estar disponível no ambiente da build.
No iOS, o identificador nativo `org.name.sistemaachadidos` ainda difere de `app.json`.
Antes de regenerar o projeto iOS, reconcilie essa divergência com suas credenciais APNs.
Não execute `prebuild --clean` sobre o checkout com alterações locais.

## Comportamento e limites

- A abertura do app registra o token, mesmo sem conta ou login; a permissão é solicitada uma vez.
  Se negada, o usuário pode habilitar nas configurações do sistema. O retorno ao app e uma
  tentativa a cada minuto em primeiro plano sincronizam tokens e desativações pendentes.
- Falhas não impedem cadastro nem publicação. A solicitação imediata ocorre após o commit
  Firestore; Cron recupera itens por `createdAt`, com paginação persistente e sobreposição
  de dois minutos. O `createTime` real do documento determina se é anterior à ativação.
- Recebem os aparelhos registrados até a publicação e ainda ativos no momento do envio,
  inclusive visitantes e o autor. Instalar o APK sem abrir e autorizar notificações não registra o aparelho.
- Logout e troca de conta mantêm o aparelho inscrito. Revogar a permissão ou trocar o token
  desativa o registro anterior. Offline, a desativação aguarda reconexão;
  uma notificação já entregue/enviada ao provedor não pode ser retirada.
- O servidor guarda apenas o hash da capability. Ela é persistida no aparelho antes de
  ativar o token, permitindo registro e desativação sem guardar JWT Firebase.
- A fila deduplica item/token e usa leases de 120 segundos. Expo é externo: timeout ou
  interrupção após aceitação pode resultar em duplicação; não há garantia de exatamente uma vez.
- Tickets são consultados depois de 15 minutos. Tokens inválidos são desativados, falhas
  temporárias usam backoff e até oito tentativas; credenciais inválidas exigem correção operacional.
  `delivered` significa receipt Expo positivo, não confirmação de leitura do usuário.
- Pausar um projeto gratuito, exceder franquias ou indisponibilidade dos serviços interrompe o
  processamento. Retomar o job recupera o backlog; acompanhar `push_state` e `push_deliveries`.
  O scanner utiliza leituras Firestore, que contam na franquia Firebase.

## Verificação

- `npx deno check --config supabase/functions/deno.json supabase/functions/push-api/index.ts supabase/functions/push-worker/index.ts`
- `npx deno test --allow-env --allow-read --allow-net --allow-ffi --config supabase/functions/deno.json supabase/tests/`
- `node --test tests/notifications.test.cjs`
- `npx expo export --platform android --output-dir .expo-export-test`

Em build própria, abrir dois aparelhos (um visitante e um usuário), permitir notificações, publicar e verificar
o alerta com destinatário aberto/fechado e toque abrindo o item. Testar permissão negada,
recebimento após logout, troca de conta sem duplicação, várias instalações e item excluído. Interromper o autor entre salvar
e solicitar push e confirmar recuperação pelo Cron. Conferir tokens inválidos, leases concorrentes,
receipts, ausência de alertas em edição e rejeição de JWT ausente/forjado/expirado/de outro projeto.
