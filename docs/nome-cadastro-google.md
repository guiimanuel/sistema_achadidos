# Nome do cadastro no login Google

O nome escolhido no cadastro é preservado em `perfis/{uid}.nome`, no Firestore. Cada conta pode ler apenas seu próprio documento e criá-lo uma vez. O aplicativo não permite alterar ou excluir esse nome pelo cliente.

O cadastro por senha salva o nome antes de enviar a confirmação de e-mail. Contas antigas passam a preservar o nome atual no próximo login por senha. Após autenticar com Google, o app restaura o nome do perfil no Firebase Auth, mantendo perfil, avatar e remetente de contato consistentes. Sem perfil, tenta recuperar o nome do provedor de senha; contas novas exclusivamente Google continuam usando o nome do Google.

As regras de `perfis` precisam estar publicadas antes de usar esta versão. Erros ao consultar ou restaurar o perfil interrompem o login e encerram a sessão, permitindo tentar novamente sem substituir o nome preservado. O nome salvo não é usado para autorizar acesso nem publicar itens.

Nomes já substituídos antes desta correção não podem ser reconstruídos quando não há outra cópia do nome original. Nesse caso, a administração deve corrigir tanto o documento privado quanto o `displayName` do Firebase Auth.

Validação automatizada: `node --test tests/auth-permissions.test.cjs tests/google-auth.test.cjs tests/google-web.test.cjs tests/contato.test.cjs`.
