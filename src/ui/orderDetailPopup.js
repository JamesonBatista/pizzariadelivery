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

function isAcceptedOrder(statusId) {
  return statusId === "aceito" || statusId === "preparo" || statusId === "saiu-entrega";
}

function itemDetails(item) {
  const details = [];
  if (item.itensBanner?.length) {
    details.push(`Combo: ${item.itensBanner.map((bannerItem) => bannerItem.nome).join(" + ")}`);
  }
  if (item.tamanho) {
    details.push(`Tamanho: ${item.tamanho.nome}${item.tamanho.fatias ? ` (${item.tamanho.fatias} fatias)` : ""}`);
  }
  if (item.meioAMeio) {
    details.push(`Montagem: meio a meio${item.segundoSabor?.nome ? ` com ${item.segundoSabor.nome}` : ""}`);
  }
  if (item.ingredientesEmDobro?.length) {
    details.push(`Ingredientes em dobro: ${item.ingredientesEmDobro.map((ingredient) => ingredient.nome).join(", ")}`);
  }
  if (item.recheioExtra) {
    details.push(`Recheio extra: ${formatCurrency(item.valorRecheioExtra || 0)}`);
  }
  if (item.observacao) {
    details.push(`Observação: ${item.observacao}`);
  }
  return details;
}

export function createOrderDetailPopup({ elements }) {
  let lastFocusedElement = null;

  function render(order) {
    elements.title.textContent = `Pedido ${order.numeroPedido || order.id}`;
    elements.content.replaceChildren();

    const customer = order.cliente || {};

    if (isAcceptedOrder(order.statusId)) {
      const acceptedCallout = document.createElement("section");
      acceptedCallout.className = "order-detail-callout";
      acceptedCallout.innerHTML = `
        <span class="pizza-mascot pizza-mascot--mini" aria-hidden="true">
          <span class="pizza-mascot__chef"></span>
          <span class="pizza-mascot__oven"></span>
        </span>
        <div>
          <strong>Forno aceso!</strong>
          <p>A pizzaria aceitou seu pedido e a equipe ja esta cuidando dele.</p>
        </div>
      `;
      elements.content.append(acceptedCallout);
    }

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
      const details = itemDetails(item).map((detail) => `<small>${detail}</small>`).join("");
      row.innerHTML = `<span>${item.quantidade}x ${item.produtoNome}${details}</span><strong>${formatCurrency(item.total || item.precoUnitario * item.quantidade || 0)}</strong>`;
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
