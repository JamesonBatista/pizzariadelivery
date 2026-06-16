export function createOrderSuccessPopup({ elements, onClose }) {
  let lastFocusedElement = null;

  function cashChangeAmount(order) {
    if (order.pagamento?.metodo !== "dinheiro") return 0;
    const total = Number(order.totais?.total || 0);
    const paid = Number(order.pagamento?.trocoPara || 0);
    if (!Number.isFinite(paid) || !Number.isFinite(total) || paid <= total || paid > 10000) return 0;
    return paid - total;
  }

  function open(order) {
    lastFocusedElement = document.activeElement;
    const change = cashChangeAmount(order);
    elements.message.textContent = change > 0
      ? `Seu pedido foi enviado e está aguardando a pizzaria aceitar. Troco previsto: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(change)}.`
      : "Seu pedido foi enviado e está aguardando a pizzaria aceitar.";
    elements.backdrop.hidden = false;
    elements.closeButton.focus();
  }

  function close() {
    elements.backdrop.hidden = true;

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  elements.closeButton.addEventListener("click", () => {
    close();
    onClose();
  });

  return {
    open,
    close
  };
}
