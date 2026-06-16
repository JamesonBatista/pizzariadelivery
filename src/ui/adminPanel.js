import { formatCurrency } from "../utils/formatters.js";

const DEFAULT_PHONE = "87999999999";
const DELIVERY_READY_MESSAGES = [
  "Prepare a mesa, sua pizza está chegando! 🔥",
  "Separa os pratos que a pizza já saiu quentinha! 🍕",
  "Corre pro guardanapo, a felicidade tá a caminho! 🛵",
  "O cheirinho de pizza já deve estar chegando aí! 😄",
  "Avisa a turma: a pizza está indo! 🍕",
  "Já pode colocar o refri pra gelar, a pizza saiu! 🥤",
  "Porta de casa em modo pizza: ativado! 🚪🍕",
  "A fome vai perder essa batalha em instantes! ⚔️🍕",
  "Sua pizza passou pelo forno e foi pra rua! 🔥",
  "Missão pizza em andamento, destino: sua casa! 🛵",
  "A borda tá chegando junto com a alegria! 😋",
  "Segura a ansiedade que a pizza tá quase aí! ⏳",
  "Mesa pronta? Porque a pizza já foi! 🍽️",
  "Hoje o jantar chega de capacete! 🛵",
  "A pizza saiu bonita demais, quase ficou pra foto! 📸",
  "O forno entregou, o entregador assumiu! 🔥",
  "A pizza está indo fazer visita na sua casa! 🏠",
  "Pode abrir espaço na mesa: vem coisa boa! 🍕",
  "A massa saiu voando pra você! 🚀",
  "A pizzaria mandou carinho em formato redondo! ❤️",
  "Seu pedido está na rota da felicidade! 🛵",
  "O queijo puxando já tá a caminho! 🧀",
  "A calabresa pediu passagem e já saiu! 🍕",
  "O momento mais esperado começou: entrega! 🎉",
  "Sua pizza está indo com cheirinho de forno! 🔥",
  "A noite acabou de ficar mais gostosa! 🌙",
  "Pode chamar a família, a pizza saiu! 👨‍👩‍👧‍👦",
  "Não pisca: daqui a pouco tem pizza na porta! 👀",
  "O forno fez a parte dele, agora é entrega! 🛵",
  "Seu pedido já está fazendo caminho bonito! 🛣️",
  "A pizza saiu com pressa de te encontrar! 😄",
  "A fome que lute, sua pizza já saiu! 💪",
  "Tudo pronto por aqui, agora é com o entregador! 🛵",
  "Sua pizza está em modo turbo! 🚀",
  "A felicidade redonda está chegando! 🍕",
  "A cozinha liberou sua obra-prima! 👨‍🍳",
  "A pizza saiu do forno direto pro seu endereço! 🔥",
  "Pega o molho, pega o prato, tá chegando! 🍽️",
  "Seu pedido está indo quentinho e caprichado! 🍕",
  "A pizzaria avisou: é hora de preparar a mesa! 📣",
  "A entrega saiu e a fome já pode comemorar! 🎉",
  "Sua pizza está a poucos passos de virar memória boa! 😋",
  "Hoje tem pizza chegando com estilo! ✨",
  "O entregador saiu levando coisa séria: sua pizza! 🛵",
  "A pizza está chegando para salvar o dia! 🦸",
  "Já pode escolher o melhor pedaço! 🍕",
  "Seu pedido saiu bonito, cheiroso e quentinho! 🔥",
  "A mesa vai ficar mais feliz em alguns minutos! 🍽️",
  "A pizza está indo, e ela não gosta de esperar! 😄",
  "Prepare o sorriso: sua pizza saiu pra entrega! 😊"
];
const UNPAID_REMINDERS = [
  "eita {nome} não esquece de mim quando a pizza chegar kkk",
  "{nome}, combina comigo: pizza chega e pagamento também kkk",
  "ô {nome}, deixa o troquinho no jeito pra pizza não ficar tímida kkk",
  "{nome}, a pizza vai quentinha e a cobrança vai de levinho kkk",
  "não esquece da pizzaria, {nome}, a gente lembra de você com carinho kkk",
  "{nome}, separa o valor pra pizza chegar sem climão kkk",
  "eita {nome}, a pizza tá indo e o pagamento vai junto no pensamento kkk",
  "{nome}, quando o queijo puxar lembra de acertar com a gente kkk",
  "ô {nome}, pizza boa merece final feliz no pagamento kkk",
  "{nome}, deixa tudo pronto que a pizza e a continha chegam juntinhas kkk",
  "não some na hora do pagamento, {nome}, a pizza tá caprichada kkk",
  "{nome}, a pizza chega sorrindo se o pagamento estiver esperando kkk",
  "ô {nome}, ajuda a pizzaria a continuar assando felicidade kkk",
  "{nome}, quando bater a fome lembra de bater o pix também kkk",
  "eita {nome}, guarda um carinho pro entregador e o valor pra pizzaria kkk",
  "{nome}, pizza chegando e pagamento no esquema, fechado? kkk",
  "ô {nome}, a massa é leve mas a continha existe kkk",
  "{nome}, não deixa a pizza pagar a conta sozinha kkk",
  "eita {nome}, se a pizza chegar antes do pagamento ela fica ciumenta kkk",
  "{nome}, deixa o valor separado que a pizza vai chegar brilhando kkk"
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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
    .map((item) => {
      const details = buildItemDetails(item);
      return `• ${item.quantidade}x ${item.produtoNome} - ${formatCurrency(item.total || item.precoUnitario * item.quantidade || 0)}${details.text ? `\n  ${details.text}` : ""}`;
    })
    .join("\n");
}

