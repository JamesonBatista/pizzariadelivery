import { appConfig } from "./config/appConfig.js";
import { createPizzariaRepository } from "./repositories/pizzariaRepository.js";
import { createDatabaseService } from "./services/databaseService.js";
import { calculateCartTotals } from "./services/pricingService.js";
import { registerPwaServiceWorker } from "./services/pwaService.js";
import { createCartDrawer } from "./ui/cartDrawer.js";
import { createCartSummary } from "./ui/cartSummary.js";
import { createItemSheet } from "./ui/itemSheet.js";
import { createMenuView } from "./ui/menuView.js";
import { createPaymentSheet } from "./ui/paymentSheet.js";
import { createSplashController } from "./ui/splashController.js";
import { createToast } from "./ui/toast.js";

const elements = {
  splash: document.querySelector("#splash-screen"),
  splashMessage: document.querySelector("#splash-message"),
  appShell: document.querySelector("#app-shell"),
  cartButton: document.querySelector(".cart-pill"),
  cartCount: document.querySelector("#cart-count"),
  categoryList: document.querySelector("#category-list"),
  productList: document.querySelector("#product-list"),
  toast: document.querySelector("#toast"),
  itemSheet: {
    backdrop: document.querySelector("#item-sheet-backdrop"),
    closeButton: document.querySelector("#sheet-close"),
    productImage: document.querySelector("#sheet-product-image"),
    category: document.querySelector("#sheet-product-category"),
    title: document.querySelector("#sheet-title"),
    description: document.querySelector("#sheet-product-description"),
    price: document.querySelector("#sheet-product-price"),
    form: document.querySelector("#item-form"),
    decreaseQuantity: document.querySelector("#decrease-quantity"),
    increaseQuantity: document.querySelector("#increase-quantity"),
    quantityValue: document.querySelector("#quantity-value"),
    extraFilling: document.querySelector("#extra-filling"),
    extraFillingPrice: document.querySelector("#extra-filling-price"),
    itemTotal: document.querySelector("#sheet-item-total"),
    notes: document.querySelector("#item-notes")
  },
  cartDrawer: {
    backdrop: document.querySelector("#cart-drawer-backdrop"),
    backButton: document.querySelector("#cart-back"),
    empty: document.querySelector("#cart-empty"),
    items: document.querySelector("#cart-items"),
    subtotal: document.querySelector("#cart-subtotal"),
    deliveryFee: document.querySelector("#cart-delivery-fee"),
    grandTotal: document.querySelector("#cart-grand-total"),
    checkoutButton: document.querySelector("#checkout-button")
  },
  paymentSheet: {
    backdrop: document.querySelector("#payment-sheet-backdrop"),
    closeButton: document.querySelector("#payment-close"),
    form: document.querySelector("#payment-form"),
    cashChangeField: document.querySelector("#cash-change-field"),
    cashChange: document.querySelector("#cash-change")
  }
};

const state = {
  categorias: [],
  produtos: [],
  categoriaAtiva: appConfig.defaultCategoryId,
  carrinhoItens: []
};

const splash = createSplashController({
  splashElement: elements.splash,
  messageElement: elements.splashMessage
});
const toast = createToast(elements.toast);
const databaseService = createDatabaseService();
const repository = createPizzariaRepository(databaseService);
const cartSummary = createCartSummary({
  countElement: elements.cartCount,
  buttonElement: elements.cartButton
});

registerPwaServiceWorker();

function contarItensCarrinho() {
  return state.carrinhoItens.reduce((total, item) => total + item.quantidade, 0);
}

function obterTotaisCarrinho() {
  return calculateCartTotals({
    items: state.carrinhoItens,
    deliveryFee: appConfig.pricing.deliveryFee
  });
}

function renderCart() {
  cartSummary.render(contarItensCarrinho());
  cartDrawer.render(state.carrinhoItens, obterTotaisCarrinho());
}

function filtrarProdutos() {
  if (state.categoriaAtiva === appConfig.defaultCategoryId) {
    return state.produtos;
  }

  return state.produtos.filter((produto) => produto.categoriaId === state.categoriaAtiva);
}

const menuView = createMenuView({
  categoryListElement: elements.categoryList,
  productListElement: elements.productList,
  onCategoryChange(categoryId) {
    state.categoriaAtiva = categoryId;
    menuView.setActiveCategory(categoryId);
    menuView.renderProducts(filtrarProdutos());
  },
  onAddProduct(product) {
    itemSheet.open(product);
  }
});

const itemSheet = createItemSheet({
  elements: elements.itemSheet,
  getCategoryName: menuView.getCategoryName,
  pricing: appConfig.pricing,
  async onSubmit(itemPedido) {
    try {
      const savedItem = await splash.run("Adicionando item ao pedido...", () =>
        repository.criarItemPedido(itemPedido)
      );
      state.carrinhoItens.push(savedItem);
      renderCart();
      toast.show("Item adicionado ao pedido.");
    } catch (error) {
      toast.show(error.message || "Nao foi possivel adicionar o item.");
      throw error;
    }
  }
});

const paymentSheet = createPaymentSheet({
  elements: elements.paymentSheet,
  async onSubmit(payment) {
    toast.show(
      payment.metodo === "dinheiro"
        ? `Pagamento em dinheiro selecionado. Troco para ${payment.trocoPara}.`
        : "Forma de pagamento selecionada."
    );
  }
});

const cartDrawer = createCartDrawer({
  elements: elements.cartDrawer,
  onBack() {},
  onCheckout() {
    if (state.carrinhoItens.length === 0) {
      toast.show("Adicione um item antes de efetuar o pedido.");
      return;
    }

    paymentSheet.open();
  },
  onIncreaseItem(itemId) {
    state.carrinhoItens = state.carrinhoItens.map((item) =>
      item.id === itemId
        ? {
            ...item,
            quantidade: item.quantidade + 1,
            total: item.precoUnitario * (item.quantidade + 1)
          }
        : item
    );
    renderCart();
  },
  onDecreaseItem(itemId, { shouldDelete }) {
    if (shouldDelete) {
      return;
    }

    state.carrinhoItens = state.carrinhoItens.map((item) =>
      item.id === itemId && item.quantidade > 1
        ? {
            ...item,
            quantidade: item.quantidade - 1,
            total: item.precoUnitario * (item.quantidade - 1)
          }
        : item
    );
    renderCart();
  },
  async onDeleteItem(itemId) {
    try {
      await splash.run("Removendo item do pedido...", () => repository.removerItemPedido(itemId));
      state.carrinhoItens = state.carrinhoItens.filter((item) => item.id !== itemId);
      renderCart();
      toast.show("Item removido do carrinho.");
    } catch (error) {
      toast.show(error.message || "Nao foi possivel remover o item.");
    }
  }
});

elements.cartButton.addEventListener("click", () => {
  renderCart();
  cartDrawer.open();
});

function renderApp() {
  menuView.renderCategories(state.categorias);
  menuView.setActiveCategory(state.categoriaAtiva);
  menuView.renderProducts(filtrarProdutos());
  renderCart();
  elements.appShell.hidden = false;
}

async function startApp() {
  splash.show("Carregando cardapio...");

  try {
    const [categorias, produtos] = await Promise.all([
      repository.listarCategorias(),
      repository.listarProdutos()
    ]);

    state.categorias = categorias;
    state.produtos = produtos;
    renderApp();
  } catch (error) {
    elements.appShell.hidden = true;
    toast.show(error.message || "Nao foi possivel carregar os dados.");
  } finally {
    splash.hide();
  }
}

startApp();
