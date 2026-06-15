# Pizzaria

Aplicacao estatica para cardapio de pizzaria, preparada como Web App mobile/iOS e para rodar diretamente no GitHub Pages.

## Estrutura principal

- `dados.json`: fonte temporaria de dados para ADM, configuracoes, banner, produtos, categorias, clientes, pedidos, status e templates de WhatsApp.
- `src/config/adminConfig.js`: secoes, permissoes e papeis planejados para o painel ADM.
- `src/config/appConfig.js`: configuracoes gerais, caminho do JSON local, taxa de entrega e valor do recheio extra em `pricing`.
- `src/config/firestoreConfig.js`: ponto unico para receber os dados de conexao do Firestore.
- `src/config/orderStatusConfig.js`: fluxo centralizado de status dos pedidos e quais status notificam cliente.
- `src/config/whatsappConfig.js`: ponto unico para configurar o envio futuro de mensagens pelo WhatsApp.
- `src/database/`: clientes de banco. Hoje usa `fakeFirestoreClient.js`; futuramente a conexao real entra em `firestoreConnection.js`.
- `src/repositories/adminRepository.js`: CRUD administrativo para banner, categorias, produtos, clientes, pedidos, configuracoes, status e WhatsApp.
- `src/repositories/pizzariaRepository.js`: camada de CRUD usada pela interface.
- `src/services/adminService.js`: acoes de negocio do ADM, como salvar produto/banner, alterar status do pedido, preparar notificacao e registrar auditoria.
- `src/services/customerStorageService.js`: salva localmente dados do cliente e pedidos confirmados enquanto nao ha autenticacao/Firestore real.
- `src/services/whatsappService.js`: prepara mensagens de WhatsApp sem enviar enquanto o provider nao for conectado.
- `src/services/orderNotificationService.js`: centraliza notificacoes futuras de pedido aceito, saiu para entrega e contato com cliente.
- `manifest.json`, `service-worker.js` e `assets/icons/pizza-icon.svg`: configuracao de Web App para mobile/iOS.
- `src/ui/`: componentes visuais separados por responsabilidade, incluindo banner, cardapio, barra inferior, carrinho, usuario, pedidos, detalhes do pedido, pagamento e confirmacao do pedido.

## Como rodar localmente

Por ser estatico, basta servir a raiz do projeto:

```bash
python3 -m http.server 4173
```

Depois acesse `http://localhost:4173`.

## GitHub Pages

Publique a raiz do repositorio. Os caminhos foram definidos de forma relativa (`./...`) para funcionar em subpaths do GitHub Pages.

## Preparacao para ADM

A tela ADM e a base de dados estao separadas para receber:

- Acesso pelo perfil digitando `admpizzaria2026dev` no campo nome e salvando.
- Colunas de pedidos pendentes, aceitos e finalizados.
- Aceite/recusa/cancelamento/saida para entrega com mensagens de WhatsApp.
- Popup customizado de confirmacao de pagamento para finalizar pedido.
- Controle financeiro por dia, semana, mes e periodo.
- Contato manual com cliente via WhatsApp.
- Cadastro/edicao/remocao de produtos e categorias.
- Controle do banner principal pelo array `banner`.
- Alteracao de taxa, tempo de entrega e configuracoes gerais em `configuracoes`.
- Controle de status dos pedidos em `statusPedidos`.
- Templates editaveis de WhatsApp em `whatsappTemplates`.
- Auditoria administrativa em `adminAuditoria`.
