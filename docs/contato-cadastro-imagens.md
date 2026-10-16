# Contato, cadastro e imagens

O acesso com Google e a conta de suporte de testes estão descritos em [google-e-conta-suporte.md](google-e-conta-suporte.md).

- Cadastro pelo aplicativo aceita somente e-mails @discente.ifpe.edu.br. Outros e-mails devem ser cadastrados manualmente pela administração no Firebase e continuam podendo entrar no app. O Firebase envia a confirmação após criar a conta e salvar o nome; a sessão é encerrada. Login não permite contas sem e-mail confirmado e tenta reenviar o link. Uma falha na conclusão pode ser retomada pelo botão Concluir cadastro.
- Discentes (`@discente.ifpe.edu.br`, sem diferenciar maiúsculas) não veem Adicionar item nem Minhas Publicações. As rotas, os serviços e as regras Firestore também bloqueiam as operações. Publicação exige conta com e-mail verificado fora desse domínio, incluindo Gmail, Outlook e outros provedores.
- Contatar publicador permite visitantes sem login, que informam nome e e-mail para resposta. Para usuários logados, nome e e-mail vêm da conta e permanecem somente para leitura. O corpo do e-mail inclui o nome e o e-mail para resposta, além dos parâmetros `from_email` e `reply_to` do template. Depois do sucesso solicita um push para o proprietário obtido pelo servidor no Firestore. Cada contato gera um evento próprio, inclusive contatos sobre o mesmo item dentro de um minuto. Contatar DAEE envia somente e-mail. Falha no push informa que o e-mail já foi enviado.

Para ativar esse comportamento no servidor, aplicar a migração `20261016031003_contact_push_every_message.sql` e publicar `push-api`. O publicador precisa estar conectado em uma build com push configurado e notificações autorizadas.
- Aparelhos recebem contatos enquanto vinculados à conta verificada do publicador. Login/logout atualiza esse vínculo. O worker confere novamente a conta antes de enviar, para não entregar contatos pendentes a outra conta. Novas publicações continuam com o broadcast existente para instalações, incluindo visitantes.
- Visitantes usam uma sessão assinada persistida no aparelho para solicitar o aviso sem criar conta Firebase, inclusive no Expo Go e na web. A fila de contatos limita alertas do mesmo remetente/item a um por minuto. O aviso abre o item; a mensagem completa deve ser lida no e-mail. O destinatário precisa abrir uma build própria e autorizar notificações. Expo Go não recebe push remoto. A recepção física depende também das credenciais Expo/FCM existentes.
- Imagens novas e substituídas são enviadas ao Cloudinary com o cloud `wuhup7tw` e preset unsigned `storage`, conforme o arquivo de referência. Firestore guarda a URL HTTPS. Publicações antigas mantêm suas imagens até que sejam substituídas. Upload recusado preserva o formulário; se o Firestore falhar após upload, o app tenta desfazer usando o delete token temporário.
- O token de exclusão do Cloudinary tem validade curta. Excluir uma publicação não remove automaticamente sua imagem antiga do Cloudinary; exclusão permanente posterior precisa de um backend com credenciais privadas. Nenhuma chave privada é enviada ao app.
- As cinco variantes Montserrat utilizadas pelas telas carregam via `useExpoFonts` na raiz. O app aguarda o carregamento; uma falha mostra mensagem em vez de spinner permanente. Em desenvolvimento o console lista as famílias confirmadas por `expo-font.isLoaded`.

## Verificação em dispositivos

1. No Expo Go, iniciar o app, consultar no console as cinco fontes carregadas e conferir visualmente mural, login e contato. O bundle comprova os arquivos incluídos, mas não a renderização no aparelho.
2. Cadastrar duas contas institucionais e conferir link, pasta de spam, login bloqueado antes da confirmação e liberado depois.
3. Com discente, conferir ausência dos dois botões e bloqueio de rotas. Com servidor verificado, publicar e editar foto e conferir a URL Cloudinary.
4. Em duas builds próprias com contas diferentes, abrir o app e autorizar push. Contatar um item do servidor; conferir e-mail, aviso em primeiro/segundo plano e toque abrindo o item.
5. Trocar a conta do aparelho destinatário antes de um envio pendente e conferir que ele não recebe o contato da conta anterior.

Teste adicional: abrir um item sem login, informar nome/e-mail, enviar contato e conferir os dados para resposta. Testar nome vazio, e-mail inválido e conta logada com dados bloqueados. O aviso no aparelho do publicador ainda exige uma build própria; o visitante não precisa autorizar push.
