import { formatCurrency } from "../utils/formatters.js";

export function createCartDrawer({
  elements,
  onBack,
  onCheckout,
  onIncreaseItem,
  onDecreaseItem,
  onDeleteItem
}) {
  let currentItems = [];
  let pendingDeleteItemId = null;
  let lastFocusedElement = null;

  function open() {
    lastFocusedElement = document.activeElement;
    elements.backdrop.hidden = false;
    elements.backButton.focus();
  }

  function close() {
    elements.backdrop.hidden = true;
    pendingDeleteItemId = null;

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function createItemElement(item) {
    const itemElement = document.createElement("article");
    itemElement.className = "cart-item";
    itemElement.dataset.itemId = item.id;

    const title = document.createElement("h3");
    title.textContent = item.produtoNome;

    const meta = document.createElement("p");
    meta.className = "cart-item__meta";
    const metaParts = [];
    if (item.tamanho) {
      metaParts.push(`${item.tamanho.nome}${item.tamanho.fatias ? ` (${item.tamanho.fatias} fatias)` : ""}`);
    }
    if (item.meioAMeio) {
      metaParts.push("Meio a meio");
    }
    if (item.recheioExtra) {
      metaParts.push(`Recheio extra (${formatCurrency(item.valorRecheioExtra)} por unidade)`);
    }
    if (item.ingredientesEmDobro?.length) {
      metaParts.push(`Em dobro: ${item.ingredientesEmDobro.map((ingredient) => ingredient.nome).join(", ")}`);
    }
    meta.textContent = metaParts.length ? metaParts.join(" • ") : "Sem adicionais";

    const note = document.createElement("p");
    note.className = "cart-item__note";
    note.textContent = item.observacao ? `Obs.: ${item.observacao}` : "Sem observacao.";

    const price = document.createElement("strong");
    price.className = "cart-item__price";
    price.textContent = formatCurrency(item.precoUnitario * item.quantidade);

    const quantity = document.createElement("div");
    quantity.className = "quantity-control quantity-control--small";
    quantity.innerHTML = `
      <button type="button" data-action="decrease" aria-label="Diminuir ${item.produtoNome}">-</button>
      <output>${item.quantidade}</output>
      <button type="button" data-action="increase" aria-label="Aumentar ${item.produtoNome}">+</button>
    `;

    itemElement.append(title, meta, note, price, quantity);

    if (pendingDeleteItemId === item.id) {
      const confirm = document.createElement("div");
      confirm.className = "cart-item__delete-confirm";
      confirm.innerHTML = `
        <span>Excluir este item?</span>
        <button type="button" data-action="confirm-delete">Excluir</button>
        <button type="button" data-action="cancel-delete">Manter</button>
      `;
      itemElement.append(confirm);
    }

    return itemElement;
  }

  function render(items, totals) {
    currentItems = items;
    elements.items.replaceChildren();
    elements.empty.hidden = items.length > 0;
    elements.checkoutButton.disabled = items.length === 0;

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      fragment.append(createItemElement(item));
    });
    elements.items.append(fragment);

    elements.subtotal.textContent = formatCurrency(totals.subtotal);
    elements.deliveryFee.textContent = formatCurrency(totals.deliveryFee);
    elements.grandTotal.textContent = formatCurrency(totals.total);
  }

  elements.backButton.addEventListener("click", () => {
    close();
    onBack();
  });

  elements.checkoutButton.addEventListener("click", onCheckout);

  elements.items.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const itemElement = button.closest(".cart-item");
    const itemId = itemElement?.dataset.itemId;
    const item = currentItems.find((currentItem) => currentItem.id === itemId);

    if (!item) {
      return;
    }

    if (button.dataset.action === "increase") {
      pendingDeleteItemId = null;
      onIncreaseItem(itemId);
      return;
    }

    if (button.dataset.action === "decrease") {
      if (item.quantidade <= 1) {
        pendingDeleteItemId = itemId;
        onDecreaseItem(itemId, { shouldDelete: false });
        return;
      }

      pendingDeleteItemId = null;
      onDecreaseItem(itemId, { shouldDelete: false });
      return;
    }

    if (button.dataset.action === "cancel-delete") {
      pendingDeleteItemId = null;
      onDecreaseItem(itemId, { shouldDelete: false });
      return;
    }

    if (button.dataset.action === "confirm-delete") {
      await onDeleteItem(itemId);
      pendingDeleteItemId = null;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.backdrop.hidden) {
      close();
      onBack();
    }
  });

  return {
    open,
    close,
    render
  };
}
