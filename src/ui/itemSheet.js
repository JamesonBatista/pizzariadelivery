import { formatCurrency } from "../utils/formatters.js";
import { calculatePizzaCustomizationPrice } from "../services/pricingService.js";

const MIN_QUANTITY = 1;

export function createItemSheet({ elements, getCategoryName, getProducts, pricing, onSubmit }) {
  let selectedProduct = null;
  let selectedSizeId = "";
  let quantity = MIN_QUANTITY;
  let lastFocusedElement = null;

  function getPizzaOptions() {
    return getProducts().filter((product) => product.tamanhos?.length && product.disponivel !== false);
  }

  function getSelectedSize() {
    return selectedProduct?.tamanhos?.find((size) => size.id === selectedSizeId) || null;
  }

  function getSecondFlavor() {
    if (!elements.halfAndHalf.checked) {
      return null;
    }

    const selectedSecondFlavor = elements.secondFlavor.querySelector("input[name='second-flavor']:checked");
    return getPizzaOptions().find((product) => product.id === selectedSecondFlavor?.value) || null;
  }

  function getSelectedDoubleIngredients() {
    return [...elements.doubleIngredients.querySelectorAll("input[type='checkbox']:checked")].map(
      (input) => selectedProduct.ingredientesEmDobro.find((ingredient) => ingredient.id === input.value)
    ).filter(Boolean);
  }

  function calculateCurrentUnitPrice() {
    if (!selectedProduct) {
      return 0;
    }

    return calculatePizzaCustomizationPrice({
      product: selectedProduct,
      secondFlavor: getSecondFlavor(),
      sizeId: selectedSizeId,
      selectedDoubleIngredients: getSelectedDoubleIngredients(),
      hasExtraFilling: elements.extraFilling.checked,
      extraFillingPrice: pricing.extraFillingPrice
    });
  }

  function calculateCurrentTotal() {
    if (!selectedProduct) {
      return 0;
    }

    return calculateCurrentUnitPrice() * quantity;
  }

  function renderPrice() {
    if (!selectedProduct) {
      elements.itemTotal.textContent = formatCurrency(0);
      return;
    }

    const size = getSelectedSize();
    elements.price.textContent = size
      ? `${size.nome} (${size.fatias} fatias) - ${formatCurrency(calculateCurrentUnitPrice())} un.`
      : `${formatCurrency(calculateCurrentUnitPrice())} un.`;
    elements.extraFillingPrice.textContent = `+ ${formatCurrency(pricing.extraFillingPrice)} por unidade`;
    elements.itemTotal.textContent = formatCurrency(calculateCurrentTotal());
  }

  function renderSizeOptions() {
    elements.sizeOptions.replaceChildren();
    const sizes =
      selectedProduct.tamanhos?.length > 0
        ? selectedProduct.tamanhos
        : [{ id: "unico", nome: "Unico", fatias: 1, preco: selectedProduct.preco }];

    sizes.forEach((size) => {
      const label = document.createElement("label");
      label.className = "size-option";
      label.innerHTML = `
        <input type="radio" name="pizza-size" value="${size.id}" ${size.id === selectedSizeId ? "checked" : ""} />
        <span>
          <strong>${size.nome}</strong>
          <small>${size.fatias ? `${size.fatias} fatias` : "Unidade"} • ${formatCurrency(size.preco)}</small>
        </span>
      `;
      elements.sizeOptions.append(label);
    });
  }

  function renderSecondFlavorOptions() {
    const options = getPizzaOptions().filter((product) => product.id !== selectedProduct.id);
    elements.secondFlavor.replaceChildren();

    options.forEach((product, index) => {
      const label = document.createElement("label");
      label.className = "second-flavor-option";
      label.innerHTML = `
        <input type="radio" name="second-flavor" value="${product.id}" ${index === 0 ? "checked" : ""} />
        <span>
          <strong>${product.nome}</strong>
          <small>${getCategoryName(product.categoriaId)}</small>
        </span>
      `;
      elements.secondFlavor.append(label);
    });

    elements.halfAndHalfGroup.hidden = !selectedProduct.permiteMeioAMeio || options.length === 0;
    elements.secondFlavorField.hidden = !elements.halfAndHalf.checked;
  }

  function renderDoubleIngredients() {
    elements.doubleIngredients.replaceChildren();
    const ingredients = selectedProduct.ingredientesEmDobro || [];
    elements.doubleIngredientsGroup.hidden = ingredients.length === 0;

    ingredients.forEach((ingredient) => {
      const label = document.createElement("label");
      label.className = "ingredient-option";
      label.innerHTML = `
        <input type="checkbox" value="${ingredient.id}" />
        <span>${ingredient.nome}</span>
        <strong>+ ${formatCurrency(ingredient.preco)}</strong>
      `;
      elements.doubleIngredients.append(label);
    });
  }

  function renderCustomizationOptions() {
    renderSizeOptions();
    renderSecondFlavorOptions();
    renderDoubleIngredients();
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
  }

  function open(product) {
    selectedProduct = product;
    selectedSizeId = product.tamanhos?.[0]?.id || "unico";
    lastFocusedElement = document.activeElement;
    resetForm();
    renderCustomizationOptions();
    syncQuantity();

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

  elements.sizeOptions.addEventListener("change", (event) => {
    if (event.target.name === "pizza-size") {
      selectedSizeId = event.target.value;
      renderPrice();
    }
  });

  elements.halfAndHalf.addEventListener("change", () => {
    elements.secondFlavorField.hidden = !elements.halfAndHalf.checked;
    renderPrice();
  });

  elements.secondFlavor.addEventListener("change", renderPrice);
  elements.doubleIngredients.addEventListener("change", renderPrice);
  elements.extraFilling.addEventListener("change", renderPrice);

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!selectedProduct) {
      return;
    }

    const hasExtraFilling = elements.extraFilling.checked;
    const unitPrice = calculateCurrentUnitPrice();
    const selectedSize = getSelectedSize();
    const secondFlavor = getSecondFlavor();
    const doubleIngredients = getSelectedDoubleIngredients();
    const productName = secondFlavor
      ? `${selectedProduct.nome} / ${secondFlavor.nome}`
      : selectedProduct.nome;

    const payload = {
      produtoId: selectedProduct.id,
      produtoNome: productName,
      tamanho: selectedSize
        ? {
            id: selectedSize.id,
            nome: selectedSize.nome,
            fatias: selectedSize.fatias
          }
        : null,
      meioAMeio: Boolean(secondFlavor),
      segundoSabor: secondFlavor
        ? {
            id: secondFlavor.id,
            nome: secondFlavor.nome
          }
        : null,
      ingredientesEmDobro: doubleIngredients.map((ingredient) => ({
        id: ingredient.id,
        nome: ingredient.nome,
        preco: ingredient.preco
      })),
      quantidade: quantity,
      recheioExtra: hasExtraFilling,
      valorRecheioExtra: hasExtraFilling ? pricing.extraFillingPrice : 0,
      observacao: elements.notes.value.trim(),
      precoBase: unitPrice,
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
