import { firestoreConfig } from "../config/firestoreConfig.js";

export function createPizzariaRepository(databaseService) {
  const { collections } = firestoreConfig;

  async function listarCategorias() {
    return databaseService.getCollection(collections.categorias);
  }

  async function listarBanners() {
    return databaseService.getCollection(collections.banner);
  }

  async function listarProdutos() {
    const produtos = await databaseService.getCollection(collections.produtos);
    return produtos.filter((produto) => produto.disponivel !== false);
  }

  async function listarClientes() {
    return databaseService.getCollection(collections.clientes);
  }

  async function listarPedidos() {
    const pedidos = await databaseService.getCollection(collections.pedidos);
    return pedidos.filter((pedido) => pedido.tipo === "pedido" || pedido.statusId);
  }

  async function criarItemPedido(itemPedido) {
    return databaseService.postDocument(collections.pedidos, itemPedido);
  }

  async function removerItemPedido(itemPedidoId) {
    return databaseService.deleteDocument(collections.pedidos, itemPedidoId);
  }

  return {
    listarBanners,
    listarCategorias,
    listarProdutos,
    listarClientes,
    listarPedidos,
    criarItemPedido,
    removerItemPedido
  };
}
