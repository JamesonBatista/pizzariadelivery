export function createCartSummary({ countElement, buttonElement }) {
  const countElements = Array.isArray(countElement) ? countElement : [countElement];

  function render(totalItems) {
    const label = totalItems === 1 ? "1 item no carrinho" : `${totalItems} itens no carrinho`;
    countElements.forEach((element) => {
      element.textContent = String(totalItems);
      element.hidden = totalItems === 0 && element.classList.contains("bottom-nav__badge");
    });
    buttonElement.setAttribute("aria-label", label);
  }

  render(0);

  return {
    render
  };
}
