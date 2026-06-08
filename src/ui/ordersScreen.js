import { formatCurrency } from "../utils/formatters.js";

const closedStatuses = new Set(["entregue", "cancelado"]);

function parseDate(value) {
  return value ? new Date(value) : new Date(0);
}

function isToday(value) {
  const date = parseDate(value);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function getStatusTone(statusId) {
  if (statusId === "recebido") {
    return "waiting";
  }

  if (statusId === "aceito" || statusId === "preparo" || statusId === "saiu-entrega") {
    return "accepted";
  }

  return "done";
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parseDate(value));
}

export function createOrdersScreen({ elements, onBack, onOpenOrder }) {
  let allOrders = [];
  let activeFilter = "today";
  let lastFocusedElement = null;

  function filterOrders() {
    return allOrders
      .filter((order) => {
        const closed = closedStatuses.has(order.statusId);
        return activeFilter === "today" ? isToday(order.criadoEm) && !closed : closed || !isToday(order.criadoEm);
      })
      .sort((a, b) => parseDate(b.criadoEm) - parseDate(a.criadoEm));
  }

  function render(orders = allOrders) {
    allOrders = orders;
    const filteredOrders = filterOrders();
    elements.list.replaceChildren();
    elements.empty.hidden = filteredOrders.length > 0;

    const fragment = document.createDocumentFragment();
    filteredOrders.forEach((order) => {
      const card = document.createElement("article");
      card.className = "order-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Abrir pedido ${order.id}`);

      const status = document.createElement("span");
      status.className = `order-card__status order-card__status--${getStatusTone(order.statusId)}`;

      const content = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = order.statusNome || "Pedido";
      const meta = document.createElement("small");
      meta.textContent = `${formatDateTime(order.criadoEm)} • ${order.itens?.length || 0} item(ns)`;
      content.append(title, meta);

      const total = document.createElement("strong");
      total.className = "order-card__total";
      total.textContent = formatCurrency(order.totais?.total || 0);

      card.append(status, content, total);
      card.addEventListener("click", () => onOpenOrder(order));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenOrder(order);
        }
      });

      fragment.append(card);
    });

    elements.list.append(fragment);
  }

  function open(orders) {
    lastFocusedElement = document.activeElement;
    elements.backdrop.hidden = false;
    render(orders);
    elements.backButton.focus();
  }

  function close() {
    elements.backdrop.hidden = true;
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  elements.backButton.addEventListener("click", () => {
    close();
    onBack();
  });

  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeFilter = tab.dataset.filter;
      elements.tabs.forEach((currentTab) => {
        currentTab.classList.toggle("is-active", currentTab === tab);
      });
      render();
    });
  });

  return {
    open,
    close,
    render
  };
}
