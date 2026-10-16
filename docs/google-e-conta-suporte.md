# Acesso com Google e conta de suporte

As telas Login e Cadastro oferecem acesso com Google. O cadastro público, por senha ou Google, aceita apenas @discente.ifpe.edu.br. Outros e-mails precisam de conta previamente criada pela administração no Firebase. O login com Google usa uma verificação Firebase com autoCreate desabilitado para esses e-mails, impedindo que o botão Entrar crie contas automaticamente. Não há senha do aplicativo nesse fluxo nem envio de link de confirmação: a sessão é aceita somente quando o Firebase informa `emailVerified = true` após validar a credencial Google. Todas as contas com e-mail verificado podem publicar e gerenciar suas próprias publicações, exceto as contas cujo e-mail termina em @discente.ifpe.edu.br. A regra também vale para contas Google pessoais, como Gmail.

## Configuração e teste do Google

- Projeto Firebase: `achadidos-15d82`. Provedor Google confirmado como habilitado.
- Android: pacote `com.company.achadidos`; certificado de debug registrado no Firebase e `android/app/google-services.json` atualizado com clientes OAuth.
- SHA-1 de debug: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`. Builds assinadas com outro certificado precisam registrar seu SHA-1 no Firebase também; isso inclui assinaturas EAS e Google Play.
- Em 15/10/2026, o SHA-1 do certificado EAS para `com.company.achadidos` foi consultado no projeto `ad3b0b7d-22ee-412d-bc1b-0d68a6f29cc5` e cadastrado no Firebase: `22:5E:9B:1C:8B:DA:27:CC:81:DC:69:15:01:63:0C:4A:8C:25:EF:45`. Antes dessa correção, a consulta ao Firebase retornava somente o certificado de debug. O `google-services.json` foi baixado novamente e contém os dois clientes Android e o mesmo cliente web. Não foi gerada nova build. A autenticação no aparelho ainda precisa ser confirmada.
- O Credential Manager pode retornar `cancelled` tanto ao fechar o seletor quanto diante de configuração OAuth incompatível. O app agora informa que o acesso não foi concluído, sem autenticar ou criar conta. Para novos APKs, confira sempre o certificado de assinatura; para Google Play, confira também o certificado de App Signing.
- iOS: app Firebase registrado com bundle `com.systemachadidos`; arquivo `ios/GoogleService-Info.plist`, esquema de retorno Google e encaminhamento no AppDelegate configurados. O arquivo está incluído nos recursos do projeto Xcode.
- Biblioteca nativa: `react-native-nitro-google-signin`, com Android Credential Manager, e `react-native-nitro-modules`.
- Web obtém a credencial pelo Google Identity Services antes de autenticar no Firebase, para aplicar a restrição sem criar uma conta antes da validação. O domínio deve estar em Authentication > Settings > Authorized domains do Firebase e a origem completa (protocolo, domínio e porta) deve estar em Authorized JavaScript origins do cliente OAuth no Google Cloud Console.

O Google nativo **não funciona no Expo Go**. Instale uma nova build para incluir os módulos; atualização apenas por Metro não instala código nativo. Com Android SDK instalado, execute `npx expo run:android`. No macOS, sincronize o projeto iOS com `npx expo prebuild --platform ios --no-install` preservando as alterações nativas, instale os pods e execute `npx expo run:ios`.

Verifique no aparelho: selecionar conta, cancelar sem entrar, sair e escolher outra conta, entrar como discente sem ver botões de publicação e acessar com servidor. Cadastro por e-mail/senha continua exigindo confirmação.

## Conta de teste

- E-mail de login: `suporte@achadidos.company`.
- Nome: `Suporte Achadidos`.
- UID Firebase: `95rHhInaP3foVXGThEqFAkLy2rh1`.
- Senha aleatória salva somente em `.env.support.local`, ignorado pelo Git. Esse arquivo não é importado pelo aplicativo.
- Conta criada administrativamente com e-mail marcado como verificado para permitir testes, sem exigir uma caixa de e-mail que ainda não existe. Login real com senha foi confirmado pela API Firebase.
- Conta pode testar publicação, edição, exclusão das próprias publicações, contato e notificações em builds próprias. Não é um administrador global.

**Essa conta Firebase não cria uma caixa de e-mail.** Como o domínio ainda não foi registrado, não é possível receber contatos nem redefinições de senha nesse endereço. Também não existe uma conta Google para ele; por enquanto entre usando e-mail e senha.

## Como ativar o e-mail real

1. Verifique a disponibilidade e registre `achadidos.company` em um registrador. O registro e a renovação do domínio têm custo; nada foi comprado nesta tarefa.
2. Para receber mensagens com menor custo, adicione o domínio ao Cloudflare e configure Email Routing para encaminhar `suporte@achadidos.company` a um Gmail existente. Siga a verificação do endereço de destino e adicione os registros DNS apresentados pelo serviço. O encaminhamento de recebimento é gratuito, mas não cria uma caixa Gmail própria nem, sozinho, o envio de respostas com o endereço personalizado.
3. Para uma caixa com envio e recebimento no Gmail, contrate Google Workspace, verifique a propriedade do domínio, configure os registros MX indicados pelo Google e crie o usuário `suporte`. Workspace é um serviço pago.
4. Depois de receber mensagens nesse endereço, redefine a senha da conta Firebase para uma senha própria e teste contatos/redefinições. Para usar também o login Google com o mesmo endereço, configure a conta Google correspondente e teste a vinculação sem criar um segundo usuário Firebase.

Referências: [Google no Expo](https://docs.expo.dev/guides/google-authentication/), [Nitro Google Sign-In](https://react-native-nitro-google-sign-in.github.io/docs/setup/expo/), [Cloudflare: registros e encaminhamento de e-mail](https://developers.cloudflare.com/dns/manage-dns-records/how-to/email-records/), [Google Workspace: e-mail profissional](https://workspace.google.com/intl/pt-BR/business/new-business/).

A restrição de cadastro é aplicada na tela e nos serviços de autenticação do aplicativo. Regras do Firestore controlam publicações, não a criação de usuários do Firebase Authentication.
