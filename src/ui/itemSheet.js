import { formatCurrency } from "../utils/formatters.js";
import { calculateItemTotal, calculateUnitPrice } from "../services/pricingService.js";

const MIN_QUANTITY = 1;

export function createItemSheet({ elements, getCategoryName, pricing, onSubmit }) {
  let selectedProduct = null;
  let quantity = MIN_QUANTITY;
  let lastFocusedElement = null;

  function calculateCurrentTotal() {
    if (!selectedProduct) {
      return 0;
    }

    return calculateItemTotal({
      productPrice: selectedProduct.preco,
      quantity,
      hasExtraFilling: elements.extraFilling.checked,
      extraFillingPrice: pricing.extraFillingPrice
    });
  }

  function renderPrice() {
    if (!selectedProduct) {
      elements.itemTotal.textContent = formatCurrency(0);
      return;
    }

    elements.price.textContent = `${formatCurrency(selectedProduct.preco)} un.`;
    elements.extraFillingPrice.textContent = `+ ${formatCurrency(pricing.extraFillingPrice)} por unidade`;
    elements.itemTotal.textContent = formatCurrency(calculateCurrentTotal());
  }

  function syncQuantity() {
    elements.quantityValue.value = String(quantity);
    elements.quantityValue.textContent = String(quantity);
    elements.decreaseQuantity.disabled = quantity <= MIN_QUANTITY;
    renderPrice();
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
    renderPrice();
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

  elements.extraFilling.addEventListener("change", renderPrice);

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!selectedProduct) {
      return;
    }

    const hasExtraFilling = elements.extraFilling.checked;
    const unitPrice = calculateUnitPrice({
      productPrice: selectedProduct.preco,
      hasExtraFilling,
      extraFillingPrice: pricing.extraFillingPrice
    });

    const payload = {
      produtoId: selectedProduct.id,
      produtoNome: selectedProduct.nome,
      quantidade: quantity,
      recheioExtra: hasExtraFilling,
      valorRecheioExtra: hasExtraFilling ? pricing.extraFillingPrice : 0,
      observacao: elements.notes.value.trim(),
      precoBase: selectedProduct.preco,
      precoUnitario: unitPrice,
      total: calculateCurrentTotal()
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
