import { createWhatsappService } from "./whatsappService.js";

export function createOrderNotificationService(whatsappService = createWhatsappService()) {
  function prepareOrderAccepted({ phone, order }) {
    return whatsappService.sendMessage({
      phone,
      templateId: "orderAccepted",
      variables: {
        clienteNome: order.clienteNome,
        pedidoId: order.id,
        pedidoTotal: order.total
      }
    });
  }

  function prepareOutForDelivery({ phone, order }) {
    return whatsappService.sendMessage({
      phone,
      templateId: "outForDelivery",
      variables: {
        clienteNome: order.clienteNome,
        pedidoId: order.id
      }
    });
  }

  function prepareCustomerContact({ phone, order }) {
    return whatsappService.sendMessage({
      phone,
      templateId: "customerContact",
      variables: {
        clienteNome: order.clienteNome,
        pedidoId: order.id
      }
    });
  }

  return {
    prepareOrderAccepted,
    prepareOutForDelivery,
    prepareCustomerContact
  };
}
