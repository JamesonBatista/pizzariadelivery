# Pizzaria

Aplicacao estatica para cardapio de pizzaria, preparada como Web App mobile/iOS e para rodar diretamente no GitHub Pages.

## Estrutura principal

- `dados.json`: fonte temporaria de dados para produtos, categorias, clientes e pedidos.
- `src/config/appConfig.js`: configuracoes gerais, caminho do JSON local, taxa de entrega e valor do recheio extra em `pricing`.
- `src/config/firestoreConfig.js`: ponto unico para receber os dados de conexao do Firestore.
- `src/config/whatsappConfig.js`: ponto unico para configurar o envio futuro de mensagens pelo WhatsApp.
- `src/database/`: clientes de banco. Hoje usa `fakeFirestoreClient.js`; futuramente a conexao real entra em `firestoreConnection.js`.
- `src/repositories/pizzariaRepository.js`: camada de CRUD usada pela interface.
- `src/services/whatsappService.js`: prepara mensagens de WhatsApp sem enviar enquanto o provider nao for conectado.
- `src/services/orderNotificationService.js`: centraliza notificacoes futuras de pedido aceito, saiu para entrega e contato com cliente.
- `manifest.json`, `service-worker.js` e `assets/icons/pizza-icon.svg`: configuracao de Web App para mobile/iOS.
- `src/ui/`: componentes visuais separados por responsabilidade, incluindo cardapio, barra inferior, carrinho, usuario, pagamento e confirmacao do pedido.

## Como rodar localmente

Por ser estatico, basta servir a raiz do projeto:

```bash
python3 -m http.server 4173
```

Depois acesse `http://localhost:4173`.

## GitHub Pages

Publique a raiz do repositorio. Os caminhos foram definidos de forma relativa (`./...`) para funcionar em subpaths do GitHub Pages.