function buildItemDetails(item) {
  const parts = [];
  if (item.itensBanner?.length) {
    parts.push(`Combo: ${item.itensBanner.map((bannerItem) => bannerItem.nome).join(" + ")}`);
  }
  if (item.tamanho) {
    parts.push(`Tamanho: ${item.tamanho.nome}${item.tamanho.fatias ? ` (${item.tamanho.fatias} fatias)` : ""}`);
  }
  if (item.meioAMeio) {
    parts.push(`Montagem: meio a meio${item.segundoSabor?.nome ? ` com ${item.segundoSabor.nome}` : ""}`);
  }
  if (item.ingredientesEmDobro?.length) {
    parts.push(`Ingredientes em dobro: ${item.ingredientesEmDobro.map((ingredient) => ingredient.nome).join(", ")}`);
  }
  if (item.recheioExtra) {
    parts.push(`Recheio extra: ${formatCurrency(item.valorRecheioExtra || 0)}`);
  }
  if (item.observacao) {
    parts.push(`Observação: ${item.observacao}`);
  }

  return {
    text: parts.join(" | "),
    html: parts.map((part) => `<small>${escapeHtml(part)}</small>`).join("")
  };
}

function customerPhone(order) {
  return order.cliente?.telefone || DEFAULT_PHONE;
}

function acceptedMessage(order) {
  return `🍕 Olá, ${order.cliente?.nomeCompleto || "cliente"}!\n\n✅ A pizzaria aceitou sua solicitação e já está preparando tudo com carinho.\n\n🕒 Aberto em: ${formatDateTime(order.criadoEm)}\n\n${orderItemsText(order)}${cashChangeText(order)}\n\nObrigado por pedir com a gente! 👨‍🍳🔥`;
}

function customerFirstName(order) {
  return String(order.cliente?.nomeCompleto || "cliente").trim().split(/\s+/)[0] || "cliente";
}

function deliveryMessage(order, { includePaymentReminder = false } = {}) {
  const paymentText = includePaymentReminder
    ? `\n\n💰 Valor: ${formatCurrency(orderTotal(order))}\n_${randomUnpaidReminder(order)}_`
    : "";
  const readyText = randomDeliveryReadyMessage();

  return `🛵🍕 Olá, ${order.cliente?.nomeCompleto || "cliente"}!\n\nSua pizza saiu para entrega.\n\n📍 Entrega: ${order.cliente?.endereco || ""} - ${order.cliente?.bairro || ""}\n📌 Referência: ${order.cliente?.pontoReferencia || "não informada"}${paymentText}\n\n${readyText}`;
}

