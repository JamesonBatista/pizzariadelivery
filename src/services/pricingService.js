export function calculateItemTotal({ productPrice, quantity, hasExtraFilling, extraFillingPrice }) {
  const extraPrice = hasExtraFilling ? extraFillingPrice : 0;
  return (productPrice + extraPrice) * quantity;
}

export function calculateUnitPrice({ productPrice, hasExtraFilling, extraFillingPrice }) {
  return productPrice + (hasExtraFilling ? extraFillingPrice : 0);
}

export function getSizePrice(product, sizeId) {
  const selectedSize = product.tamanhos?.find((size) => size.id === sizeId);
  return selectedSize?.preco ?? product.preco;
}

export function calculatePizzaCustomizationPrice({
  product,
  secondFlavor,
  sizeId,
  selectedDoubleIngredients = [],
  hasExtraFilling,
  extraFillingPrice
}) {
  const primaryPrice = getSizePrice(product, sizeId);
  const secondPrice = secondFlavor ? getSizePrice(secondFlavor, sizeId) : 0;
  const basePrice = secondFlavor ? Math.max(primaryPrice, secondPrice) : primaryPrice;
  const doubleIngredientsPrice = selectedDoubleIngredients.reduce(
    (total, ingredient) => total + ingredient.preco,
    0
  );
  const extraPrice = hasExtraFilling ? extraFillingPrice : 0;

  return basePrice + doubleIngredientsPrice + extraPrice;
}

export function calculateCartTotals({ items, deliveryFee }) {
  const subtotal = items.reduce((total, item) => total + item.precoUnitario * item.quantidade, 0);
  const appliedDeliveryFee = items.length > 0 ? deliveryFee : 0;
  return {
    subtotal,
    deliveryFee: appliedDeliveryFee,
    total: subtotal + appliedDeliveryFee
  };
}
