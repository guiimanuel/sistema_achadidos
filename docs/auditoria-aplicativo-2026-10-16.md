**Auditoria crítica do Achados e Perdidos — 16/10/2026**

**Parecer**

O aplicativo tem uma base aproveitável e vários cuidados já implementados, mas eu não recomendaria ampliar sua distribuição antes de corrigir os limites de autorização/contato e o retorno de imagem. A prioridade é garantir que somente pessoas autorizadas publiquem, que mensagens e avisos sejam confiáveis e que o usuário não perca trabalho. O refinamento visual deve caminhar junto com contraste e acessibilidade.

Foram registrados **33 achados: 7 P1, 25 P2 e 1 P3**. Essa contagem mistura defeitos, riscos e melhorias explicitamente classificados abaixo; não significa 33 vulnerabilidades confirmadas. Não atribuo nota numérica de UX ou selo de segurança: faltam observação em aparelho e pesquisa com usuários para sustentar isso.

**Escopo e limites da evidência**

- Revisão do checkout atual, incluindo alterações ainda não commitadas: 12 telas, navegação, componentes, tema, autenticação, perfil, publicações, imagens, contato, notificações, Rules, Edge Functions, migrações, testes e configuração Android/iOS.
- O código atual foi revalidado; a revisão anterior serviu como pista. As 97 fontes citadas anteriormente não são um problema atual de carregamento: o hook agora carrega cinco Montserrat. Verificação de e-mail e confirmação de senha também já existem.
- Referência de plataforma: Expo ~57.0.28, React Native 0.86.3 e React 19.2.3; documentação versionada consultada. [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/).
- Foram realizados testes locais, reprodução de navegação, cálculo de contraste, consulta npm e exportação Android. Não houve criação de conta, envio de contato, upload de mídia de teste nem alteração de infraestrutura.
- Rules/migrações analisadas são locais. Não foi comprovado que correspondem às versões implantadas; configurações remotas de Auth, EmailJS, Cloudinary, Supabase, credenciais FCM/APNs, limites contratados e logs não foram inspecionados.
- A tentativa de inspeção com Computer Use foi interrompida porque a ferramenta não conseguiu determinar a URL do navegador com confiança suficiente. Não houve validação visual efetiva do aplicativo. Avaliações de layout são hipóteses fundamentadas no código; teclado, TalkBack/VoiceOver, câmera e entrega de push precisam de teste em aparelho.
- Não foram executados pentest remoto, auditoria do binário assinado, testes de carga, medição de FPS/tempo de abertura nem análise jurídica. A abrangência da revisão não elimina esses limites.
- A auditoria acrescenta documentação; não implementa as correções nem muda regras de negócio.

P1 = corrigir antes de ampliar uso ou no próximo ciclo imediato; P2 = resolver no ciclo seguinte, com prioridade por exposição e impacto; P3 = aperfeiçoamento. “Confirmado no código” não equivale a exploração comprovada no ambiente remoto.

**Referências atuais de produto e como foram usadas**

Consulta em 16/10/2026, App Store brasileira. As notas são gerais do aplicativo, variam por país/plataforma e não isolam qualidade de UX.

