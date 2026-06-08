export const whatsappConfig = Object.freeze({
  enabled: false,
  provider: "pending",
  adminPhone: "",
  templates: {
    orderAccepted: {
      id: "orderAccepted",
      label: "Pedido aceito",
      message:
        "Ola, {clienteNome}! Seu pedido #{pedidoId} foi aceito pela pizzaria. Total: {pedidoTotal}."
    },
    outForDelivery: {
      id: "outForDelivery",
      label: "Saiu para entrega",
      message:
        "Ola, {clienteNome}! Seu pedido #{pedidoId} saiu para entrega. Em breve chegara ate voce."
    },
    customerContact: {
      id: "customerContact",
      label: "Contato com cliente",
      message: "Ola, {clienteNome}! Precisamos falar com voce sobre o pedido #{pedidoId}."
    }
  }
});

export function hasWhatsappProvider(config = whatsappConfig) {
  return Boolean(config.enabled && config.provider && config.provider !== "pending");
}
