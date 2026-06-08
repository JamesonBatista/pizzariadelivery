export function createUserProfileScreen({ elements, storageService, onBack, onSave }) {
  let lastFocusedElement = null;
  let mode = "view";

  function fillForm(customer) {
    elements.name.value = customer?.nomeCompleto || "";
    elements.neighborhood.value = customer?.bairro || "";
    elements.address.value = customer?.endereco || "";
    elements.reference.value = customer?.pontoReferencia || "";
  }

  function open(options = {}) {
    mode = options.mode || "view";
    lastFocusedElement = document.activeElement;
    fillForm(storageService.getCustomer());
    elements.backdrop.hidden = false;
    elements.name.focus();
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

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(elements.form);
    const customer = storageService.saveCustomer({
      nomeCompleto: String(formData.get("nomeCompleto") || "").trim(),
      bairro: String(formData.get("bairro") || "").trim(),
      endereco: String(formData.get("endereco") || "").trim(),
      pontoReferencia: String(formData.get("pontoReferencia") || "").trim()
    });

    close();
    onSave(customer, { mode });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.backdrop.hidden) {
      close();
      onBack();
    }
  });

  return {
    open,
    close
  };
}