| Referência | Avaliação observada | Padrão relevante | Aplicação recomendada aqui |
|---|---:|---|---|
| [Airbnb](https://apps.apple.com/br/app/airbnb/id401626263) | 4,8/5; aproximadamente 92 mil avaliações | Refinamento de busca, identificação visual do anúncio e continuidade de contato | Filtros que podem ser editados, cartão reconhecível, mensagem ligada ao item e limites contra abuso |
| [Google Maps](https://apps.apple.com/br/app/google-maps/id585027354) | 4,8/5; aproximadamente 1,5 milhão | Busca principal, informação de local, navegação por tarefas e comportamento offline explicado | Local/horário de retirada, acesso claro à ajuda, resultados recentes com indicação de atualização |
| [Todoist](https://apps.apple.com/br/app/todoist-to-do-list-calend%C3%A1rio/id572688855) | 4,9/5; aproximadamente 22 mil avaliações | Inclusão objetiva e controle de lembretes | Formulário curto com rascunho, estados de progresso e preferências de notificação |

Os padrões foram consultados em documentação dos próprios produtos, ligada em cada recomendação. As adaptações são propostas desta auditoria; não são afirmações de que os produtos usam a mesma arquitetura interna nem prova de que copiar sua aparência melhorará o aplicativo. Para implementação e segurança, a base é documentação de Firebase/Expo/Supabase e OWASP; para acessibilidade, WCAG e Android.

**O que já está bem encaminhado**

| Área | Evidência atual | Recomendação para preservar o ganho |
|---|---|---|
| Acesso ao mural | Home é a rota inicial; visitante consulta sem cadastro | Manter descoberta sem barreira de login e dados públicos mínimos |
| Autenticação | Verificação de e-mail, confirmação de senha e conta pendente para repetir conclusão | Manter esses controles, acrescentando autorização administrativa real |
| Organização | Separação em services, providers, hooks, navigation e components | Evoluir contratos compartilhados sem reescrever o projeto |
| Fotos | Tratamento de cancelamento/negação, trava contra abertura duplicada, câmera interna de contingência e liberação de recursos de imagem | Preservar cobertura; corrigir a volta à mesma instância do formulário |
| Segurança de dados | Rules verificam proprietário em alteração/exclusão e restringem campos | Acrescentar papel e validações de domínio; testar as Rules reais |
| Push | Fila persistente, deduplicação de publicação, leases, recibos, backoff, tokens inválidos e recuperação por scanner | Preservar esse desenho e adicionar limites/observabilidade no contato |
| Supabase | RLS habilitada e privilégios de cliente revogados; RPCs reservadas ao service_role nas migrações | Confirmar grants e implantação; a chave privilegiada permanece só no servidor |
| Acessibilidade parcial | Safe areas, alguns labels, senha com botão acessível, toast anunciado e consideração de movimento reduzido | Expandir os mesmos cuidados para todas as telas |
| Fontes e imagens | Cinco fontes no hook; novas publicações recebem URL Cloudinary | Otimizar ativos e upload sem voltar a colocar imagens grandes no documento |
| Segurança nativa parcial | Android allowBackup=false, remoção de áudio; iOS NSAllowsArbitraryLoads=false; release não usa assinatura debug como fallback | Conferir o manifest/binário final e manter permissões mínimas |

**Validação executada**

| Verificação | Resultado e limite |
|---|---|
| Node local | v25.2.1; registrar versão suportada e reprodutível para CI |
| `node --test tests/*.test.cjs` | **56 testes, 56 aprovados, zero falhas**; são testes locais, não confirmação de serviços remotos |
| StackRouter instalado | **Falha A01 reproduzida**: segunda EditarItem criada somente com imagemRecebida, sem item original |
| Contraste relativo sRGB | Verde/branco 3,91:1; placeholders analisados entre 3,21:1 e 3,61:1; verde escuro existente/branco 5,73:1 |
| `expo install --check` | Sem incompatibilidades no mapa local; executado offline, com aviso do próprio Expo de validação limitada |
| `expo export --platform android` | **Aprovado com Hermes**, 1 bundle de cerca de 5,4 MB. Primeira tentativa falhou por permissão de gravação temporária no sandbox; repetição fora dele concluiu. Não é build APK/IPA nem prova de execução no aparelho |
| `npm audit --omit=dev` | Consulta online concluída: **31 entradas, 23 altas e 8 moderadas**, zero críticas. Ver A12 e [evidência JSON](C:/Users/USER/Programas/sistema_achadidos/docs/auditoria-dependencias-2026-10-16.json) |
| Deno/PGlite | Testes existentes foram lidos, mas não executados: Deno não foi encontrado no PATH. A suíte Node não os substitui |
| Navegador/aparelho/produção | Não validados; sem alegação de aprovação visual, push entregue ou conformidade de segurança |

A exportação também lista imagens locais de fallback de aproximadamente 1,1 MB (caderno) e 843 KB (estojo), além de cinco fontes que somam aproximadamente 1,7 MB. Vale otimizar esses ativos e verificar o que efetivamente entra no binário, mas esses números não demonstram lentidão percebida. Medir em aparelho intermediário antes/depois. O tamanho do bundle não é o tamanho do APK.

**Cobertura por tela e jornada**

| Tela/jornada | Avaliação e sugestão específica | Referência / achados |
|---|---|---|
| Mural/Home | Boa entrada pública e busca visível. Corrigir troca de filtro, hierarquia dos cartões, resultado parcial e ausência de retry; priorizar local/status | Airbnb e Google Maps; U01–U03, A02, A06 |
| Login | Boa alternativa Google/senha e senha visível sob comando. Distinguir rede, conta não verificada e credencial incorreta; explicar quem pode cadastrar | Google Maps; U08, S01 |
| Cadastro | Nome, confirmação de senha e verificação já presentes. Mostrar requisitos próximos aos campos, erro inline e acesso à política/ajuda | Todoist; U04, S09 |
| Recuperação de senha | Finalidade compreensível. Bloquear duplo envio, mostrar progresso e retorno neutro; no perfil, usar contexto da conta quando apropriado | Todoist; U08 |
| Perfil | Identidade visível e saída com reset de navegação. Adicionar rolagem, Ajuda/Privacidade/Notificações e correção administrada do nome; usar “Sair” | Google Maps; S07–S09, U07, U10–U12 |
| Criar item | Foto e categoria explícitas. Preservar rascunho e retorno da foto; tornar local/data/tipo estruturados se fizerem parte do processo | Todoist e Google Maps; A01, A07, U03–U04 |
| Editar item | Confirmação antes de excluir é um cuidado positivo. Unificar validação, corrigir foto, preservar item original e explicar estado de encerramento | Todoist; A01, A03, U03–U04 |
| Escolher imagem | Opções câmera/galeria e cancelamento disponíveis. Evitar nova instância do formulário; reavaliar necessidade de pedir acesso amplo à biblioteca conforme picker/OS e Expo 57 | [Expo 57: ImagePicker](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/); A01, U06 |
| Escolher imagem na edição | É um wrapper da seleção comum. Consolidar fluxo para evitar diferenças de parâmetros e testes duplicados pouco úteis | A01, A08 |
| Câmera interna | Foco de tela, tratamento de permissão e bloqueio de captura repetida. Adicionar revisão “Usar foto/Tirar outra” se teste com usuários justificar; validar retorno e retomada do app | A01, U06–U07 |
| Detalhe do item | Descrição e duas opções de contato são claras no código. Atualizar estado do item, mostrar retirada/encerramento, proteger contato e permitir examinar a foto com ampliação | Airbnb e Google Maps; S04, A04, U03, U09 |
| Minhas Publicações | Acesso às ações do autor. Filtrar por dono no servidor, separar erro de lista vazia e incluir arquivados/histórico se o processo exigir | Todoist; A02–A04, A06 |
| Modal de contato | Remetente de conta preenchido ajuda consistência. Resolver identidade/destinatário no servidor, preservar mensagem, adequar teclado/foco e explicar onde a resposta chega | Airbnb; S02–S03, U06–U07, U09 |
| Componentes e feedback | Há bases reutilizáveis. Padronizar contraste, semântica, estados e linguagem; erro informativo não deve ser vermelho por padrão | WCAG/Android; U05–U06, U12 |

**Achados detalhados**

**S01 · P1 · Autorização de publicador não comprova aprovação administrativa**

Confirmado no código; exploração remota não executada.

**Evidência e impacto:** [firestore.rules:9](C:/Users/USER/Programas/sistema_achadidos/firestore.rules:9) e [src/utils/permissoes.js:1](C:/Users/USER/Programas/sistema_achadidos/src/utils/permissoes.js:1) permitem publicar para qualquer e-mail verificado que não termine no domínio discente. [src/services/auth.js:106](C:/Users/USER/Programas/sistema_achadidos/src/services/auth.js:106) limita o cadastro apenas no cliente. Um usuário não discente criado por outro cliente/REST, se permitido na configuração remota de Auth, satisfaz a regra mesmo sem ter sido aprovado pela administração. A condição inadequada nas Rules existe independentemente da interface.

**Sugestão:** Autorizar por um papel emitido exclusivamente pela administração, como publisher, ou por uma lista de UIDs protegida contra escrita de clientes. Manter a regra de que discentes não publicam, sem equiparar “não discente” a “servidor autorizado”. Uma lista administrada no Firebase é alternativa que não exige habilitar serviços pagos.

**Critério de aceite:** Testar Rules no emulador com visitante, discente, externo verificado sem papel, publicador autorizado e proprietário diferente. Apenas o papel autorizado cria; somente o dono autorizado altera/exclui. Conferir as Rules efetivamente implantadas.

**Base:** [Firebase: papéis e custom claims](https://firebase.google.com/docs/auth/admin/custom-claims)

---

**S02 · P1 · Contato permite parâmetros de identidade e destinatário controlados pelo cliente**

Confirmado no código; controles externos do EmailJS não inspecionados.

**Evidência e impacto:** [src/services/contato.js:14](C:/Users/USER/Programas/sistema_achadidos/src/services/contato.js:14) chama diretamente o EmailJS e envia to_email, from_name, from_email e reply_to. Travar os campos na tela protege contra edição casual, mas não obriga outro cliente a usar a identidade Firebase. O header origin configurado pelo cliente não é mecanismo de autorização. O impacto depende de como o template e as restrições do serviço estão configurados.

**Sugestão:** Criar uma operação confiável de contato: receber itemId e mensagem; resolver dono/destino no servidor; derivar remetente autenticado do token/perfil. Para visitante, identificar explicitamente “contato não verificado” e usar verificação ou desafio e limites de envio. Confirmar a operação e só então produzir o aviso push. Definir onde essa operação ficará respeitando Firebase para cadastro/itens e Supabase somente para push; não ampliar essa fronteira silenciosamente.

**Critério de aceite:** Requisição com destinatário adulterado, nome forjado e item inexistente deve ser recusada ou ignorar os campos manipulados. Uma mesma operação repetida não deve enviar duas mensagens. Visitante legítimo deve continuar tendo um caminho acessível.

**Base:** [Airbnb: mensagens](https://www.airbnb.com/help/article/145); [EmailJS: chave pública é pública por projeto](https://www.emailjs.com/docs/faq/is-it-okay-to-expose-my-public-key/). O achado não é a presença da chave pública.

---

**S03 · P1 · Avisos de contato podem ser produzidos sem envio de e-mail**

Confirmado no código e nas migrações locais; implantação não verificada.

**Evidência e impacto:** [supabase/functions/_shared/api.ts:20](C:/Users/USER/Programas/sistema_achadidos/supabase/functions/_shared/api.ts:20) emite sessões anônimas; a ação contact em [supabase/functions/_shared/api.ts:34](C:/Users/USER/Programas/sistema_achadidos/supabase/functions/_shared/api.ts:34) aceita essa sessão e não recebe confirmação de envio. [supabase/migrations/20261016031003_contact_push_every_message.sql:8](C:/Users/USER/Programas/sistema_achadidos/supabase/migrations/20261016031003_contact_push_every_message.sql:8) cria um UUID novo por chamada, sem limite local. O worker anuncia que chegou um e-mail. Assim, uma chamada direta pode gerar alerta falso, repetição e crescimento da fila.

**Sugestão:** Emitir evento de contato apenas a partir da operação de envio confirmada. Usar ID idempotente por mensagem, limites por origem/destinatário e janela temporal, com proteção adicional para sessões anônimas. Preservar um alerta por mensagem legítima; deduplicação não deve descartar mensagens distintas.

**Critério de aceite:** Repetir a mesma operação gera um evento; duas mensagens diferentes geram dois. Chamar contact sem comprovante válido de envio não gera notificação. Simular rajada em ambiente de teste sem disparar e-mails ou pushes reais.

**Base:** [Airbnb: mensagens](https://www.airbnb.com/help/article/145); [Supabase: RLS e privilégios](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

**S04 · P1 · Endereço de e-mail do publicador está em documentos públicos**

Confirmado nas Rules locais e no formato dos documentos.

**Evidência e impacto:** [firestore.rules:65](C:/Users/USER/Programas/sistema_achadidos/firestore.rules:65) permite leitura pública de itens; [src/services/publicacoes.js:59](C:/Users/USER/Programas/sistema_achadidos/src/services/publicacoes.js:59) inclui userEmail e userId no mesmo documento. [src/screens/ItemFullScreen.js:264](C:/Users/USER/Programas/sistema_achadidos/src/screens/ItemFullScreen.js:264) também mostra contato. Quem consulta o mural pode coletar esses e-mails em lote; esconder apenas o Text não muda a exposição.

**Sugestão:** Separar dados públicos do item e contato privado. Manter o mural aberto, resolver o destinatário na operação de contato e mostrar identificação institucional ou nome aprovado em vez do e-mail pessoal. Decidir e documentar quais identificadores precisam ser públicos.

**Critério de aceite:** Leitura anônima continua retornando descrição/foto/categoria, mas nunca e-mail do dono nem contato privado; teste deve examinar a resposta da API, não só a tela.

**Base:** [Firestore: acesso a campos](https://firebase.google.com/docs/firestore/security/rules-fields)

---

**S05 · P2 · Upload público precisa de controles próprios**

Integração unsigned confirmada; configuração e limites remotos não verificados.

**Evidência e impacto:** [src/services/storageCloudinary.js:1](C:/Users/USER/Programas/sistema_achadidos/src/services/storageCloudinary.js:1) envia arquivo com cloud name e upload preset públicos, sem assinatura/autorização do publicador. Quem conhecer o preset pode tentar uploads fora do formulário. As checagens de tamanho no app não limitam esse outro cliente.

**Sugestão:** Conferir no Cloudinary tipos, tamanho máximo, destino, sobrescrita e transformações aceitas. Preferir autorização curta para upload associada a um publicador aprovado quando houver backend apropriado; manter segredo de assinatura fora do app. Definir teto operacional e monitorar quota sem habilitar cobrança.

**Critério de aceite:** Arquivo inválido ou acima do limite é rejeitado pelo serviço, inclusive fora do app. O preset não permite alteração de ativos existentes. Registrar a configuração efetiva, sem revelar segredos.

**Base:** [Cloudinary: segurança dos presets](https://cloudinary.com/documentation/upload_presets)

---

**S06 · P2 · Rules não impõem todos os limites de conteúdo e transições**

Confirmado no código.

**Evidência e impacto:** [firestore.rules:16](C:/Users/USER/Programas/sistema_achadidos/firestore.rules:16) exige tipos e categoria, mas não limita adequadamente título/descrição, aceita imageUrl como string genérica e expiraEm como número qualquer. O cliente usa validações mais fortes. Uma escrita direta autorizada pode criar conteúdo diferente do que o formulário permite.

**Sugestão:** Definir contrato único: limites de caracteres/bytes, imagem HTTPS da origem aceita para novos itens, campos obrigatórios e transições de status com tempos válidos. Planejar compatibilidade para itens antigos antes de restringir base64. Acrescentar limites de publicação por conta se o volume exigir.

**Critério de aceite:** Casos negativos das Rules rejeitam título gigante, descrição vazia onde obrigatória, URL não permitida e expiração arbitrária; casos de migração legítimos continuam aceitos.

**Base:** [Firestore: acesso a campos](https://firebase.google.com/docs/firestore/security/rules-fields); [OWASP MASVS](https://mas.owasp.org/MASVS/)

---

**S07 · P2 · Vínculo de push pessoal pode sobreviver a logout sem rede**

Risco inferido da sequência de código; necessita teste em aparelho.

**Evidência e impacto:** [src/services/auth.js:134](C:/Users/USER/Programas/sistema_achadidos/src/services/auth.js:134) executa signOut; [src/providers/AuthProvider.js:18](C:/Users/USER/Programas/sistema_achadidos/src/providers/AuthProvider.js:18) troca o observador; [src/services/notifications.js:57](C:/Users/USER/Programas/sistema_achadidos/src/services/notifications.js:57) precisa concluir registro remoto para desvincular firebase_uid. Se isso falhar e o app fechar, o servidor pode continuar relacionando o dispositivo à conta anterior. O worker verifica o vínculo que está no banco, não o logout local.

**Sugestão:** Separar assinatura de avisos públicos do vínculo de contatos pessoais. Persistir uma pendência de desvinculação e sincronizá-la antes de registrar outra conta; usar prazo de validade do vínculo pessoal no servidor. Reduzir detalhes privados na tela bloqueada. Não prometer revogação instantânea sem conectividade.

**Critério de aceite:** Sair offline, fechar o app, reconectar e trocar de conta em aparelho compartilhado; observar se chega contato da conta anterior. Garantir que avisos públicos possam continuar conforme preferência do usuário.

**Base:** [Expo 57: notificações](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/); [OWASP MASVS](https://mas.owasp.org/MASVS/)

---

**S08 · P2 · Capacidade de instalação não expira e fica em armazenamento sem criptografia**

Endurecimento; não equivale a credencial administrativa exposta.

**Evidência e impacto:** [supabase/functions/_shared/core.ts:56](C:/Users/USER/Programas/sistema_achadidos/supabase/functions/_shared/core.ts:56) gera capability sem exp; [src/services/notifications.js:25](C:/Users/USER/Programas/sistema_achadidos/src/services/notifications.js:25) persiste sessão/token no AsyncStorage. O escopo é limitado, mas perda dessa capability permite operações da instalação. A configuração de Auth também usa a persistência oficial com AsyncStorage; não foi demonstrada extração de credenciais.

**Sugestão:** Avaliar SecureStore para a capability própria, rotação e prazo de validade compatível com uso visitante. Limitar seus poderes e separar o comprovante de contato. Não substituir a persistência Firebase com solução improvisada; documentar o modelo de ameaça do dispositivo e a estratégia suportada.

**Critério de aceite:** Após revogação/rotação, a capability antiga não registra nem desativa a instalação atual; dados não aparecem em logs. Testar reinstalação e recuperação.

**Base:** [React Native: armazenamento seguro](https://reactnative.dev/docs/security); [OWASP MASVS](https://mas.owasp.org/MASVS/)

---

**S09 · P2 · Falta um ciclo explícito de retenção e atendimento à privacidade**

Ausência no código auditado; não prova inexistência de processo institucional externo.

**Evidência e impacto:** [src/screens/PerfilScreen.js:33](C:/Users/USER/Programas/sistema_achadidos/src/screens/PerfilScreen.js:33) oferece somente senha e saída. Não foi localizado fluxo de exclusão/solicitação de dados, política de privacidade, denúncia ou correção de nome. As Rules de perfis proíbem update/delete pelo cliente; eventos/tokens não têm rotina de retenção visível nas migrações examinadas.

**Sugestão:** Incluir Privacidade e Ajuda no perfil; explicar finalidade e compartilhamento com Firebase, Cloudinary, EmailJS e serviços de push. Criar solicitação de correção/exclusão administrada, preservando o nome não editável no contato. Definir prazos para publicações resolvidas, mídia, tokens e eventos, com procedimento e responsável. Esta é recomendação de produto e segurança, não parecer jurídico.

**Critério de aceite:** Usuário encontra canal de solicitação e recebe protocolo; uma conta de teste é removida/anonimizada de todos os sistemas previstos pela política, com exceções justificadas e verificadas.

**Base:** [OWASP MASVS](https://mas.owasp.org/MASVS/); [Google Maps: organização e navegação](https://support.google.com/maps/answer/144349?hl=en)

---

**A01 · P1 · Voltar da foto cria outra tela e perde o contexto do formulário**

Reproduzido com o StackRouter instalado.

**Evidência e impacto:** [src/screens/EscolherImagemScreen.js:39](C:/Users/USER/Programas/sistema_achadidos/src/screens/EscolherImagemScreen.js:39) e [src/screens/CameraItemScreen.js:50](C:/Users/USER/Programas/sistema_achadidos/src/screens/CameraItemScreen.js:50) usam navigate(origem, { imagemRecebida }). Na versão 7, o teste gerou Home → EditarItem(item) → EscolherImagem → EditarItem(imagemRecebida). A última rota não tem item. [src/screens/EditarItemScreen.js:30](C:/Users/USER/Programas/sistema_achadidos/src/screens/EditarItemScreen.js:30) depende dele e [src/screens/CadastrarItemScreen.js:26](C:/Users/USER/Programas/sistema_achadidos/src/screens/CadastrarItemScreen.js:26) mantém texto só no estado local.

**Sugestão:** Retornar à instância original com popTo/ação direcionada apropriada, preservando parâmetros e rascunho; compartilhar o mesmo caminho para câmera externa, câmera interna e galeria. Não passar a imagem grande por múltiplas rotas quando uma referência local puder bastar.

**Critério de aceite:** Preencher todos os campos, escolher/tirar/trocar/cancelar foto e voltar: título, descrição, categoria e ID permanecem. A pilha contém uma única instância do formulário. Adicionar teste com router real, não apenas mock de navigate.

**Base:** [React Navigation 7: mudanças de navegação](https://reactnavigation.org/docs/upgrading-from-6.x/)

---

**A02 · P2 · Mural e Minhas Publicações baixam mais dados que o necessário**

Confirmado no código; impacto quantitativo ainda não medido.

**Evidência e impacto:** [src/services/publicacoes.js:184](C:/Users/USER/Programas/sistema_achadidos/src/services/publicacoes.js:184) assina integralmente itens e item. [src/services/publicacoes.js:318](C:/Users/USER/Programas/sistema_achadidos/src/services/publicacoes.js:318) lê a coleção inteira e filtra dono no cliente, embora exista observador por userId. A tela repete a leitura a cada foco. FlatList virtualiza renderização, mas não reduz documentos transferidos.

**Sugestão:** Consolidar a coleção canônica e usar paginação com ordem estável, limit e cursor; em Minhas, filtrar por UID no servidor. Definir busca global compatível com paginação, para não restringir silenciosamente a pesquisa à página carregada. Medir leituras e bytes antes de contratar um serviço de busca.

**Critério de aceite:** Com grande conjunto de teste, abertura faz quantidade limitada de leituras; carregar próxima página não repete nem omite itens. Busca encontra um item que não estava na primeira página.

**Base:** [Firestore: paginação](https://firebase.google.com/docs/firestore/query-data/query-cursors); [Airbnb: filtros](https://www.airbnb.com/help/article/479)

---

**A03 · P2 · Remoção automática em 24 horas é apenas ocultação local**

Confirmado no código.

**Evidência e impacto:** [src/services/publicacoes.js:146](C:/Users/USER/Programas/sistema_achadidos/src/services/publicacoes.js:146) usa Date.now para calcular expiração; [src/screens/HomeScreen.js:348](C:/Users/USER/Programas/sistema_achadidos/src/screens/HomeScreen.js:348) filtra com useMemo, sem relógio que invalide a lista ao vencer o prazo. [src/services/publicacoes.js:106](C:/Users/USER/Programas/sistema_achadidos/src/services/publicacoes.js:106) busca itens expirados normalmente. A mensagem em [src/screens/EditarItemScreen.js:85](C:/Users/USER/Programas/sistema_achadidos/src/screens/EditarItemScreen.js:85) promete remoção automática.

**Sugestão:** Definir estados explícitos e autoridade de tempo no servidor: disponível, devolvido e arquivado, por exemplo. Explicitar a diferença entre sair do mural e apagar dados. Atualizar o estado ao retomar o app e bloquear/explicar contato com item encerrado; uma rotina de limpeza é decisão separada, sujeita ao limite de custo.

**Critério de aceite:** Alterar relógio do aparelho não altera a regra de negócio. Permanecer na tela além do prazo, abrir link/push antigo e tentar contato deve produzir comportamento coerente. A política e o texto da UI correspondem ao que acontece no banco.

**Base:** [Todoist: inclusão rápida](https://www.todoist.com/help/todoist/features/use-task-quick-add-in-todoist-va4Lhpzz); [Firestore: acesso a campos](https://firebase.google.com/docs/firestore/security/rules-fields)

---

**A04 · P2 · Detalhe usa cópia do item; formatos antigos divergem**

Confirmado no código.

**Evidência e impacto:** [src/screens/ItemFullScreen.js:108](C:/Users/USER/Programas/sistema_achadidos/src/screens/ItemFullScreen.js:108) usa route.params.item sem buscar a versão atual. Há normalizadores diferentes no mural e em publicacoes.js. O mural lê duas coleções, enquanto listarMinhasPublicacoes só lê itens. Isso permite detalhe desatualizado e item legado visível no mural sem aparecer na gestão do autor.

**Sugestão:** Navegar com itemId e coleção, exibir cache inicial e revalidar. Criar um modelo canônico com uma única adaptação de legado e plano de migração. Exibir indisponibilidade quando outro dispositivo excluir/resolver o item.

**Critério de aceite:** Abrir detalhe, alterar/excluir por outra sessão e retomar a tela: refletir o estado atual. Um item legado pertencente ao usuário é gerenciável ou tem caminho explícito de migração.

**Base:** [Google Maps: organização e navegação](https://support.google.com/maps/answer/144349?hl=en)

---

**A05 · P2 · Mídia fica órfã e o processamento ainda segue o limite antigo do documento**

Confirmado no código; consumo real não medido.

**Evidência e impacto:** [src/services/publicacoes.js:136](C:/Users/USER/Programas/sistema_achadidos/src/services/publicacoes.js:136) substitui a URL sem apagar a foto anterior; [src/services/publicacoes.js:168](C:/Users/USER/Programas/sistema_achadidos/src/services/publicacoes.js:168) apaga só o documento. [src/services/storageCloudinary.js:19](C:/Users/USER/Programas/sistema_achadidos/src/services/storageCloudinary.js:19) retorna URL e deleteToken temporário, sem persistir public_id. [src/services/imagens.js:15](C:/Users/USER/Programas/sistema_achadidos/src/services/imagens.js:15) tenta várias compressões em base64, ainda com orçamento do Firestore, embora novos itens salvem URL.

**Sugestão:** Persistir identificador do ativo e planejar limpeza autorizada/retry após exclusão/substituição. Usar URI de arquivo e resolução adequada ao produto no upload; gerar miniatura e imagem de detalhe, evitando várias recodificações desnecessárias. Manter compensação quando gravação do item falhar.

**Critério de aceite:** Substituir/excluir item de teste remove ou agenda a mídia antiga; upload cujo salvamento falha não deixa ativo sem dono. Medir tempo/memória com foto grande e qualidade de leitura de detalhes.

**Base:** [Cloudinary: segurança dos presets](https://cloudinary.com/documentation/upload_presets)

---

**A06 · P2 · Estados de falha e modo offline não sustentam recuperação**

Confirmado em UI e configuração; suporte offline completo não foi testado.

**Evidência e impacto:** [src/screens/HomeScreen.js:556](C:/Users/USER/Programas/sistema_achadidos/src/screens/HomeScreen.js:556) tem erro sem ação de tentar novamente e só reconhece falha total das duas coleções. [src/screens/MinhasPublicacoesScreen.js:110](C:/Users/USER/Programas/sistema_achadidos/src/screens/MinhasPublicacoesScreen.js:110) mostra alerta e depois pode exibir “Você ainda não publicou”. [src/lib/firebase.js:33](C:/Users/USER/Programas/sistema_achadidos/src/lib/firebase.js:33) não configura explicitamente um cache persistente para dados; o SDK pode oferecer cache em memória, o que não prova recuperação após reiniciar.

**Sugestão:** Separar loading, empty, error, partial e stale; preservar último resultado, mostrar atualização pendente e oferecer retry. Para o MVP, manter rascunho local e leitura recente claramente marcada. Só prometer escrita offline após tratar reconciliação e idempotência.

**Critério de aceite:** Testar sem rede no início e após carregar, falha de uma coleção, retorno da rede e reinício. Falha nunca aparece como ausência de publicação e texto já digitado permanece.

**Base:** [Google Maps: uso offline](https://support.google.com/maps/answer/6291838?hl=en)

---

**A07 · P2 · Repetição de operação não tem identidade estável de publicação**

Risco de confiabilidade; duplicação não reproduzida nesta sessão.

**Evidência e impacto:** [src/services/publicacoes.js:83](C:/Users/USER/Programas/sistema_achadidos/src/services/publicacoes.js:83) cria novo ID a cada chamada e faz upload antes da escrita; [src/screens/CadastrarItemScreen.js:35](C:/Users/USER/Programas/sistema_achadidos/src/screens/CadastrarItemScreen.js:35) depende do estado visual publicando para bloquear interação. Um resultado de rede ambíguo seguido de nova tentativa pode repetir a operação. Contato tem problema equivalente já tratado em S03.

**Sugestão:** Criar ID de rascunho/operação estável antes do upload; bloquear chamadas concorrentes com trava imediata; reconciliar o mesmo ID após timeout. Definir estados de progresso compreensíveis: preparando imagem, enviando e concluindo.

**Critério de aceite:** Simular duplo toque e perda de resposta após a gravação: uma publicação e um ativo final, com recuperação pelo mesmo ID. Evitar que o usuário reinicie todo o formulário.

**Base:** [Todoist: inclusão rápida](https://www.todoist.com/help/todoist/features/use-task-quick-add-in-todoist-va4Lhpzz)

---

**A08 · P2 · Modularização existe, mas regras de domínio continuam duplicadas**

Confirmado no código.

**Evidência e impacto:** [src/services/publicacoes.js:215](C:/Users/USER/Programas/sistema_achadidos/src/services/publicacoes.js:215) e [src/screens/HomeScreen.js:57](C:/Users/USER/Programas/sistema_achadidos/src/screens/HomeScreen.js:57) têm normalizações diferentes; formulário de criação/edição e headers repetem partes de layout. [App.js:15](C:/Users/USER/Programas/sistema_achadidos/App.js:15) bloqueia o app se fontes falharem. O tema define tipografia, mas muitas telas usam valores independentes.

**Sugestão:** Manter a arquitetura atual e extrair incrementos pequenos: modelo de item, componentes Field/Button/ScreenHeader/ItemCard e formulário compartilhado. Acrescentar fronteira de erro com recuperação e fonte de sistema como fallback. Tipar contratos críticos antes de uma migração ampla para TypeScript.

**Critério de aceite:** As mesmas regras são exercitadas por criar/editar/detalhe/legado; falha de fonte ou de uma tela oferece recuperação. Alterar o token de texto de botão atualiza todos os botões.

**Base:** [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/); [Android: acessibilidade](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views)

---

**A09 · P1 · Alvo Firebase de CLI diverge do aplicativo**

Confirmado na configuração local.

**Evidência e impacto:** [.firebaserc:3](C:/Users/USER/Programas/sistema_achadidos/.firebaserc:3) aponta o projeto default system-achadidos, enquanto [src/lib/firebase.js:13](C:/Users/USER/Programas/sistema_achadidos/src/lib/firebase.js:13) usa achadidos-15d82. Executar um deploy confiando no default pode alterar outro projeto ou deixar o app sem as Rules esperadas.

**Sugestão:** Alinhar aliases de ambiente e exigir ID explícito nos comandos de implantação e na documentação. Antes de publicar Rules, conferir alvo e fazer backup/revisão. Não executar mudança remota como parte desta auditoria.

**Critério de aceite:** Script/preflight falha em caso de divergência; evidência do ambiente implantado liga app, Auth, Firestore e credencial do worker ao projeto correto.

**Base:** [Firebase: papéis e custom claims](https://firebase.google.com/docs/auth/admin/custom-claims)

---

**A10 · P2 · Configuração nativa e versão precisam de uma fonte de verdade**

Confirmado no checkout; build assinado não examinado.

**Evidência e impacto:** [app.json:8](C:/Users/USER/Programas/sistema_achadidos/app.json:8) declara 1.0.2; [android/app/build.gradle:108](C:/Users/USER/Programas/sistema_achadidos/android/app/build.gradle:108) tem versionCode 1/versionName 1.0 e [ios/systemachadidos.xcodeproj/project.pbxproj:259](C:/Users/USER/Programas/sistema_achadidos/ios/systemachadidos.xcodeproj/project.pbxproj:259) usa build 1/marketing 1.0. O início do Expo também avisou ausência de URI scheme comum ao dev client. Há diretórios nativos mantidos, portanto editar app.json não garante todas as mudanças no binário.

**Sugestão:** Definir se os nativos são mantidos manualmente ou gerados de forma controlada. Versionar build numbers e revisar diferenças de configuração, scheme, OAuth e push antes de release. Não apagar/regenerar diretórios nativos sem preservar customizações.

**Critério de aceite:** Conferir manifest/Info.plist do APK/IPA assinado, versão exibida e callback OAuth. Testar abertura por notificação em app fechado e em segundo plano. A exportação JS não substitui esse aceite.

**Base:** [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/); [Expo 57: notificações](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/)

---

**A11 · P2 · Testes atuais não cobrem os limites de segurança e os fluxos reais**

Confirmado pela suíte disponível.

**Evidência e impacto:** Os 56 testes Node passaram, mas usam mocks de serviços/navegação em partes relevantes. Existem testes Deno/PGlite, que não foram executados nesta sessão. Não foi encontrada pasta .github com CI, nem scripts test/lint no package.json. A reprodução do A01 mostra uma lacuna concreta apesar da suíte verde.

**Sugestão:** Automatizar testes existentes, emulador de Rules, contrato de contato e router real. Acrescentar poucos fluxos de integração de maior valor e smoke tests nativos. Fazer pipeline reproduzível que separe JS, Rules, Deno/SQL e binário, mantendo a restrição de custos.

**Critério de aceite:** Pipeline falha ao reintroduzir A01/S01/S03; testes de acesso negado não dependem de função utilitária do cliente. Registrar versão/ambiente e evidência de execução.

**Base:** [OWASP MASVS](https://mas.owasp.org/MASVS/)

---

**A12 · P2 · Dependências têm alertas que exigem triagem, não atualização forçada**

Resultado da consulta npm nesta sessão.

**Evidência e impacto:** npm audit --omit=dev reportou 31 entradas: 23 high e 8 moderate; zero critical. Há propagação por Expo/Metro/React Native e pacote Node gRPC, além de node-forge, braces e uuid. Isso não significa 31 falhas independentes exploráveis no celular; dependências de tooling podem aparecer em dependencies. O npm sugeriu inclusive downgrades incompatíveis com a linha atual.

**Sugestão:** Mapear cada advisory ao caminho realmente executado: build/CI, servidor Node ou bundle móvel. Atualizar patches compatíveis com Expo 57, acompanhando mantenedores. Não usar npm audit fix --force nem downgrade automático do Firebase/Reanimated. Registrar exceções temporárias justificadas e prazo de revisão.

**Critério de aceite:** Inventário identifica pacote, versão, advisory, alcance e mitigação; atualização passa export e fluxos nativos. Não declarar app livre de vulnerabilidades apenas pela contagem do npm.

**Base:** [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/); [advisory do mantenedor gRPC](https://github.com/grpc/grpc-node/security/advisories/GHSA-m9gg-hp2v-232j)

---

**U01 · P2 · Filtro não reabre com categoria selecionada**

Confirmado pela condição de renderização.

**Evidência e impacto:** [src/screens/HomeScreen.js:257](C:/Users/USER/Programas/sistema_achadidos/src/screens/HomeScreen.js:257) exige filterOpen && !activeFilter. Tocar Filtrar com categoria ativa muda o estado/ícone, mas mantém as opções invisíveis. É preciso remover o filtro antes de trocar.

**Sugestão:** Permitir reabrir sempre, marcar a categoria atual e oferecer Limpar filtros e quantidade de resultados. Para poucos filtros, chips ou painel simples bastam; não copiar a complexidade de filtros de viagens.

**Critério de aceite:** Selecionar Eletrônicos, reabrir e trocar para Chaves em sequência direta, com seleção anunciada ao leitor de tela.

**Base:** [Airbnb: filtros](https://www.airbnb.com/help/article/479)

---

**U02 · P2 · Cartões privilegiam descrição longa e truncam o reconhecimento do item**

Escolha de layout confirmada; impacto de uso precisa de teste.

**Evidência e impacto:** [src/screens/HomeScreen.js:382](C:/Users/USER/Programas/sistema_achadidos/src/screens/HomeScreen.js:382) mantém duas colunas mesmo em telas pequenas; título tem uma linha, descrição cinco e imagem 104 de altura. Categoria/data usam 11–12. Em 320 de largura, cada cartão recebe aproximadamente 138 antes do padding, reduzindo texto e foto útil.

**Sugestão:** Priorizar foto, título em até duas linhas, local/data e status; reduzir descrição no cartão. Oferecer uma coluna quando largura ou escala de fonte exigir, e largura máxima no desktop. Testar exemplo real “Garrafa térmica azul com adesivo” antes de escolher densidade.

**Critério de aceite:** Em 320/360/390 e texto a 200%, título e ação continuam utilizáveis; usuários identificam itens sem abrir vários cartões apenas para ler o título.

**Base:** [Airbnb: filtros](https://www.airbnb.com/help/article/479); [Google Maps: organização e navegação](https://support.google.com/maps/answer/144349?hl=en)

---

**U03 · P2 · Taxonomia não distingue claramente achado, perdido e devolvido**

Confirmado no modelo; proposta depende de validar vocabulário institucional.

**Evidência e impacto:** O formulário pede descrição de onde encontrou ou perdeu, mas não armazena tipo de ocorrência/local/data separadamente. O status disponível/achado é usado para encerramento e o detalhe continua dizendo “Esse item é seu?” sem apresentar o estado. O mural consegue ler local legado, mas o formulário atual não coleta esse campo.

**Sugestão:** Separar tipo da ocorrência de situação do atendimento. Se o produto aceita apenas objetos encontrados, assumir essa regra explicitamente. Usar “Devolvido ao dono” ou “Caso resolvido” para encerramento, com local de retirada, horário e data apropriados. Evitar publicar detalhes secretos usados para comprovar propriedade.

**Critério de aceite:** Uma pessoa explica o estado do objeto sem ajuda, sabe onde buscar e não confunde “achado” com “já devolvido”. Itens encerrados não incentivam contato inadequado.

**Base:** [Google Maps: organização e navegação](https://support.google.com/maps/answer/144349?hl=en)

---

**U04 · P2 · Formulários precisam de validação próxima ao campo e rascunho**

Confirmado no fluxo; aparência final não inspecionada.

**Evidência e impacto:** [src/screens/CadastrarItemScreen.js:35](C:/Users/USER/Programas/sistema_achadidos/src/screens/CadastrarItemScreen.js:35) valida sequencialmente via alertas; criar exige descrição/foto e editar não aplica exatamente o mesmo conjunto. Não foi localizado guard de saída ou persistência de rascunho. Usuário perde trabalho ao sair; isso é independente do bug A01.

**Sugestão:** Exibir erro abaixo do campo e focar o primeiro inválido; informar limites e obrigatoriedade antes do envio. Compartilhar validação criar/editar, preservar rascunho e pedir decisão ao sair com alterações. Manter nome da conta bloqueado onde exigido.

**Critério de aceite:** Corrigir todos os campos sem série de modais; voltar/reabrir mantém rascunho; falha de rede não apaga preenchimento. Salvar exige o mesmo contrato documentado nas duas telas.

**Base:** [Todoist: inclusão rápida](https://www.todoist.com/help/todoist/features/use-task-quick-add-in-todoist-va4Lhpzz)

---

**U05 · P1 · Contraste insuficiente em textos pequenos e placeholders**

Medição matemática dos pares de cor do código, sem simulação visual.

**Evidência e impacto:** [src/styles/colors.js:2](C:/Users/USER/Programas/sistema_achadidos/src/styles/colors.js:2) define #059600. Branco sobre esse verde, e o inverso, têm 3,91:1. Os botões de 14–15 usam esse par. #8a8a8a sobre branco tem 3,45:1; #7f8a7b, 3,61:1; #8a9286, 3,21:1. Não são suficientes para texto pequeno no alvo WCAG AA. Isso não implica que todo cabeçalho grande reprove.

**Sugestão:** Usar verde de ação mais escuro: o #007722 já existente atinge 5,73:1 com branco. Manter o verde vivo em áreas decorativas quando adequado. Escurecer placeholders e revisar estados selecionado/foco/erro, preservando identidade visual.

**Critério de aceite:** Todos os pares de texto pequeno habilitado atingem 4,5:1; texto grande segue seu critério específico. Registrar pares reais sobre fundos reais e complementar com teste de ampliação.

**Base:** [WCAG 2.2: contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

---

**U06 · P2 · Semântica acessível e alvos de toque são inconsistentes**

Confirmado em propriedades; leitor de tela ainda não testado.

**Evidência e impacto:** Há bons labels no mural e câmera, mas botões de voltar/adicionar/publicar em algumas telas e campos de e-mail/título/descrição não têm a mesma cobertura. O fechar do modal de contato em ItemFullScreen:334 tem ícone 24 sem label/hitSlop. O estado selected do filtro no mural não é exposto. Texto adjacente não garante nome acessível associado em todas as plataformas.

**Sugestão:** Padronizar nome, papel, estado busy/disabled/selected e ordem de foco. Adotar alvo móvel de 48×48 como referência Android, com espaçamento. Gerir foco na abertura/fechamento de modais e anunciar erros/resultados. A WCAG web de alvo mínimo 24 CSS px não é a mesma medida recomendada para UI móvel.

**Critério de aceite:** Concluir pesquisa, filtro, cadastro, foto e contato só com TalkBack/VoiceOver; fechar modal retorna ao controle que abriu. Em web, repetir com teclado e foco visível.

**Base:** [Android: acessibilidade](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views); [WCAG 2.2: tamanho mínimo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)

---

**U07 · P2 · Teclado, texto ampliado e telas baixas têm cobertura desigual**

Risco de layout, não reprodução visual.

**Evidência e impacto:** Login/cadastro/criar usam KeyboardAwareScrollView; editar usa KeyboardAvoidingView, contato usa Modal + ScrollView comum e Perfil é View sem rolagem. Há campos com height 55 e hero de detalhe com 370 fixos. Essas escolhas precisam ser testadas com teclado, orientação e fontes grandes.

**Sugestão:** Aplicar estratégia consistente de foco/rolagem no formulário de edição e contato; permitir rolagem no perfil; usar minHeight e limites proporcionais onde adequado. No detalhe, manter status/ação acessíveis sem uma imagem desproporcional dominar telas baixas.

**Critério de aceite:** Em aparelho pequeno, paisagem e texto a 200%, campo focado e Enviar/Salvar ficam alcançáveis, sem cortes. Testar teclado Android/iOS real e não apenas web.

**Base:** [Android: acessibilidade](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views); [Google Maps: organização e navegação](https://support.google.com/maps/answer/144349?hl=en)

---

**U08 · P2 · Login, recuperação e Google precisam distinguir erro de cancelamento**

Confirmado no código.

**Evidência e impacto:** [src/screens/LoginScreen.js:45](C:/Users/USER/Programas/sistema_achadidos/src/screens/LoginScreen.js:45) converte quase todo erro em “E-mail ou senha inválido”, inclusive rede/perfil. [src/screens/AlterarSenhaScreen.js:20](C:/Users/USER/Programas/sistema_achadidos/src/screens/AlterarSenhaScreen.js:20) não tem estado de envio para impedir múltiplos pedidos. [src/services/googleAuth.js:42](C:/Users/USER/Programas/sistema_achadidos/src/services/googleAuth.js:42) trata cancelled como acesso incompleto e mensagem de suporte; o mesmo retorno pode resultar de cancelamento normal.

**Sugestão:** Mostrar erros de rede com retry e credenciais inválidas com orientação apropriada; usar validação inline. Na recuperação, desabilitar durante envio e adotar resposta neutra com instruções. Separar cancelamento esperado de falha diagnosticável de configuração Google. Trocar “Alterar” por “Recuperar senha” no login e explicar acesso administrativo para não discentes antes da tentativa.

**Critério de aceite:** Desconectar rede não acusa senha errada; duplo toque gera um pedido; cancelar Google não provoca alarme enganoso. Nova tentativa fica disponível sem reiniciar o app.

**Base:** [Todoist: inclusão rápida](https://www.todoist.com/help/todoist/features/use-task-quick-add-in-todoist-va4Lhpzz); [Google Maps: organização e navegação](https://support.google.com/maps/answer/144349?hl=en)

---

**U09 · P2 · Contato não oferece continuidade nem estados de entrega claros**

Confirmado no desenho da interação.

**Evidência e impacto:** [src/screens/ItemFullScreen.js:168](C:/Users/USER/Programas/sistema_achadidos/src/screens/ItemFullScreen.js:168) envia e-mail e, depois, tenta push separado. A confirmação é “E-mail enviado com sucesso” para um response.ok do serviço, que não demonstra leitura nem entrega final. Não há histórico de solicitações ou orientação sobre prazo de resposta; falha pode expor texto técnico do EmailJS ao usuário.

**Sugestão:** Adotar “Mensagem encaminhada” e informar onde a resposta chegará. Dar protocolo ou histórico mínimo com item e data, se o processo justificar. Preservar mensagem após falha e apresentar erro acionável, guardando detalhe técnico em log controlado. Resolver S02/S03 antes de ampliar o recurso.

**Critério de aceite:** Usuário sabe qual item contatou, que a resposta virá por e-mail e como agir se não houver retorno; erro não expõe resposta técnica bruta. Alertas não afirmam leitura inexistente.

**Base:** [Airbnb: mensagens](https://www.airbnb.com/help/article/145)

---

**U10 · P2 · Notificações são pedidas cedo e não têm preferências no produto**

Confirmado no código.

**Evidência e impacto:** [src/providers/AuthProvider.js:18](C:/Users/USER/Programas/sistema_achadidos/src/providers/AuthProvider.js:18) inicia acompanhamento para visitante após carregar Auth; [src/services/notifications.js:71](C:/Users/USER/Programas/sistema_achadidos/src/services/notifications.js:71) pode pedir permissão imediatamente. Todas as notificações usam canal de alta importância e som, incluindo novos itens. Perfil não oferece gerenciamento. O toque em contato abre item, sem histórico da mensagem.

**Sugestão:** Explicar o benefício em contexto e permitir habilitar depois; separar contatos pessoais de novidades do mural em canais/preferências. Preservar o requisito de alcançar aparelhos registrados, incluindo autor, quando essa assinatura estiver habilitada. Considerar categorias/frequência como evolução opcional, com métricas de utilidade.

**Critério de aceite:** Primeiro acesso permanece utilizável após negar; usuário encontra ativação posterior; preferências são respeitadas em segundo plano. Contato abre destino coerente e um push antigo tem recuperação.

**Base:** [Todoist: controle de lembretes](https://www.todoist.com/help/todoist/features/introduction-to-reminders-9PezfU); [Expo 57: notificações](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/)

---

**U11 · P2 · Faltam caminhos de orientação para visitantes e discentes**

Lacuna de produto; restrição de publicação é tratada como intencional.

**Evidência e impacto:** O mural público facilita descobrir itens. Porém, os controles de publicação desaparecem para discentes/visitantes sem um caminho explícito para quem achou algo entregar à equipe. Detalhe oferece publicador e DAEE, mas não um processo de comprovação/retirada, denúncia ou ajuda contextual. Não é recomendação de liberar publicação a discentes.

**Sugestão:** Adicionar “Como entregar um objeto encontrado”, “Como recuperar meu item” e identificação da unidade responsável. Definir comprovação privada de posse, ponto/horário de retirada e canal para publicação incorreta. Usar navegação simples: Mural, Ajuda e Perfil; Minhas apenas para autorizados.

**Critério de aceite:** Em teste com discentes e equipe, cada pessoa encontra seu próximo passo sem precisar deduzir por que um botão não aparece. Nenhum dado secreto de comprovação é exigido publicamente.

**Base:** [Google Maps: organização e navegação](https://support.google.com/maps/answer/144349?hl=en); [Airbnb: mensagens](https://www.airbnb.com/help/article/145)

---

**U12 · P3 · Consistência visual pode melhorar sem redesenho amplo**

Confirmado em tokens e componentes; preferência visual a validar.

**Evidência e impacto:** O verde, a fonte Montserrat e superfícies claras já formam uma identidade. Persistem headers duplicados, textos de botões/raios/espaçamentos diferentes, “Email/E-mail”, “Logout/Sair”, e alerta informativo com aparência vermelha padrão em AppAlertHost. userInterfaceStyle está fixado em light; tema escuro não é requisito comprovado.

**Sugestão:** Criar uma pequena biblioteca com escala de espaços, tipografia, cores por função, botões primário/secundário/destrutivo e estados. Usar linguagem consistente (“Sair”, “E-mail”) e reservar vermelho para erro/destruição. Priorizar contraste e previsibilidade antes de adicionar animação ou tema escuro.

**Critério de aceite:** Revisar uma matriz de componentes e estados em todas as telas; mensagens neutras não parecem falhas. Usuários reconhecem ação principal e ação destrutiva sem depender apenas da cor.

**Base:** [Android: acessibilidade](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views); [Todoist: inclusão rápida](https://www.todoist.com/help/todoist/features/use-task-quick-add-in-todoist-va4Lhpzz)

---

**Direção de produto e arquitetura recomendada**

Manter Firebase como origem de identidade, perfis e publicações, Cloudinary como mídia e Supabase na função atual de push. Centralizar uma operação confiável de contato é uma necessidade de segurança; o local de execução precisa ser escolhido de modo explícito, sem pressupor migração de dados ou ativação de serviço pago.

Fluxo proposto para publicação: rascunho local → validação → upload autorizado → gravação do item com ID estável → evento de publicação → fila de push → recibos. O scanner atual é uma boa proteção quando a chamada do cliente falha após gravar.

Fluxo proposto para contato: itemId + mensagem → validação do remetente/visitante e limites → destino resolvido pelo servidor → envio aceito com ID → evento de contato idempotente → fila de push. O dispositivo não deve poder declarar sozinho que um e-mail foi enviado.

Para o modelo do item, adotar identificador, proprietário autorizado, título, descrição, categoria, tipo de ocorrência (se necessário), local de retirada, data da ocorrência, status, timestamps do servidor e referência da mídia. Dados privados de contato e de comprovação de posse ficam fora do documento público. A migração precisa contemplar a coleção legada antes de remover suporte.

O MVP não precisa copiar mapas interativos, chat completo, recomendações por IA ou microserviços dos produtos de referência. Precisa tornar a tarefa “identificar meu objeto e saber como recuperá-lo” simples, confiável e acessível.

**Ordem de execução sugerida**

| Ordem | Entrega concreta | Dependências e saída esperada |
|---|---|---|
| 1 | Corrigir retorno da foto; criar teste real de navegação | A01; protege dados do formulário e remove um bloqueio direto de uso |
| 2 | Autorizar publicadores no servidor e conferir projeto de deploy | S01, A09; teste negativo de externo/discente e evidência das Rules implantadas |
| 3 | Proteger contato, reduzir dados públicos e impedir aviso falso | S02–S04; operação confiável, destino privado, limites e ID por mensagem |
| 4 | Contraste, filtros e estados de erro | U01, U05, A06; ganhos rápidos sem mudança extensa de identidade visual |
| 5 | Paginação, detalhe atual e encerramento coerente | A02–A04; combinar índices, busca, legado e política de retenção |
| 6 | Rascunho, acessibilidade de formulários e permissão em contexto | U04, U06–U10; validar em aparelhos e com diferentes perfis de usuário |
| 7 | Ciclo de mídia, revogação push, testes/CI e release | S05–S09, A05–A12; limites, manutenção e distribuição verificáveis |
| 8 | Refinamento de componentes e funcionalidades opcionais | U11–U12; decidir com pesquisa, sem expandir escopo antes de corrigir o básico |

O esforço deve ser estimado após conferir infraestrutura e regras de negócio. Correção de contraste/filtro pode ser pequena; contato e privacidade exigem coordenação de dados, serviço e UI. Não seria responsável prometer datas sem essa verificação.

**Plano mínimo de validação de saída**

| Cenário | Resultado esperado |
|---|---|
| Visitante, discente, publicador, externo verificado | Acesso público preservado; publicação somente para papel aprovado; caminhos de orientação claros |
| Criar/editar + galeria/câmera interna/externa/cancelar | Mesmo formulário e ID; nenhum texto perdido; uma única rota de origem |
| API manipulada para publicar/contatar | Rules e servidor recusam papel/destino/identidade inválidos independentemente da UI |
| Contato repetido e contato distinto | Retry do mesmo ID não duplica; mensagens distintas válidas recebem eventos distintos |
| Sem rede, resposta perdida, retomada e reinício | Dados anteriores/rascunho preservados; estado de sincronização claro; recuperação sem duplicação |
| Item removido/encerrado e push antigo | Detalhe revalida; usuário recebe explicação e retorno ao mural |
| Logout offline e troca de conta | Vínculo pessoal expira/revoga corretamente; avisos públicos seguem preferências |
| TalkBack/VoiceOver, teclado web, fonte 200% | Ações nomeadas, foco previsível, campos/ações alcançáveis e nenhum bloqueio |
| Aparelhos Android/iOS reais | Login Google, câmera, upload, teclado, push em primeiro plano/segundo plano/fechado e toque de notificação |
| APK/IPA de release | Versões, permissões, OAuth, FCM/APNs e identidade do projeto correspondem ao ambiente esperado |
| Volume representativo de itens | Leituras paginadas, busca correta e métricas de rede/memória/latência registradas |
| Exclusão/correção de dados | Pedido chega ao responsável; perfil, publicação, mídia e tokens seguem política documentada |

Testar usabilidade com um pequeno grupo que inclua discentes, equipe responsável e pessoas que usam recursos de acessibilidade. Tarefas: localizar um objeto, entender sua situação, contatar responsável, publicar com foto, trocar foto, encerrar e recuperar após falha. Registrar sucesso sem ajuda, tempo, erros e dúvidas; uma rodada pequena é diagnóstico qualitativo, não comprovação estatística.

**Métricas úteis, sem coletar conteúdo pessoal desnecessário**

Acompanhar sucesso e abandono de publicar/contatar; taxa de “sem resultado”; tempo até a primeira lista utilizável; falhas de upload; itens duplicados; atraso/erro da fila; recibos de push; objetos efetivamente devolvidos. Separar “push aceito pelo provedor” de “pessoa viu o aviso”. Não gravar texto de mensagens, tokens ou e-mails em analytics. Começar com testes e métricas locais/operacionais disponíveis; respeitar a restrição de não gerar custo.

**Pendências de verificação externa**

Conferir versões implantadas das Rules/Edge Functions/migrações; restrições de cadastro Firebase e aprovação de publicador; template/destinos/limites EmailJS; preset e retenção Cloudinary; permissões/segredos/cron/quotas Supabase; credenciais e binários FCM/APNs. Também verificar se já existe política institucional de privacidade, moderação, suporte e comprovação de posse. Até isso ser examinado, os achados condicionais continuam identificados como condicionais.

Não classificar automaticamente API key Firebase, client ID Google ou chave pública EmailJS como vazamento de segredo. O controle necessário é autorização, restrições de serviço e proteção de credenciais realmente privilegiadas. Não foi demonstrado comprometimento de conta administrativa nesta auditoria.

