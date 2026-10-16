# Revisão do Achadidos — 14/10/2026

O projeto tem uma boa separação entre telas, serviços e autenticação, e o backend de notificações contém proteções importantes. Entretanto, há um erro comprovado no retorno das fotos, lacunas na comprovação da identidade institucional e problemas de escala nas leituras do Firestore. Eu corrigiria esses pontos antes de ampliar a distribuição.

Esta revisão examinou o código do aplicativo, regras Firestore, funções e migrações Supabase, testes, configuração Expo/EAS, projetos nativos e documentação. Nenhum comportamento do aplicativo ou recurso remoto foi alterado. Não houve ensaio de recebimento real de push, câmera ou acessibilidade em aparelho nesta revisão. Configurações externas de EmailJS, IAM, APNs, FCM, quotas e políticas do painel não foram auditadas remotamente.

Prioridades: **P1** = corrigir antes de ampliar a distribuição; **P2** = próxima rodada de confiabilidade e desempenho; **P3** = manutenção ou melhoria de produto. As prioridades consideram o uso institucional e a intenção de continuar sem ativar serviços pagos.

## Resultados de validação

- 23 testes locais do app passaram: permissões, seleção de câmera, processamento de imagens, orçamento de documento e notificações.
- 6 testes do backend passaram: JWT Firebase, capabilities de dispositivos, chamadas sem autorização, tickets/receipts, paginação e migrações PostgreSQL com PGlite.
- A checagem Deno das duas Edge Functions passou e a exportação Android atual terminou com sucesso. Isso valida tipos/bundle; não comprova execução nativa ou entrega no aparelho.
- O roteador React Navigation instalado reproduziu o erro de retorno de foto descrito abaixo. Isso não depende de Android 15.
- 30 módulos JavaScript nas pastas funcionais foram analisados pelo parser Babel sem erro de sintaxe.
- Expo Doctor: 18 de 21 verificações passaram; falharam ícone não quadrado, sincronização de configuração nativa e três versões de dependências.
- `expo install --check` apontou: Expo 57.0.28 → ~57.0.29; expo-constants 57.0.21 → ~57.0.22; expo-notifications 57.0.22 → ~57.0.23.
- `npm audit --omit=dev` apontou 30 entradas de pacotes afetados, 22 altas e 8 moderadas. Várias são propagação da mesma dependência vulnerável; não representam 30 vulnerabilidades independentes nem comprovam exploração do APK. A ferramenta propõe inclusive downgrades incompatíveis do Expo/Firebase: não usar `audit fix --force` automaticamente.
- `git diff --check` passou. O checkout contém muitas mudanças locais e arquivos novos; nenhum foi revertido ou removido.
- Os testes de regras existentes validam SQL/RLS Supabase em PGlite; não há testes de autorização Firestore com Emulator Suite.

## Problemas prioritários

### 1. P1 — Selecionar foto abre outro formulário e perde o contexto

**Evidência:** `src/screens/EscolherImagemScreen.js:39` e `src/screens/CameraItemScreen.js:50` chamam `navigation.navigate(origem, { imagemRecebida })`. O projeto usa React Navigation 7, no qual `navigate` não volta automaticamente a uma tela anterior da pilha.

**Reprodução:** Home → EditarItem com `item` → EscolherImagem → `navigate('EditarItem', { imagemRecebida })` resulta em Home → EditarItem original → EscolherImagem → **outro EditarItem, sem `item`**. Essa nova tela não consegue salvar. No cadastro, a nova instância inicia título, descrição e categoria vazios.

