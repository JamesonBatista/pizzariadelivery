export function createCartSummary({ countElement, buttonElement }) {
  function render(totalItems) {
    const label = totalItems === 1 ? "1 item no carrinho" : `${totalItems} itens no carrinho`;
    countElement.textContent = String(totalItems);
    buttonElement.setAttribute("aria-label", label);
  }

  render(0);

  return {
    render
  };
}
