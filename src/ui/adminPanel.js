import { formatCurrency } from "../utils/formatters.js";

const DEFAULT_PHONE = "87999999999";

function normalizePhone(phone) {
  const digits = String(phone || DEFAULT_PHONE).replace(/\D/g, "");
  return digits || DEFAULT_PHONE;
}

function openWhatsapp(phone, message) {
  const normalizedPhone = normalizePhone(phone);
  const url = `https://wa.me/55${normalizedPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value ? new Date(value) : new Date());
}

function orderTotal(order) {
  return Number(order.totais?.total || 0);
}

function orderItemsText(order) {
  return (order.itens || [])
    .map((item) => `• ${item.quantidade}x ${item.produtoNome} - ${formatCurrency(item.total || item.precoUnitario * item.quantidade || 0)}`)
    .join("\n");
}

function customerPhone(order) {
  return order.cliente?.telefone || DEFAULT_PHONE;
}

function acceptedMessage(order) {
  return `🍕 Olá, ${order.cliente?.nomeCompleto || "cliente"}!\n\n✅ Seu pedido ${order.numeroPedido || order.id} foi ACEITO pela pizzaria e já está sendo preparado.\n\n🕒 Pedido aberto em: ${formatDateTime(order.criadoEm)}\n\n${orderItemsText(order)}\n\n💰 Total: ${formatCurrency(orderTotal(order))}\n\nObrigado por pedir com a gente! 👨‍🍳🔥`;
}

function deliveryMessage(order) {
  return `🛵🍕 Olá, ${order.cliente?.nomeCompleto || "cliente"}!\n\nSeu pedido ${order.numeroPedido || order.id} saiu para entrega.\n\n📍 Entrega: ${order.cliente?.endereco || ""} - ${order.cliente?.bairro || ""}\n📌 Referência: ${order.cliente?.pontoReferencia || "não informada"}\n\n💰 Total: ${formatCurrency(orderTotal(order))}\n\nPrepare a mesa, sua pizza está chegando! 🔥`;
}

function cancelMessage(order) {
  return `🍕 Olá, ${order.cliente?.nomeCompleto || "cliente"}.\n\nPrecisamos cancelar o pedido ${order.numeroPedido || order.id}.\n\nSe quiser, fale com a pizzaria para mais detalhes.`;
}

function contactMessage(customer, text) {
  return `Olá ${customer.nomeCompleto}, a Pizzaria tem uma mensagem para você:\n\n${text}`;
}

function statusColumn(order) {
  if (order.statusId === "recebido") {
    return "pending";
  }

  if (order.statusId === "entregue" || order.statusId === "cancelado") {
    return "finished";
  }

  return "accepted";
}

function isPaidOrder(order) {
  return order.statusId === "entregue" && order.pago !== false;
}

function totalsFor(orders, predicate) {
  return orders.filter(predicate).reduce((total, order) => total + orderTotal(order), 0);
}

function sameDay(date, reference = new Date()) {
  return date.toDateString() === reference.toDateString();
}

function sameWeek(date, reference = new Date()) {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return reference - date <= weekMs && date <= reference;
}

function sameMonth(date, reference = new Date()) {
  return date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear();
}

function buildOrderLine(order) {
  return `${order.numeroPedido || order.id} • ${formatDateTime(order.criadoEm)} • ${formatCurrency(orderTotal(order))}`;
}

export function createAdminPanel({ elements, getOrders, getCustomers, updateOrder, onClose }) {
  let selectedPeriod = "day";

  function showAdminPopup({ title, message, confirmText = "Confirmar", cancelText = "Cancelar", onConfirm }) {
    const backdrop = document.createElement("div");
    backdrop.className = "admin-popup-backdrop";
    backdrop.innerHTML = `
      <section class="admin-popup" role="dialog" aria-modal="true">
        <p class="admin-header__eyebrow">Confirmacao</p>
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="admin-popup__actions">
          <button class="button button--ghost" type="button" data-action="cancel">${cancelText}</button>
          <button class="button" type="button" data-action="confirm">${confirmText}</button>
        </div>
      </section>
    `;

    backdrop.addEventListener("click", (event) => {
      const action = event.target?.dataset?.action;
      if (event.target === backdrop || action === "cancel") {
        backdrop.remove();
      }
      if (action === "confirm") {
        backdrop.remove();
        onConfirm?.();
      }
    });

    document.body.append(backdrop);
  }

  function showPaymentPopup(order) {
    showAdminPopup({
      title: "O pedido foi pago?",
      message: "Confirme se o pagamento já foi recebido antes de finalizar o pedido.",
      confirmText: "Sim, foi pago",
      cancelText: "Nao foi pago",
      onConfirm() {
        updateOrder(order.id, {
          statusId: "entregue",
          statusNome: "Finalizado",
          pago: true,
          fechadoEm: new Date().toISOString()
        });
        render();
      }
    });

    const popup = document.querySelector(".admin-popup-backdrop:last-child");
    popup.querySelector("[data-action='cancel']").addEventListener("click", () => {
      updateOrder(order.id, {
        statusId: "aceito",
        statusNome: "Aceito",
        pago: false,
        pagamentoPendente: true
      });
      render();
    }, { once: true });
  }

  function acceptOrder(order) {
    const updatedOrder = updateOrder(order.id, {
      statusId: "aceito",
      statusNome: "Aceito",
      aceitoEm: new Date().toISOString()
    });
    openWhatsapp(customerPhone(updatedOrder || order), acceptedMessage(updatedOrder || order));
    render();
  }

  function refuseOrder(order) {
    showAdminPopup({
      title: "Recusar pedido?",
      message: "O pedido será cancelado e sairá da coluna de pendentes.",
      confirmText: "Recusar",
      onConfirm() {
        const updatedOrder = updateOrder(order.id, {
          statusId: "cancelado",
          statusNome: "Cancelado",
          fechadoEm: new Date().toISOString()
        });
        openWhatsapp(customerPhone(updatedOrder || order), cancelMessage(updatedOrder || order));
        render();
      }
    });
  }

  function sendDelivery(order) {
    const updatedOrder = updateOrder(order.id, {
      statusId: "saiu-entrega",
      statusNome: "Saiu para entrega",
      saiuEntregaEm: new Date().toISOString()
    }) || order;
    openWhatsapp(customerPhone(updatedOrder), deliveryMessage(updatedOrder));
    showPaymentPopup(updatedOrder);
  }

  function cancelAccepted(order) {
    showAdminPopup({
      title: "Cancelar pedido?",
      message: "O cliente receberá uma mensagem de cancelamento pelo WhatsApp.",
      confirmText: "Cancelar pedido",
      onConfirm() {
        const updatedOrder = updateOrder(order.id, {
          statusId: "cancelado",
          statusNome: "Cancelado",
          fechadoEm: new Date().toISOString()
        });
        openWhatsapp(customerPhone(updatedOrder || order), cancelMessage(updatedOrder || order));
        render();
      }
    });
  }

  function returnToAccepted(order) {
    showAdminPopup({
      title: "Voltar para aceito?",
      message: "Esse pedido voltará para a coluna Aceito.",
      confirmText: "Voltar",
      onConfirm() {
        updateOrder(order.id, {
          statusId: "aceito",
          statusNome: "Aceito",
          pago: false,
          fechadoEm: null
        });
        render();
      }
    });
  }

  function printOrder(order) {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head><title>Pedido ${order.numeroPedido || order.id}</title></head>
        <body>
          <h1>Pedido ${order.numeroPedido || order.id}</h1>
          <p><strong>Status:</strong> ${order.statusNome}</p>
          <p><strong>Cliente:</strong> ${order.cliente?.nomeCompleto || ""}</p>
          <p><strong>Telefone:</strong> ${customerPhone(order)}</p>
          <p><strong>Endereco:</strong> ${order.cliente?.endereco || ""} - ${order.cliente?.bairro || ""}</p>
          <pre>${orderItemsText(order)}</pre>
          <h2>Total: ${formatCurrency(orderTotal(order))}</h2>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  function createOrderCard(order) {
    const card = document.createElement("article");
    card.className = `admin-order-card ${order.pagamentoPendente ? "has-payment-warning" : ""}`;

    const items = (order.itens || [])
      .map((item) => `<li>${item.quantidade}x ${item.produtoNome} <strong>${formatCurrency(item.total || item.precoUnitario * item.quantidade || 0)}</strong></li>`)
      .join("");

    card.innerHTML = `
      <header>
        <div>
          <strong>Pedido ${order.numeroPedido || order.id}</strong>
          <small>${formatDateTime(order.criadoEm)}</small>
        </div>
        <button type="button" data-action="print">Imprimir</button>
      </header>
      ${order.pagamentoPendente ? "<p class='admin-payment-warning'><strong>FALTA PAGAMENTO</strong></p>" : ""}
      <section>
        <p><strong>Cliente:</strong> ${order.cliente?.nomeCompleto || "Nao informado"}</p>
        <p><strong>WhatsApp:</strong> ${customerPhone(order)}</p>
        <p><strong>Entrega:</strong> ${order.cliente?.endereco || ""} - ${order.cliente?.bairro || ""}</p>
        <p><strong>Referencia:</strong> ${order.cliente?.pontoReferencia || "Nao informada"}</p>
      </section>
      <ul>${items}</ul>
      <footer>
        <strong>${formatCurrency(orderTotal(order))}</strong>
        <div class="admin-card-actions"></div>
      </footer>
    `;

    const actions = card.querySelector(".admin-card-actions");
    const column = statusColumn(order);

    if (column === "pending") {
      actions.innerHTML = `
        <button type="button" data-action="accept">Aceitar</button>
        <button type="button" data-action="refuse">Recusar</button>
      `;
    }

    if (column === "accepted") {
      actions.innerHTML = `
        <button type="button" data-action="delivery">Entrega</button>
        <button type="button" data-action="cancel">Cancelar</button>
      `;
    }

    if (column === "finished") {
      actions.innerHTML = `<button type="button" data-action="return">Voltar</button>`;
    }

    card.addEventListener("click", (event) => {
      const action = event.target?.dataset?.action;
      if (!action) return;
      if (action === "print") printOrder(order);
      if (action === "accept") acceptOrder(order);
      if (action === "refuse") refuseOrder(order);
      if (action === "delivery") sendDelivery(order);
      if (action === "cancel") cancelAccepted(order);
      if (action === "return") returnToAccepted(order);
    });

    return card;
  }

  function renderColumns() {
    const orders = getOrders();
    const pending = orders.filter((order) => statusColumn(order) === "pending");
    const accepted = orders.filter((order) => statusColumn(order) === "accepted");
    const finished = orders.filter((order) => statusColumn(order) === "finished");

    const columns = [
      ["Pendentes", pending, true],
      ["Aceito", accepted, false],
      ["Finalizado", finished, false]
    ];

    const board = document.createElement("div");
    board.className = "admin-board";
    columns.forEach(([title, columnOrders, showCounter]) => {
      const column = document.createElement("section");
      column.className = "admin-column";
      column.innerHTML = `
        <header>
          <h3>${title}${showCounter ? ` <span>${columnOrders.length}</span>` : ""}</h3>
        </header>
      `;

      const list = document.createElement("div");
      list.className = "admin-column__list";
      columnOrders.forEach((order) => list.append(createOrderCard(order)));
      column.append(list);
      board.append(column);
    });

    return board;
  }

  function renderFinance() {
    const orders = getOrders().filter(isPaidOrder);
    const now = new Date();
    const selectedOrders = orders.filter((order) => {
      const date = new Date(order.fechadoEm || order.criadoEm);
      if (selectedPeriod === "day") return sameDay(date, now);
      if (selectedPeriod === "week") return sameWeek(date, now);
      if (selectedPeriod === "month") return sameMonth(date, now);
      return true;
    });

    elements.content.innerHTML = `
      <div class="admin-toolbar">
        <button class="screen-back" type="button" data-admin-view="board">Voltar</button>
      </div>
      <section class="finance-hero">
        <p class="admin-header__eyebrow">Controle financeiro</p>
        <h3>${formatCurrency(totalsFor(selectedOrders, () => true))}</h3>
        <span>Total do periodo selecionado</span>
      </section>
      <div class="finance-grid">
        <article><span>Hoje</span><strong>${formatCurrency(totalsFor(orders, (order) => sameDay(new Date(order.fechadoEm || order.criadoEm), now)))}</strong></article>
        <article><span>Semana</span><strong>${formatCurrency(totalsFor(orders, (order) => sameWeek(new Date(order.fechadoEm || order.criadoEm), now)))}</strong></article>
        <article><span>Mes</span><strong>${formatCurrency(totalsFor(orders, (order) => sameMonth(new Date(order.fechadoEm || order.criadoEm), now)))}</strong></article>
      </div>
      <label class="form-field">
        Periodo
        <select id="finance-period">
          <option value="day">Hoje</option>
          <option value="week">Semana</option>
          <option value="month">Mes</option>
          <option value="all">Todos</option>
        </select>
      </label>
      <div class="finance-orders">
        ${selectedOrders.map((order) => `<div><span>${buildOrderLine(order)}</span><strong>${order.pagamento?.metodo || ""}</strong></div>`).join("")}
      </div>
    `;
    elements.content.querySelector("#finance-period").value = selectedPeriod;
    elements.content.querySelector("#finance-period").addEventListener("change", (event) => {
      selectedPeriod = event.target.value;
      renderFinance();
    });
    elements.content.querySelector("[data-admin-view='board']").addEventListener("click", render);
  }

  function renderContact() {
    const customers = getCustomers();
    elements.content.innerHTML = `
      <div class="admin-toolbar">
        <button class="screen-back" type="button" data-admin-view="board">Voltar</button>
      </div>
      <section class="admin-contact">
        <p class="admin-header__eyebrow">Falar com cliente</p>
        <h3>Mensagem pelo WhatsApp</h3>
        <label class="form-field">
          Cliente
          <select id="admin-customer-select">
            ${customers.map((customer) => `<option value="${customer.telefone || DEFAULT_PHONE}">${customer.nomeCompleto}</option>`).join("")}
          </select>
        </label>
        <label class="form-field">
          Mensagem
          <textarea id="admin-contact-message" rows="5" placeholder="Digite a mensagem para o cliente"></textarea>
        </label>
        <button class="button button--full" id="admin-send-contact" type="button">Enviar WhatsApp</button>
      </section>
    `;
    elements.content.querySelector("[data-admin-view='board']").addEventListener("click", render);
    elements.content.querySelector("#admin-send-contact").addEventListener("click", () => {
      const select = elements.content.querySelector("#admin-customer-select");
      const selectedCustomer = customers.find((customer) => (customer.telefone || DEFAULT_PHONE) === select.value) || customers[0];
      const text = elements.content.querySelector("#admin-contact-message").value.trim();
      if (!selectedCustomer || !text) return;
      openWhatsapp(select.value, contactMessage(selectedCustomer, text));
    });
  }

  function render() {
    elements.content.replaceChildren();
    const toolbar = document.createElement("div");
    toolbar.className = "admin-toolbar";
    toolbar.innerHTML = `
      <button class="button" type="button" data-admin-view="contact">Falar com cliente</button>
      <button class="button button--ghost" type="button" data-admin-view="finance">Controle Financeiro</button>
    `;
    elements.content.append(toolbar, renderColumns());
    toolbar.querySelector("[data-admin-view='contact']").addEventListener("click", renderContact);
    toolbar.querySelector("[data-admin-view='finance']").addEventListener("click", renderFinance);
  }

  function open() {
    elements.backdrop.hidden = false;
    render();
  }

  function close() {
    elements.backdrop.hidden = true;
    onClose();
  }

  elements.closeButton.addEventListener("click", close);

  return {
    open,
    close,
    render
  };
}
