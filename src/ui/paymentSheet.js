export function createPaymentSheet({ elements, onSubmit }) {
  let lastFocusedElement = null;

  function getSelectedMethod() {
    return elements.form.querySelector("input[name='payment-method']:checked")?.value || "";
  }

  function syncCashField() {
    const isCash = getSelectedMethod() === "dinheiro";
    elements.cashChangeField.hidden = !isCash;
    elements.cashChange.required = isCash;

    if (!isCash) {
      elements.cashChange.value = "";
    }
  }

  function open() {
    lastFocusedElement = document.activeElement;
    elements.form.reset();
    syncCashField();
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
  elements.backdrop.addEventListener("click", (event) => {
    if (event.target === elements.backdrop) {
      close();
    }
  });

  elements.form.addEventListener("change", syncCashField);

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const method = getSelectedMethod();
    if (!method) {
      elements.form.reportValidity();
      return;
    }

    const payload = {
      metodo: method,
      trocoPara: method === "dinheiro" ? Number(elements.cashChange.value || 0) : null
    };

    close();
    await onSubmit(payload);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.backdrop.hidden) {
      close();
    }
  });

  return {
    open,
    close
  };
}
