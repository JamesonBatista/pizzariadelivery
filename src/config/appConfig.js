export const appConfig = Object.freeze({
  appName: "Pizzaria",
  locale: "pt-BR",
  currency: "BRL",
  defaultCategoryId: "todos",
  defaultCategoryLabel: "Todos",
  pricing: {
    extraFillingPrice: 8,
    deliveryFee: 6
  },
  paymentMethods: [
    {
      id: "pix",
      label: "Pix"
    },
    {
      id: "cartao",
      label: "Credito/Debito"
    },
    {
      id: "dinheiro",
      label: "Dinheiro"
    }
  ],
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
