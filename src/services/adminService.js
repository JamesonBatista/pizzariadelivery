import { getOrderStatus } from "../config/orderStatusConfig.js";
import { createOrderNotificationService } from "./orderNotificationService.js";

export function createAdminService({
  adminRepository,
  orderNotificationService = createOrderNotificationService()
}) {
  async function saveProduct(product) {
    if (product.id) {
      return adminRepository.updateProduct(product.id, product);
    }

    return adminRepository.createProduct({
      ...product,
      disponivel: product.disponivel ?? true
    });
  }

  async function saveBanner(banner) {
    if (banner.id) {
      return adminRepository.updateBanner(banner.id, banner);
    }

    return adminRepository.createBanner({
      ...banner,
      ativo: banner.ativo ?? true
    });
  }

  async function saveWhatsappTemplate(template) {
    return adminRepository.updateWhatsappTemplate(template.id, template);
  }

  async function updateOrderStatus({ order, statusId, customerPhone }) {
    const status = getOrderStatus(statusId);
    if (!status) {
      throw new Error(`Status de pedido invalido: ${statusId}`);
    }

    const updatedOrder = await adminRepository.updateOrder(order.id, {
      statusId,
      statusNome: status.label,
      statusAtualizadoEm: new Date().toISOString()
    });

    let notification = null;
    if (status.notifyCustomer && customerPhone) {
      notification =
        status.id === "aceito"
          ? await orderNotificationService.prepareOrderAccepted({ phone: customerPhone, order: updatedOrder })
          : await orderNotificationService.prepareOutForDelivery({ phone: customerPhone, order: updatedOrder });
    }

    return {
      order: updatedOrder,
      notification
    };
  }

  async function registerAudit({ actorId, action, entity, entityId, details = {} }) {
    return adminRepository.createAuditLog({
      actorId,
      action,
      entity,
      entityId,
      details,
      createdAt: new Date().toISOString()
    });
  }

  return {
    saveProduct,
    saveBanner,
    saveWhatsappTemplate,
    updateOrderStatus,
    registerAudit
  };
}
