const CUSTOMER_KEY = "pizzaria.customer";
const ORDERS_KEY = "pizzaria.orders";

function readJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function createCustomerStorageService() {
  function getCustomer() {
    return readJson(CUSTOMER_KEY, null);
  }

  function saveCustomer(customer) {
    const normalizedCustomer = {
      ...customer,
      id: customer.id || `cliente-${Date.now()}`,
      atualizadoEm: new Date().toISOString()
    };
    writeJson(CUSTOMER_KEY, normalizedCustomer);
    return normalizedCustomer;
  }

  function getOrders() {
    return readJson(ORDERS_KEY, []);
  }

  function saveOrder(order) {
    const orders = getOrders();
    const normalizedOrder = {
      ...order,
      id: order.id || `pedido-${Date.now()}`,
      tipo: "pedido"
    };
    writeJson(ORDERS_KEY, [normalizedOrder, ...orders]);
    return normalizedOrder;
  }

  function updateOrder(orderId, updates) {
    const orders = getOrders();
    let updatedOrder = null;
    const updatedOrders = orders.map((order) => {
      if (order.id !== orderId) {
        return order;
      }

      updatedOrder = {
        ...order,
        ...updates,
        atualizadoEm: new Date().toISOString()
      };
      return updatedOrder;
    });

    writeJson(ORDERS_KEY, updatedOrders);
    return updatedOrder;
  }

  return {
    getCustomer,
    saveCustomer,
    getOrders,
    saveOrder,
    updateOrder
  };
}
