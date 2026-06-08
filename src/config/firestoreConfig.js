export const firestoreConfig = Object.freeze({
  enabled: false,
  projectId: "",
  apiKey: "",
  authDomain: "",
  appId: "",
  collections: {
    banner: "banner",
    categorias: "categorias",
    configuracoes: "configuracoes",
    produtos: "produtos",
    clientes: "clientes",
    pedidos: "pedidos",
    statusPedidos: "statusPedidos",
    whatsappTemplates: "whatsappTemplates",
    adminAuditoria: "adminAuditoria"
  }
});

export function hasFirestoreCredentials(config = firestoreConfig) {
  return Boolean(config.enabled && config.projectId && config.apiKey && config.appId);
}
