import { formatCurrency } from "../utils/formatters.js";

const paymentLabels = {
  pix: "Pix",
  cartao: "Credito/Debito",
  dinheiro: "Dinheiro"
};

function formatPayment(payment = {}) {
  const label = paymentLabels[payment.metodo] || payment.metodo || "Nao informado";
  return payment.metodo === "dinheiro" && payment.trocoPara
    ? `${label} - troco para ${formatCurrency(payment.trocoPara)}`
    : label;
}

function formatFullDateTime(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value ? new Date(value) : new Date());
}

export function createOrderDetailPopup({ elements }) {
  let lastFocusedElement = null;

  function render(order) {
    elements.title.textContent = `Pedido ${order.numeroPedido || order.id}`;
    elements.content.replaceChildren();

    const customer = order.cliente || {};
    const sections = [
      [
        "Pedido",
        [
          `Numero: ${order.numeroPedido || order.id}`,
          `Data e hora: ${formatFullDateTime(order.criadoEm)}`,
          `Status: ${order.statusNome || order.statusId}`
        ]
      ],
      [
        "Cliente",
        [
          `Nome: ${customer.nomeCompleto || "Nao informado"}`,
          `Bairro: ${customer.bairro || "Nao informado"}`,
          `Endereco: ${customer.endereco || "Nao informado"}`,
          `Referencia: ${customer.pontoReferencia || "Nao informado"}`
        ]
      ],
      ["Pagamento", [formatPayment(order.pagamento)]],
      [
        "Totais",
        [
          `Subtotal: ${formatCurrency(order.totais?.subtotal || 0)}`,
          `Taxa de entrega: ${formatCurrency(order.totais?.deliveryFee || 0)}`,
          `Total: ${formatCurrency(order.totais?.total || 0)}`
        ]
      ]
    ];

    const itemsSection = document.createElement("section");
    itemsSection.className = "order-detail-section";
    const itemsTitle = document.createElement("h3");
    itemsTitle.textContent = "Itens";
    const itemsList = document.createElement("div");
    itemsList.className = "order-detail-items";

    (order.itens || []).forEach((item) => {
      const row = document.createElement("div");
      row.className = "order-detail-item";
      row.innerHTML = `<span>${item.quantidade}x ${item.produtoNome}</span><strong>${formatCurrency(item.total || item.precoUnitario * item.quantidade || 0)}</strong>`;
      itemsList.append(row);
    });

    itemsSection.append(itemsTitle, itemsList);
    elements.content.append(itemsSection);

    sections.forEach(([title, lines]) => {
      const section = document.createElement("section");
      section.className = "order-detail-section";
      const heading = document.createElement("h3");
      heading.textContent = title;
      section.append(heading);
      lines.forEach((line) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = line;
        section.append(paragraph);
      });
      elements.content.append(section);
    });
  }

  function open(order) {
    lastFocusedElement = document.activeElement;
    render(order);
    elements.backdrop.hidden = false;
    elements.closeButton.focus();
  }

  function close() {
    elements.backdrop.hidden = true;
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  elements.closeButton.addEventListener("click", close);

  return {
    open,
    close
  };
}