**Recomendação:** retornar à instância original com `popTo`, preservando/mesclando os parâmetros existentes e o estado do formulário. Cobrir galeria, câmera externa, câmera interna e cadastro/edição com teste do roteador real. Os testes atuais usam navegação simulada e por isso não detectam esse defeito. Referência: [mudança de navigate no React Navigation 7](https://reactnavigation.org/docs/upgrading-from-6.x/#the-navigate-method-no-longer-goes-back-use-popto-instead).

### 2. P1 — O domínio do e-mail não comprova vínculo institucional

**Evidência:** `src/services/auth.js:36` cria a conta com e-mail/senha e não envia verificação de e-mail. `firestore.rules:9` verifica somente o sufixo do e-mail. `supabase/functions/_shared/core.ts:43` também não exige `email_verified`.

**Impacto:** alguém pode cadastrar um endereço institucional cujo controle não possui e publicar com essa identidade, disparando o broadcast. Um JWT válido comprova a conta Firebase, mas não a posse de um endereço ainda não verificado.

**Recomendação:** enviar verificação no cadastro, criar tela de confirmação/reenvio, atualizar o token após confirmação e exigir o claim de e-mail verificado nas regras e na função de publicação. Planejar a transição dos usuários existentes para evitar bloquear todos sem orientação. Referências: [Firebase: gerenciamento de usuários](https://firebase.google.com/docs/auth/web/manage-users) e [claims disponíveis nas regras](https://firebase.google.com/docs/rules/rules-and-auth).

### 3. P1 — A identidade do contato é protegida na tela, mas não no servidor

**Evidência:** `src/services/contato.js:6` chama EmailJS diretamente. Destinatário, nome e e-mail do remetente são parâmetros do cliente; não é enviado JWT Firebase para um backend que valide esses dados. O campo desabilitado em ItemFullScreen melhora a interface, mas não autentica chamadas diretas ao serviço.

**Impacto:** o aplicativo não impõe no servidor que o remetente seja realmente quem afirma ser, nem que o destinatário corresponda ao item. A possibilidade concreta de abuso depende também das restrições configuradas no EmailJS, que não foram inspecionadas. A chave pública EmailJS é pública por definição; o problema é confiar na identidade fornecida pelo cliente.

**Recomendação:** enviar `itemId` e mensagem a uma função, validar JWT, obter remetente do token/perfil e destinatário da publicação, impor limites e então chamar o provedor. Preservar a atual regra de não permitir editar nome/matrícula. Referência: [parâmetros da API EmailJS](https://www.emailjs.com/docs/rest-api/send/).

### 4. P1 — Os e-mails dos publicadores estão disponíveis publicamente

**Evidência:** `firestore.rules:51` e `:62` permitem leitura sem autenticação de documentos completos, que contêm `userEmail`. ItemFullScreen também mostra esse contato antes do login.

**Impacto:** terceiros podem listar endereços institucionais diretamente pela API. Esconder o campo visualmente não impede a leitura do documento. O mural público é uma decisão legítima; a exposição do e-mail merece uma decisão separada.

**Recomendação:** manter conteúdo público e mover dados de contato para documento privado, ou resolver o destinatário no backend sem revelar o e-mail. Registrar no produto o que ficará público, particularmente fotos de documentos pessoais. Não é preciso fechar o mural para resolver isso.

### 5. P1 — Mural e “Minhas publicações” baixam toda a coleção

**Evidência:** `src/services/publicacoes.js:167` assina integralmente `itens` e `item`. `:301` busca todos os documentos de `itens` e só depois filtra os do usuário. As fotos base64 fazem parte de cada documento.

**Impacto:** a primeira carga de 100 documentos perto do limite pode transferir aproximadamente 100 MiB apenas em conteúdo de documentos, antes de overhead. FlatList reduz a renderização simultânea, mas não reduz a consulta nem os dados já recebidos. “Minhas publicações” paga em tráfego e leituras pelos itens de outras pessoas.

**Recomendação:** consultar por `userId`, ordenar por data e paginar. No mural, carregar uma página inicial pequena e observar apenas a faixa recente; planejar busca e filtros junto com a paginação para não pesquisar somente a página carregada sem avisar. Separar fotos/metadados é o passo seguinte. Referência: [paginação Firestore](https://firebase.google.com/docs/firestore/query-data/query-cursors).

## Confiabilidade e dados

### 6. P2 — “Removido após 24 horas” não corresponde ao comportamento real

**Evidência:** EditarItemScreen informa remoção automática. `marcarComoAchado` apenas grava `status` e `expiraEm`; listas filtram esses documentos no cliente. Não há rotina de exclusão por expiração no código revisado.

**Impacto:** os itens continuam no banco, ocupam espaço e são baixados. Além disso, o mural calcula `Date.now()` dentro de um `useMemo` cujas dependências não incluem um relógio: se nada mudar, um item pode continuar visível depois do prazo. A busca acionada por push verifica existência, mas não expiração.

**Recomendação:** decidir entre arquivar e excluir, ajustar a mensagem e centralizar a política. Usar tempo confiável, atualizar listas ao retornar ao app e no prazo de expiração. Se houver exclusão remota, verificar o custo da solução antes de ativá-la. O atual `expiraEm` numérico também precisaria de adaptação para uma política Firestore TTL baseada em timestamp. TTL não garante exclusão exatamente no instante de expiração e não substitui a regra de visibilidade. Referência: [retenção com TTL](https://firebase.google.com/docs/firestore/ttl).

### 7. P2 — A tela de detalhes trabalha com uma cópia antiga da publicação

**Evidência:** ItemFullScreen usa `route.params.item`, sem consultar/observar o documento durante a permanência na tela.

**Impacto:** uma edição ou exclusão posterior não aparece; o usuário pode contatar alguém por um item já removido. Passar o documento com base64 na navegação também aumenta o estado da pilha.

**Recomendação:** navegar com `itemId` e origem da coleção, buscar o conteúdo atual e tratar indisponibilidade. Manter apenas uma prévia leve para apresentação imediata.

### 8. P2 — A data de expiração depende do relógio do aparelho

**Evidência:** `src/services/publicacoes.js:140` calcula o prazo com `Date.now()`. Regras aceitam qualquer número para `expiraEm`, sem relação obrigatória com `status`.

**Impacto:** relógio adiantado/atrasado altera as 24 horas. Um cliente modificado pode fornecer combinações inconsistentes, embora só possa alterar seus próprios itens.

**Recomendação:** definir prazo no backend com hora do servidor e validar transições de estado. Distinguir “item encontrado” de “item devolvido/resolvido”, que são conceitos diferentes.

### 9. P2 — As validações do formulário e do banco não são equivalentes

**Evidência:** a criação exige descrição e foto na tela; a edição admite descrição vazia. As regras não exigem descrição/foto não vazias e não definem limites práticos para título ou descrição. `imageUrl` nas regras é qualquer string dentro do tamanho permitido.

**Impacto:** chamadas fora da interface podem publicar conteúdo que a interface consideraria incompleto. Textos muito grandes ocupam o orçamento da foto e podem dificultar visualização e envio.

**Recomendação:** definir limites de produto para título/descrição e replicar invariantes nos serviços e regras, com mensagens claras. Validar esquema de imagem. Restrições de tamanho devem considerar caracteres e bytes UTF-8 de maneira consistente.

### 10. P2 — Maximizar a foto no Firestore tem um custo arquitetural

**Evidência:** `src/services/imagens.js` tenta dimensão original e diferentes qualidades, reduzindo resolução se necessário. `tamanhoPublicacao.js` calcula o orçamento incluindo os campos do documento.

**Avaliação:** o cálculo é uma melhoria correta para o esquema atual. Contudo, base64 ocupa aproximadamente um terço a mais que o JPEG binário e o limite do documento continua restringindo a qualidade. A imagem é baixada mesmo quando só se precisa do título.

**Recomendação:** preservar a implementação atual enquanto o volume for pequeno; para crescer, estudar armazenamento de objetos com miniatura no mural e imagem maior no detalhe, avaliando franquias antes de escolher. Também medir consumo de memória e tempo ao processar fotos de 48/108 MP em aparelhos modestos. Remover um teto fixo de pixels não remove os limites de memória do dispositivo. Evitar indexar conteúdo da foto se não há consultas nesse campo. Referências: [limites Firestore](https://firebase.google.com/docs/firestore/quotas) e [exceções de índices](https://firebase.google.com/docs/firestore/best-practices).

### 11. P2 — Falta uma experiência explícita para perda de conexão

**Evidência:** consultas/escritas dependem do resultado remoto e os formulários não persistem rascunhos. O contato por EmailJS não possui timeout. O serviço push possui timeout e retry, um bom contraste com os outros serviços.

**Impacto:** ao sair da tela ou fechar o app, o usuário pode perder uma descrição longa. Uma escrita pendente não deve ser confundida com falha definitiva e reenviada, criando outro documento.

**Recomendação:** salvar rascunho com ID estável da publicação, informar estados de sincronização e evitar duplicação no retry. Acrescentar timeout ao contato e distinguir falha de rede, validação e autorização. Não anunciar suporte offline completo sem validar a persistência usada pelo Firebase no React Native.

### 12. P2 — Cadastro parcialmente concluído não tem recuperação durável

**Evidência:** CadastroScreen guarda `usuarioPendente` somente em estado React se `updateProfile` falhar após criar a conta.

**Impacto:** após fechar a tela ou reiniciar, a conta existe, mas pode estar sem nome; contatos ficam bloqueados e um novo cadastro do mesmo e-mail falha.

**Recomendação:** detectar perfil incompleto após login/restauração e oferecer conclusão de perfil. Atualizar o estado compartilhado após salvar nome, evitando depender de outra autenticação para atualizar avatar e nome.

### 13. P2 — A navegação acumula telas e operações não têm proteção uniforme

**Evidência:** salvar/excluir/marcar na edição e login usam `navigate('Home')`, que pode adicionar outra Home. Login e recuperação não possuem estado de solicitação em andamento. No cadastro de item o botão é desabilitado, mas não há guarda imediata no handler como a referência usada no seletor de foto.

**Impacto:** pilhas maiores mantêm formulários antigos e podem manter mais listeners de mural. Voltar pode reabrir uma edição já concluída. Repetição rápida de ações pode gerar chamadas concorrentes.

**Recomendação:** definir quando usar voltar, `popTo` ou reset; bloquear operações com guarda e indicador de progresso; proteger saída com rascunho não salvo. Preservar o mural acessível sem login, mas centralizar acesso às telas de conta.

## Notificações e backend

### 14. P2 — Cadastro público de dispositivos precisa de proteção contra abuso

**Evidência:** `supabase/functions/_shared/api.ts:20` emite capability sem login e `:24` aceita token com validação sintática. Não há limitação de frequência ou comprovação da instalação no código.

**Impacto:** isso permite visitantes, conforme o requisito atual, mas também permite requisições artificiais e cadastro de muitos tokens falsos. Conhecer o projectId público não comprova que o token pertence ao projeto. Quem conhece um token pode tentar reassociá-lo a outra capability.

**Recomendação:** manter o cadastro de visitantes, acrescentar limite de frequência, proteção contra crescimento anormal e, conforme a infraestrutura, comprovação de instalação/App Check. Validar a estratégia sem transformar o login em requisito para receber push. CORS aberto não substitui nem invalida essas proteções.

### 15. P2 — Estado local inválido pode impedir push indefinidamente

**Evidência:** `src/services/notifications.js:24` faz `JSON.parse` sem validação/recuperação do esquema. Uma capability existente é reutilizada sem caminho específico para renovação em resposta 401.

**Impacto:** estado corrompido ou rotação do segredo de assinatura pode causar retries que repetem o mesmo erro. O usuário vê apenas um aviso no console e não tem tela de recuperação.

**Recomendação:** validar/migrar estado local, tratar capability inválida recriando inscrição com cuidado e preservar desativações pendentes quando possível. Diferenciar falha temporária de configuração/autorização.

### 16. P2 — Há fila confiável, mas falta tratamento operacional de erros permanentes

**Evidência:** `delivery.ts:6` trata `InvalidCredentials` e `MismatchSenderId` como falhas permanentes. Essas entregas não voltam automaticamente a pending quando as credenciais são corrigidas.

**Impacto:** uma falha de FCM/APNs pode perder os alertas daquele período mesmo após restaurar o serviço. Tokens DeviceNotRegistered são corretamente desativados, porém registro posterior com o mesmo token pode reativá-los; convém medir esse ciclo.

**Recomendação:** alertar o operador, separar erro de configuração de token inválido e oferecer reprocessamento controlado de eventos recentes, consciente de possíveis duplicações. Não reenviar notificações apenas por ausência de receipt; o código atual acerta nessa separação.

### 17. P2 — Crescimento da fila e consultas de receipts precisam de acompanhamento

**Evidência:** cada evento cria uma entrega para cada token ativo. O worker processa até cinco lotes de envio de 100 e um lote de receipts de 100 por execução. Não há retenção/arquivamento de eventos/entregas no projeto.

**Impacto:** itens × aparelhos determina o tamanho da tabela. O throughput efetivo depende de latência e invocações; esses limites não são uma garantia de capacidade. Uma fila crescente pode aumentar demora e uso de armazenamento.

**Recomendação:** acompanhar idade da entrega pendente mais antiga, totais por status, erros de provedor e execução Cron. Definir retenção e descarte de instalações inativas. Validar carga com centenas/milhares de destinatários antes de crescer.

### 18. P3 — Falta controle de notificações dentro do app

**Evidência:** a permissão é solicitada na primeira abertura, há sincronização automática, mas nenhuma tela de preferências/status. Logout mantém inscrição deliberadamente, conforme o requisito mais recente.

**Recomendação:** explicar que a abertura + permissão são necessárias, mostrar status, permitir desativar/reativar e abrir configurações. Manter “todos os itens” como padrão solicitado. Categorias ou horário silencioso podem ser opções futuras, sem mudar silenciosamente o broadcast.

## Build, interface e manutenção

### 19. P2 — Configuração Expo e projetos nativos divergem

**Evidência:** app.json declara versão 1.0.2; Android tem `versionName '1.0'` e `versionCode 1`. iOS usa `org.name.sistemaachadidos`, enquanto app.json informa `com.systemachadidos`. O nome Android é `sistema_achadidos`. Expo Doctor confirma que plugins/configuração não são automaticamente sincronizados neste checkout com diretórios nativos.

**Recomendação:** escolher uma fonte de verdade e documentar alterações manuais necessárias. Alinhar nome/versão/identificadores e estabelecer incremento de build. Não trocar package de app já distribuído sem planejamento. Para iOS, reconciliar APNs/perfil antes de publicar. Não executar prebuild limpo sobre mudanças locais.

### 20. P2 — O perfil development não está completo

**Evidência:** eas.json usa `developmentClient: true`, mas `expo-dev-client` não aparece como dependência direta.

**Recomendação:** configurar um development build utilizável para depurar notificações e módulos nativos; manter preview APK para instalação. Expo Go serve para parte das telas, mas não valida push Android. Conferir também as três atualizações de patch recomendadas, preservando SDK 57.

### 21. P2 — Ícone e contraste precisam de correção

**Evidência:** Expo Doctor mediu ícone de 67 × 61, não quadrado. O contraste calculado de branco com `#059600` é aproximadamente **3,91:1**.

**Impacto:** texto normal branco sobre o verde principal fica abaixo da referência 4,5:1 da WCAG; texto grande possui critério diferente. Não é necessário abandonar a cor da marca.

**Recomendação:** produzir ícone quadrado em boa resolução e conferir o recurso realmente usado na build nativa. Manter o verde da marca em áreas apropriadas e usar fundo mais escuro nos botões com texto pequeno, ou outra combinação aprovada. Revisar rótulos de acessibilidade, estado de carregamento, foco e alvos de toque. Testar TalkBack, fonte ampliada e telas pequenas. Referência: [contraste mínimo WCAG](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

### 22. P2 — O app carrega fontes demais e não recupera erro inicial

**Evidência:** `useExpoFonts.js` referencia **97 arquivos**, somando **20.502.960 bytes**. AppAlertHost chama esse hook globalmente. App.js espera três fontes para montar o app, mas ignora o erro retornado por `useFonts`. Outros componentes recebem erro de fonte, porém não o usam de maneira uniforme.

**Impacto:** mais assets e trabalho de carregamento do que a interface demanda; erro no carregamento inicial pode deixar spinner permanente. Os aliases MontserratBold/ExtraBold/SemiBold são carregados em mais de um lugar.

**Recomendação:** centralizar somente Regular/Medium/SemiBold/Bold/ExtraBold realmente usados, com fallback se a fonte falhar. Verificar tamanho final da build e tempo de abertura. Não apagar assets indiscriminadamente; identificar uso antes de remover.

### 23. P2 — Os testes passam, mas não cobrem os riscos principais

**Evidência:** há testes úteis de regressão, porém vários carregam funções por transformação de código/mocks. Não há teste completo do fluxo de navegação, regras Firestore no emulador, CRUD entre duas contas nem automação de CI no checkout.

**Recomendação:** priorizar testes de autorização e fluxos reais: outro UID não edita/exclui; e-mail não verificado não publica; cadastro/edição preservam dados após foto; item excluído/expirado não abre; grande documento cabe na escrita efetiva. Acrescentar scripts `test`, verificação de regras e CI. PGlite comprova a lógica SQL exercitada, não a configuração do projeto remoto.

### 24. P3 — Há redundância que dificulta manutenção

**Evidência:** três normalizações de publicação e múltiplos conversores de data coexistem. `observarMinhasPublicacoes` já consulta por UID, mas a tela usa a função que lê toda a coleção. `react-native.config.js` referencia `./assets/fonts/`, enquanto as fontes estão em `src/assets/fonts`. Existe android_backup versionado e um ponto de entrada alternativo src/index.js que não é o ativo. Não encontrei importações no app para axios, @supabase/server, @supabase/supabase-js ou react-native-worklets-core; isso é indício de candidatos, não autorização para remoção automática. Reanimated/worklets possuem dependência indireta necessária do controlador de teclado.

**Recomendação:** consolidar modelo e datas após mapear dados legados, retirar candidatos comprovadamente sem uso e documentar o backup. Evitar uma reorganização grande antes de corrigir os problemas funcionais. Revisar dependências vulneráveis por caminho de uso, mantendo compatibilidade Expo e lockfiles.

### 25. P2 — O estado de trabalho e o projeto Firebase padrão oferecem risco operacional

**Evidência:** muitas alterações essenciais ainda estão locais, incluindo arquivos novos de notificações/testes. `.firebaserc` aponta `system-achadidos`, enquanto o app usa `achadidos-15d82`. O deploy anterior correto precisou do parâmetro explícito `--project`.

**Impacto:** outro computador ou CI a partir do commit atual pode não reproduzir o app; um deploy sem parâmetro pode atingir o projeto errado.

**Recomendação:** revisar e versionar mudanças aprovadas em commits compreensíveis, preservar trabalho alheio e separar artefatos/credenciais. Alinhar alias ou scripts de deploy com projeto explícito. Chaves públicas Firebase e google-services.json não são equivalentes à chave privada da conta de serviço. Os caminhos conhecidos de segredos estão ignorados; esta revisão não comprova ausência de segredos em todo o histórico Git.

## O que vale preservar

- AuthProvider acompanha a sessão uma vez e os serviços concentram operações externas.
- A autoria é imposta pelas regras Firestore para alteração/exclusão; o cliente não pode escolher livremente outro userId.
- Categorias são compartilhadas no app e validadas no banco.
- O orçamento de foto considera UTF-8, campos e margem de segurança para o esquema atual.
- A seleção de imagem trata erro, cancelamento, permissão negada, toque duplicado e câmera externa indisponível.
- Notificações ficam desabilitadas corretamente em Expo Go/web; isso evita o crash de importação observado.
- Push valida assinatura/projeto/expiração do JWT, verifica autoria no Firestore e mantém credenciais privadas no backend.
- As tabelas de push têm RLS, revogação de acesso cliente e RPCs privilegiadas com execução restrita. `verify_jwt = false` nas Edge Functions é deliberado: a API usa Firebase JWT/capabilities e o worker usa segredo próprio; não significa que publicar esteja liberado a visitantes.
- A fila usa unicidade, leases, tickets/receipts e recuperação Cron. A documentação reconhece que um provedor externo pode duplicar uma entrega em timeout.

## Sugestões de produto

1. **Tipo da publicação:** “Perdi um item” e “Encontrei um item”, separado de categoria. A frase atual “Esse item é seu?” assume que todo item foi encontrado, embora o formulário aceite perdas.
2. **Local e data do ocorrido:** campos estruturados para campus/bloco/sala e dia, além da data de publicação. Hoje o detalhe suporta Local, mas o cadastro não o coleta.
3. **Estado claro:** “Aberto”, “Em contato” e “Resolvido/devolvido”, evitando chamar de “Achado” tanto um objeto encontrado quanto um caso concluído.
4. **Privacidade na identificação:** orientar a ocultar número de documento/matrícula na foto e reservar um detalhe para a pessoa comprovar que é dona do objeto.
5. **Contato com contexto:** associar mensagens ao item e registrar sucesso/falha, sem expor e-mail publicamente. Push ao publicador por contato seria um evento separado, autenticado, caso seja solicitado.
6. **Inclusão institucional:** decidir se servidores/DAEE também podem publicar. Hoje somente `@discente.ifpe.edu.br` pode escrever; não ampliar essa regra sem definir papéis.
7. **Moderação:** denúncia de publicação e revisão por responsável, sobretudo com broadcast global. Limite de publicações por período reduz spam e consumo de franquias.
8. **Preferências e clareza:** manter as oito categorias atuais; são suficientemente amplas para o uso inicial. Medir frequência de Outros antes de acrescentar categorias. Explicar permissão push, recuperação de senha e conclusão de perfil com mensagens específicas.

## Ordem sugerida de trabalho

1. Corrigir retorno de foto e navegação, com teste que preserva item e rascunho.
2. Implantar confirmação de e-mail e fluxo de perfil incompleto, preparando usuários existentes.
3. Proteger contato no backend e separar dados públicos de contato privado.
4. Corrigir consultas de “Minhas publicações”, paginar mural e tornar detalhes atuais.
5. Definir expiração/arquivamento e funcionamento offline.
6. Alinhar configuração nativa, fontes/ícone, patches e testes de regras/CI.
7. Instrumentar fila e validar Android real: câmera, foto grande, duas instalações, app fechado, logout, tokens inválidos, exclusão e recuperação Cron.

Não recomendo migrar toda a autenticação/banco, ativar Blaze ou trocar de SDK como primeira resposta a esses problemas. As correções iniciais cabem na arquitetura existente; mudanças com implicações de custo precisam de avaliação específica.