function cancelMessage(order) {
  return `🍕 Olá, ${order.cliente?.nomeCompleto || "cliente"}!\n\nPassando para avisar com carinho que não vamos conseguir seguir com essa solicitação agora.\n\nSe quiser, chama a pizzaria por aqui que a gente te ajuda a escolher outra opção deliciosa. ❤️`;
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
  return `${order.cliente?.nomeCompleto || "Cliente"} • ${formatCurrency(orderTotal(order))} • ${formatDateTime(order.fechadoEm || order.criadoEm)}`;
}

function randomFrom(list, seed = Date.now()) {
  return list[Math.abs(Number(seed)) % list.length];
}

function randomDeliveryReadyMessage() {
  return randomFrom(DELIVERY_READY_MESSAGES, Date.now());
}

function randomUnpaidReminder(order) {
  return randomFrom(UNPAID_REMINDERS, order.numeroPedido || Date.now()).replace("{nome}", customerFirstName(order));
}

function cashChangeAmount(order) {
  if (order.pagamento?.metodo !== "dinheiro") return 0;
  const total = orderTotal(order);
  const paid = Number(order.pagamento?.trocoPara || 0);
  if (!Number.isFinite(paid) || !Number.isFinite(total) || paid <= total || paid > 10000) return 0;
  return paid - total;
}

function cashChangeText(order) {
  const change = cashChangeAmount(order);
  return change > 0 ? `\n\n💵 Troco: *${formatCurrency(change)}*` : "";
}

