export const orderStatusConfig = Object.freeze({
  initialStatus: "recebido",
  statuses: [
    {
      id: "recebido",
      label: "Pedido recebido",
      notifyCustomer: false
    },
    {
      id: "aceito",
      label: "Pedido aceito",
      notifyCustomer: true,
      whatsappTemplateId: "orderAccepted"
    },
    {
      id: "preparo",
      label: "Em preparo",
      notifyCustomer: false
    },
    {
      id: "saiu-entrega",
      label: "Saiu para entrega",
      notifyCustomer: true,
      whatsappTemplateId: "outForDelivery"
    },
    {
      id: "entregue",
      label: "Entregue",
      notifyCustomer: false
    },
    {
      id: "cancelado",
      label: "Cancelado",
      notifyCustomer: false
    }
  ]
});

export function getOrderStatus(statusId, config = orderStatusConfig) {
  return config.statuses.find((status) => status.id === statusId) || null;
}
