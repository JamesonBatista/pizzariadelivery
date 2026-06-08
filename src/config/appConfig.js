export const appConfig = Object.freeze({
  appName: "Pizzaria",
  locale: "pt-BR",
  currency: "BRL",
  defaultCategoryId: "todos",
  defaultCategoryLabel: "Todos",
  pricing: {
    extraFillingPrice: 8
  },
  dataSource: {
    driver: "json-local",
    jsonPath: "./dados.json"
  },
  fakeDatabaseLatencyMs: {
    get: 900,
    post: 650,
    delete: 650
  }
});
