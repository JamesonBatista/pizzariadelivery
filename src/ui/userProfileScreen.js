const ADMIN_ACCESS_NAME = "admpizzaria2026dev";

export function createUserProfileScreen({ elements, storageService, onBack, onSave, onAdminAccess }) {
  let lastFocusedElement = null;
  let mode = "view";

  function fillForm(customer) {
    elements.name.value = customer?.nomeCompleto || "";
    elements.phone.value = customer?.telefone || "";
    elements.neighborhood.value = customer?.bairro || "";
    elements.address.value = customer?.endereco || "";
    elements.reference.value = customer?.pontoReferencia || "";
  }

  function validateCustomerForm() {
    const requiredFields = [elements.name, elements.phone, elements.neighborhood, elements.address];
    const invalidField = requiredFields.find((field) => !field.value.trim());

    if (invalidField) {
      invalidField.focus();
      return false;
    }

    return true;
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
    const typedName = String(formData.get("nomeCompleto") || "").trim();

    if (typedName.toLowerCase() === ADMIN_ACCESS_NAME) {
      close();
      onAdminAccess();
      return;
    }

    if (!validateCustomerForm()) {
      return;
    }

    const customer = storageService.saveCustomer({
      id: storageService.getCustomer()?.id,
      nomeCompleto: typedName,
      telefone: String(formData.get("telefone") || "").trim(),
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
