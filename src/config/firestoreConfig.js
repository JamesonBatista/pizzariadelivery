export const firestoreConfig = Object.freeze({
  enabled: false,
  projectId: "",
  apiKey: "",
  authDomain: "",
  appId: "",
  collections: {
    banner: "banner",
    categorias: "categorias",
    produtos: "produtos",
    clientes: "clientes",
    pedidos: "pedidos"
  }
});

export function hasFirestoreCredentials(config = firestoreConfig) {
  return Boolean(config.enabled && config.projectId && config.apiKey && config.appId);
}
