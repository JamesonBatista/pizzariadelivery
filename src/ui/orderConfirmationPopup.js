import { formatCurrency } from "../utils/formatters.js";

const paymentLabels = {
  pix: "Pix",
  cartao: "Credito/Debito",
  dinheiro: "Dinheiro"
};

export function createOrderConfirmationPopup({ elements, onCancel, onConfirm }) {
  let lastFocusedElement = null;
  let currentOrder = null;

  function renderItems(items) {
    elements.items.replaceChildren();

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "confirmation-item";

      const details = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = `${item.quantidade}x ${item.produtoNome}`;
      const meta = document.createElement("span");
      const metaParts = [];
      if (item.itensBanner?.length) {
        metaParts.push(`Combo: ${item.itensBanner.map((bannerItem) => bannerItem.nome).join(" + ")}`);
      }
      if (item.tamanho) {
        metaParts.push(item.tamanho.nome);
      }
      if (item.meioAMeio) {
        metaParts.push("Meio a meio");
      }
      if (item.ingredientesEmDobro?.length) {
        metaParts.push(`Em dobro: ${item.ingredientesEmDobro.map((ingredient) => ingredient.nome).join(", ")}`);
      }
      if (item.recheioExtra) {
        metaParts.push("Recheio extra");
      }
      meta.textContent = metaParts.length ? metaParts.join(" • ") : "Sem adicionais";
      details.append(name, meta);

      const value = document.createElement("strong");
      value.textContent = formatCurrency(item.precoUnitario * item.quantidade);

      row.append(details, value);
      fragment.append(row);
    });

    elements.items.append(fragment);
  }

  function formatPayment(payment) {
    const label = paymentLabels[payment.metodo] || payment.metodo;

    if (payment.metodo === "dinheiro" && payment.trocoPara) {
      return `${label} - troco para ${formatCurrency(payment.trocoPara)}`;
    }

    return label;
  }

  function cashChangeAmount(order) {
    if (order.payment?.metodo !== "dinheiro") return 0;
    const total = Number(order.totals?.total || 0);
    const paid = Number(order.payment?.trocoPara || 0);
    if (!Number.isFinite(paid) || !Number.isFinite(total) || paid <= total || paid > 10000) return 0;
    return paid - total;
  }

  function hasInvalidCashChange(order) {
    if (order.payment?.metodo !== "dinheiro" || !order.payment?.trocoPara) return false;
    return Number(order.payment.trocoPara) < Number(order.totals?.total || 0);
  }

  function renderValidation(order) {
    elements.warning.textContent = "";
    elements.warning.hidden = true;
    elements.confirmButton.disabled = false;

    if (hasInvalidCashChange(order)) {
      elements.warning.textContent = `O valor informado para troco (${formatCurrency(order.payment.trocoPara)}) é menor que o total (${formatCurrency(order.totals.total)}). Ajuste para confirmar.`;
      elements.warning.hidden = false;
      elements.confirmButton.disabled = true;
      return;
    }

    const change = cashChangeAmount(order);
    if (change > 0) {
      elements.warning.textContent = `Troco que você deve receber: ${formatCurrency(change)}.`;
      elements.warning.hidden = false;
    }
  }

  function open(order) {
    currentOrder = order;
    lastFocusedElement = document.activeElement;

    renderItems(order.items);
    elements.payment.textContent = formatPayment(order.payment);
    elements.subtotal.textContent = formatCurrency(order.totals.subtotal);
    elements.delivery.textContent = formatCurrency(order.totals.deliveryFee);
    elements.total.textContent = formatCurrency(order.totals.total);
    renderValidation(order);

    elements.backdrop.hidden = false;
    elements.confirmButton.focus();
  }

  function close() {
    elements.backdrop.hidden = true;
    currentOrder = null;

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  elements.cancelButton.addEventListener("click", () => {
    close();
    onCancel();
  });

  elements.confirmButton.addEventListener("click", () => {
    if (elements.confirmButton.disabled) return;
    const order = currentOrder;
    close();
    onConfirm(order);
  });

  elements.backdrop.addEventListener("click", (event) => {
    if (event.target === elements.backdrop) {
      close();
      onCancel();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.backdrop.hidden) {
      close();
      onCancel();
    }
  });

  return {
    open,
    close
  };
}
