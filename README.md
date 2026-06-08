# Pizzaria

Aplicacao estatica para cardapio de pizzaria, preparada para rodar diretamente no GitHub Pages.

## Estrutura principal

- `dados.json`: fonte temporaria de dados para produtos, categorias, clientes e pedidos.
- `src/config/appConfig.js`: configuracoes gerais da aplicacao e caminho do JSON local.
- `src/config/firestoreConfig.js`: ponto unico para receber os dados de conexao do Firestore.
- `src/database/`: clientes de banco. Hoje usa `fakeFirestoreClient.js`; futuramente a conexao real entra em `firestoreConnection.js`.
- `src/repositories/pizzariaRepository.js`: camada de CRUD usada pela interface.
- `src/ui/`: componentes visuais separados por responsabilidade.

## Como rodar localmente

Por ser estatico, basta servir a raiz do projeto:

```bash
python3 -m http.server 4173
```

Depois acesse `http://localhost:4173`.

## GitHub Pages

Publique a raiz do repositorio. Os caminhos foram definidos de forma relativa (`./...`) para funcionar em subpaths do GitHub Pages.