export function createAdminPanel({
  elements,
  getOrders,
  getCustomers,
  getCategories,
  onCreateProduct,
  updateOrder,
  onClose
}) {
  let activeColumn = "pending";
  let selectedStartDate = formatDateInput(new Date());
  let selectedEndDate = formatDateInput(new Date());

  function formatDateInput(date) {
    return date.toISOString().slice(0, 10);
  }

  function isWithinDateRange(date, startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);
    return date >= start && date <= end;
  }

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
      message: "Confirme antes de enviar a mensagem de entrega. Se não foi pago, o cliente receberá o valor do pedido.",
      confirmText: "Sim, foi pago",
      cancelText: "Nao foi pago",
      onConfirm() {
        const updatedOrder = updateOrder(order.id, {
          statusId: "entregue",
          statusNome: "Finalizado",
          pago: true,
          fechadoEm: new Date().toISOString()
        }) || order;
        openWhatsapp(customerPhone(updatedOrder), deliveryMessage(updatedOrder, { includePaymentReminder: false }));
        render();
      }
    });

    const popup = document.querySelector(".admin-popup-backdrop:last-child");
    popup.querySelector("[data-action='cancel']").addEventListener("click", () => {
      const updatedOrder = updateOrder(order.id, {
        statusId: "aceito",
        statusNome: "Aceito",
        pago: false,
        pagamentoPendente: true
      }) || order;
      openWhatsapp(customerPhone(updatedOrder), deliveryMessage(updatedOrder, { includePaymentReminder: true }));
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
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Pedido ${escapeHtml(order.numeroPedido || order.id)}</title>
          <style>
            * { box-sizing: border-box; }
            body { width: 80mm; margin: 0 auto; padding: 8px; color: #111; font-family: "Courier New", monospace; font-size: 12px; }
            h1 { margin: 0; text-align: center; font-size: 18px; letter-spacing: 1px; }
            h2 { margin: 10px 0 6px; text-align: center; font-size: 13px; border-top: 1px dashed #111; border-bottom: 1px dashed #111; padding: 5px 0; }
            p { margin: 3px 0; }
            .center { text-align: center; }
            .line { border-top: 1px dashed #111; margin: 8px 0; }
            .item { margin: 7px 0; }
            .item strong { display: block; }
            .item small { display: block; margin-left: 8px; }
            .row { display: flex; justify-content: space-between; gap: 8px; }
            .total { margin-top: 8px; padding-top: 6px; border-top: 1px dashed #111; font-size: 16px; font-weight: 800; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>PIZZARIA</h1>
          <p class="center">CUPOM DO PEDIDO</p>
          <div class="line"></div>
          <p>Pedido: ${escapeHtml(order.numeroPedido || order.id)}</p>
          <p>Status: ${escapeHtml(order.statusNome || "")}</p>
          <p>Aberto: ${escapeHtml(formatDateTime(order.criadoEm))}</p>
          <div class="line"></div>
          <p>Cliente: ${escapeHtml(order.cliente?.nomeCompleto || "")}</p>
          <p>Fone: ${escapeHtml(customerPhone(order))}</p>
          <p>End: ${escapeHtml(order.cliente?.endereco || "")}</p>
          <p>Bairro: ${escapeHtml(order.cliente?.bairro || "")}</p>
          <p>Ref: ${escapeHtml(order.cliente?.pontoReferencia || "Não informada")}</p>
          <h2>ITENS</h2>
          ${(order.itens || []).map((item) => {
            const details = buildItemDetails(item);
            return `<div class="item"><div class="row"><strong>${escapeHtml(`${item.quantidade}x ${item.produtoNome}`)}</strong><strong>${escapeHtml(formatCurrency(item.total || item.precoUnitario * item.quantidade || 0))}</strong></div>${details.html}</div>`;
          }).join("")}
          <div class="line"></div>
          <p>Pagamento: ${escapeHtml(order.pagamento?.metodo || "Nao informado")}</p>
          ${cashChangeAmount(order) > 0 ? `<p>Troco: ${escapeHtml(formatCurrency(cashChangeAmount(order)))}</p>` : ""}
          <p class="row"><span>Subtotal</span><strong>${escapeHtml(formatCurrency(order.totais?.subtotal || 0))}</strong></p>
          <p class="row"><span>Entrega</span><strong>${escapeHtml(formatCurrency(order.totais?.deliveryFee || 0))}</strong></p>
          <p class="row total"><span>TOTAL</span><strong>${escapeHtml(formatCurrency(orderTotal(order)))}</strong></p>
          <div class="line"></div>
          <p class="center">Obrigado pela preferencia!</p>
          <button onclick="window.print()">Imprimir</button>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 250);
  }

  function createOrderCard(order) {
    const card = document.createElement("article");
    card.className = `admin-order-card ${order.pagamentoPendente ? "has-payment-warning" : ""}`;

    const items = (order.itens || [])
      .map((item) => {
        const details = buildItemDetails(item);
        return `<li><span>${item.quantidade}x ${item.produtoNome}</span><strong>${formatCurrency(item.total || item.precoUnitario * item.quantidade || 0)}</strong>${details.html}</li>`;
      })
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
        <p><strong>Pagamento:</strong> ${order.pagamento?.metodo || "Nao informado"}${cashChangeAmount(order) > 0 ? ` • Troco ${formatCurrency(cashChangeAmount(order))}` : ""}</p>
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
      ["pending", "Pendentes", pending, true],
      ["accepted", "Aceito", accepted, false],
      ["finished", "Finalizado", finished, false]
    ];

    const board = document.createElement("div");
    board.className = "admin-board";

    const tabs = document.createElement("div");
    tabs.className = "admin-status-tabs";
    columns.forEach(([id, title, columnOrders, showCounter]) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = `admin-status-tab ${id === activeColumn ? "is-active" : ""}`;
      tab.dataset.column = id;
      tab.innerHTML = `${title}${showCounter ? ` <span>${columnOrders.length}</span>` : ""}`;
      tabs.append(tab);
    });

    const selectedColumn = columns.find(([id]) => id === activeColumn) || columns[0];
    const [, title, columnOrders, showCounter] = selectedColumn;
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
    board.append(tabs, column);

    tabs.addEventListener("click", (event) => {
      const columnId = event.target?.closest("button")?.dataset?.column;
      if (!columnId) return;
      activeColumn = columnId;
      render();
    });

    return board;
  }

  function renderFinance() {
    const orders = getOrders().filter(isPaidOrder);
    const now = new Date();
    const selectedOrders = orders.filter((order) =>
      isWithinDateRange(new Date(order.fechadoEm || order.criadoEm), selectedStartDate, selectedEndDate)
    );

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
        <article data-period-shortcut="day"><span>Hoje</span><strong>${formatCurrency(totalsFor(orders, (order) => sameDay(new Date(order.fechadoEm || order.criadoEm), now)))}</strong></article>
        <article data-period-shortcut="week"><span>Semana</span><strong>${formatCurrency(totalsFor(orders, (order) => sameWeek(new Date(order.fechadoEm || order.criadoEm), now)))}</strong></article>
        <article data-period-shortcut="month"><span>Mes</span><strong>${formatCurrency(totalsFor(orders, (order) => sameMonth(new Date(order.fechadoEm || order.criadoEm), now)))}</strong></article>
      </div>
      <div class="finance-period-grid">
        <label class="form-field">
          Data inicial
          <input id="finance-start-date" type="date" value="${selectedStartDate}" />
        </label>
        <label class="form-field">
          Data final
          <input id="finance-end-date" type="date" value="${selectedEndDate}" />
        </label>
      </div>
      <div class="finance-orders">
        ${selectedOrders.map((order) => `<div><span>${escapeHtml(order.cliente?.nomeCompleto || "Cliente")}</span><strong>${escapeHtml(formatCurrency(orderTotal(order)))}</strong><small>${escapeHtml(formatDateTime(order.fechadoEm || order.criadoEm))}</small></div>`).join("")}
      </div>
    `;
    elements.content.querySelectorAll("[data-period-shortcut]").forEach((card) => {
      card.addEventListener("click", () => {
        const date = new Date();
        if (card.dataset.periodShortcut === "day") {
          selectedStartDate = formatDateInput(date);
          selectedEndDate = formatDateInput(date);
        }
        if (card.dataset.periodShortcut === "week") {
          selectedEndDate = formatDateInput(date);
          selectedStartDate = formatDateInput(new Date(date.getTime() - 6 * 24 * 60 * 60 * 1000));
        }
        if (card.dataset.periodShortcut === "month") {
          selectedStartDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
          selectedEndDate = formatDateInput(date);
        }
        renderFinance();
      });
    });
    elements.content.querySelector("#finance-start-date").addEventListener("change", (event) => {
      selectedStartDate = event.target.value || selectedStartDate;
      renderFinance();
    });
    elements.content.querySelector("#finance-end-date").addEventListener("change", (event) => {
      selectedEndDate = event.target.value || selectedEndDate;
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

  function parseIngredients(value) {
    return String(value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [name, price = "0"] = line.split(":");
        const nome = name.trim();
        return {
          id: nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-") || `ingrediente-${index}`,
          nome,
          preco: Number(price.replace(",", ".") || 0)
        };
      });
  }

  function sizeFromForm(formData, id, fallbackName, fallbackSlices) {
    return {
      id,
      nome: String(formData.get(`size-${id}-name`) || fallbackName).trim(),
      fatias: Number(formData.get(`size-${id}-slices`) || fallbackSlices),
      preco: Number(String(formData.get(`size-${id}-price`) || 0).replace(",", "."))
    };
  }

  function renderProductForm() {
    const categories = getCategories();
    elements.content.innerHTML = `
      <div class="admin-toolbar">
        <button class="screen-back" type="button" data-admin-view="board">Voltar</button>
      </div>
      <section class="admin-product-builder">
        <div>
          <p class="admin-header__eyebrow">Novo produto</p>
          <h3>Adicionar ao cardapio</h3>
          <p>Campos preparados conforme o JSON atual: categoria, produto, tamanhos, meio a meio e ingredientes em dobro.</p>
        </div>
        <form id="admin-product-form" class="admin-product-form">
          <label class="form-field">
            Categoria
            <select name="categoriaId" required>
              ${categories.map((category) => `<option value="${category.id}">${category.nome}</option>`).join("")}
            </select>
          </label>
          <label class="form-field">
            Nome
            <input name="nome" required placeholder="Pizza moda da casa" />
          </label>
          <label class="form-field">
            Descricao
            <textarea name="descricao" rows="3" required placeholder="Ingredientes e detalhes do produto"></textarea>
          </label>
          <label class="form-field">
            Preco base
            <input name="preco" type="number" step="0.01" required placeholder="59.90" />
          </label>
          <label class="form-field">
            Imagem
            <input name="imagem" value="./assets/images/pizza-salgada.svg" required />
          </label>
          <div class="admin-product-sizes">
            ${[
              ["p", "Pequena", 4],
              ["m", "Media", 6],
              ["g", "Grande", 8],
              ["familia", "Familia", 12]
            ].map(([id, name, slices]) => `
              <fieldset>
                <legend>${name}</legend>
                <input name="size-${id}-name" value="${name}" />
                <input name="size-${id}-slices" type="number" value="${slices}" />
                <input name="size-${id}-price" type="number" step="0.01" placeholder="Preco" />
              </fieldset>
            `).join("")}
          </div>
          <label class="form-field">
            Ingredientes em dobro
            <textarea name="ingredientes" rows="4" placeholder="Calabresa:6&#10;Mussarela:5&#10;Catupiry:7"></textarea>
          </label>
          <label class="checkbox-row">
            <input name="permiteMeioAMeio" type="checkbox" checked />
            <span>Permite montagem meio a meio</span>
          </label>
          <label class="checkbox-row">
            <input name="disponivel" type="checkbox" checked />
            <span>Produto disponivel</span>
          </label>
          <button class="button button--full" type="submit">Salvar produto</button>
        </form>
      </section>
    `;

    elements.content.querySelector("[data-admin-view='board']").addEventListener("click", render);
    elements.content.querySelector("#admin-product-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const product = {
        categoriaId: String(formData.get("categoriaId")),
        nome: String(formData.get("nome") || "").trim(),
        descricao: String(formData.get("descricao") || "").trim(),
        preco: Number(String(formData.get("preco") || 0).replace(",", ".")),
        imagem: String(formData.get("imagem") || "").trim(),
        tamanhos: [
          sizeFromForm(formData, "p", "Pequena", 4),
          sizeFromForm(formData, "m", "Media", 6),
          sizeFromForm(formData, "g", "Grande", 8),
          sizeFromForm(formData, "familia", "Familia", 12)
        ].filter((size) => size.preco > 0),
        ingredientesEmDobro: parseIngredients(formData.get("ingredientes")),
        permiteMeioAMeio: formData.has("permiteMeioAMeio"),
        disponivel: formData.has("disponivel")
      };
      onCreateProduct(product);
      showAdminPopup({
        title: "Produto salvo",
        message: "O produto foi adicionado ao cardapio local e ja aparece para o cliente.",
        confirmText: "Voltar ao painel",
        onConfirm: render
      });
    });
  }

  function render() {
    elements.content.replaceChildren();
    const toolbar = document.createElement("div");
    toolbar.className = "admin-toolbar";
    toolbar.innerHTML = `
      <button class="admin-add-button" type="button" data-admin-view="product">+</button>
      <button class="button" type="button" data-admin-view="contact">Falar com cliente</button>
      <button class="button button--ghost" type="button" data-admin-view="finance">Controle Financeiro</button>
    `;
    elements.content.append(toolbar, renderColumns());
    toolbar.querySelector("[data-admin-view='product']").addEventListener("click", renderProductForm);
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
