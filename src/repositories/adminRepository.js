import { firestoreConfig } from "../config/firestoreConfig.js";

export function createAdminRepository(databaseService) {
  const { collections } = firestoreConfig;

  function list(collectionName) {
    return databaseService.getCollection(collectionName);
  }

  function create(collectionName, document) {
    return databaseService.postDocument(collectionName, document);
  }

  function update(collectionName, documentId, updates) {
    return databaseService.updateDocument(collectionName, documentId, updates);
  }

  function remove(collectionName, documentId) {
    return databaseService.deleteDocument(collectionName, documentId);
  }

  return {
    listBanners: () => list(collections.banner),
    createBanner: (banner) => create(collections.banner, banner),
    updateBanner: (bannerId, updates) => update(collections.banner, bannerId, updates),
    removeBanner: (bannerId) => remove(collections.banner, bannerId),

    listCategories: () => list(collections.categorias),
    createCategory: (category) => create(collections.categorias, category),
    updateCategory: (categoryId, updates) => update(collections.categorias, categoryId, updates),
    removeCategory: (categoryId) => remove(collections.categorias, categoryId),

    listProducts: () => list(collections.produtos),
    createProduct: (product) => create(collections.produtos, product),
    updateProduct: (productId, updates) => update(collections.produtos, productId, updates),
    removeProduct: (productId) => remove(collections.produtos, productId),

    listOrders: () => list(collections.pedidos),
    updateOrder: (orderId, updates) => update(collections.pedidos, orderId, updates),
    removeOrder: (orderId) => remove(collections.pedidos, orderId),

    listCustomers: () => list(collections.clientes),
    updateCustomer: (customerId, updates) => update(collections.clientes, customerId, updates),

    listSettings: () => list(collections.configuracoes),
    updateSetting: (settingId, updates) => update(collections.configuracoes, settingId, updates),

    listOrderStatuses: () => list(collections.statusPedidos),
    updateOrderStatusDefinition: (statusId, updates) => update(collections.statusPedidos, statusId, updates),

    listWhatsappTemplates: () => list(collections.whatsappTemplates),
    updateWhatsappTemplate: (templateId, updates) => update(collections.whatsappTemplates, templateId, updates),

    createAuditLog: (entry) => create(collections.adminAuditoria, entry)
  };
}
