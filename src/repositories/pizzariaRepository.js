import { firestoreConfig } from "../config/firestoreConfig.js";

export function createPizzariaRepository(databaseService) {
  const { collections } = firestoreConfig;

  async function listarCategorias() {
    return databaseService.getCollection(collections.categorias);
  }

  async function listarProdutos() {
    const produtos = await databaseService.getCollection(collections.produtos);
    return produtos.filter((produto) => produto.disponivel !== false);
  }

  async function listarClientes() {
    return databaseService.getCollection(collections.clientes);
  }

  async function criarItemPedido(itemPedido) {
    return databaseService.postDocument(collections.pedidos, itemPedido);
  }

  async function removerItemPedido(itemPedidoId) {
    return databaseService.deleteDocument(collections.pedidos, itemPedidoId);
  }

  return {
    listarCategorias,
    listarProdutos,
    listarClientes,
    criarItemPedido,
    removerItemPedido
  };
}
