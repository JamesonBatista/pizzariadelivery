export function calculateItemTotal({ productPrice, quantity, hasExtraFilling, extraFillingPrice }) {
  const extraPrice = hasExtraFilling ? extraFillingPrice : 0;
  return (productPrice + extraPrice) * quantity;
}

export function calculateUnitPrice({ productPrice, hasExtraFilling, extraFillingPrice }) {
  return productPrice + (hasExtraFilling ? extraFillingPrice : 0);
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
