import { formatCurrency } from "../utils/formatters.js";

const MIN_QUANTITY = 1;

export function createItemSheet({ elements, getCategoryName, onSubmit }) {
  let selectedProduct = null;
  let quantity = MIN_QUANTITY;
  let lastFocusedElement = null;

  function syncQuantity() {
    elements.quantityValue.value = String(quantity);
    elements.quantityValue.textContent = String(quantity);
    elements.decreaseQuantity.disabled = quantity <= MIN_QUANTITY;
  }

  function resetForm() {
    quantity = MIN_QUANTITY;
    elements.form.reset();
    syncQuantity();
  }

  function open(product) {
    selectedProduct = product;
    lastFocusedElement = document.activeElement;
    resetForm();

    elements.productImage.src = product.imagem;
    elements.productImage.alt = product.nome;
    elements.category.textContent = getCategoryName(product.categoriaId);
    elements.title.textContent = product.nome;
    elements.description.textContent = product.descricao;
    elements.price.textContent = formatCurrency(product.preco);
    elements.backdrop.hidden = false;
    elements.closeButton.focus();
  }

  function close() {
    elements.backdrop.hidden = true;
    selectedProduct = null;

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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.backdrop.hidden) {
      close();
    }
  });

  elements.decreaseQuantity.addEventListener("click", () => {
    quantity = Math.max(MIN_QUANTITY, quantity - 1);
    syncQuantity();
  });

  elements.increaseQuantity.addEventListener("click", () => {
    quantity += 1;
    syncQuantity();
  });

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!selectedProduct) {
      return;
    }

    const payload = {
      produtoId: selectedProduct.id,
      produtoNome: selectedProduct.nome,
      quantidade: quantity,
      recheioExtra: elements.extraFilling.checked,
      observacao: elements.notes.value.trim(),
      precoUnitario: selectedProduct.preco,
      total: selectedProduct.preco * quantity
    };

    await onSubmit(payload);
    close();
  });

  syncQuantity();

  return {
    open,
    close
  };
}
