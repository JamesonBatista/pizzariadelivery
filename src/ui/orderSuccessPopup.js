export function createOrderSuccessPopup({ elements, onClose }) {
  let lastFocusedElement = null;

  function open(order) {
    lastFocusedElement = document.activeElement;
    elements.message.textContent = `Pedido ${order.numeroPedido || order.id} enviado e aguardando a pizzaria aceitar.`;
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
