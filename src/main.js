import { appConfig } from "./config/appConfig.js";
import { createPizzariaRepository } from "./repositories/pizzariaRepository.js";
import { createDatabaseService } from "./services/databaseService.js";
import { createCustomerStorageService } from "./services/customerStorageService.js";
import { calculateCartTotals } from "./services/pricingService.js";
import { registerPwaServiceWorker } from "./services/pwaService.js";
import { createBottomNavigation } from "./ui/bottomNavigation.js";
import { createCartDrawer } from "./ui/cartDrawer.js";
import { createCartSummary } from "./ui/cartSummary.js";
import { createItemSheet } from "./ui/itemSheet.js";
import { createMenuView } from "./ui/menuView.js";
import { createOrderConfirmationPopup } from "./ui/orderConfirmationPopup.js";
import { createOrderDetailPopup } from "./ui/orderDetailPopup.js";
import { createOrderSuccessPopup } from "./ui/orderSuccessPopup.js";
import { createOrdersScreen } from "./ui/ordersScreen.js";
import { createPaymentSheet } from "./ui/paymentSheet.js";
import { createPromoBanner } from "./ui/promoBanner.js";
import { createSplashController } from "./ui/splashController.js";
import { createToast } from "./ui/toast.js";
import { createUserProfileScreen } from "./ui/userProfileScreen.js";

const elements = {
  splash: document.querySelector("#splash-screen"),
  splashMessage: document.querySelector("#splash-message"),
  appShell: document.querySelector("#app-shell"),
  bottomNav: document.querySelector("#bottom-nav"),
  bottomNavButtons: [...document.querySelectorAll(".bottom-nav__button")],
  cartButton: document.querySelector(".cart-pill"),
  cartCount: document.querySelector("#cart-count"),
  bottomCartCount: document.querySelector("#bottom-cart-count"),
  promoBanner: document.querySelector("#promo-banner"),
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
    sizeOptions: document.querySelector("#size-options"),
    halfAndHalfGroup: document.querySelector("#half-and-half-group"),
    halfAndHalf: document.querySelector("#half-and-half"),
    secondFlavorField: document.querySelector("#second-flavor-field"),
    secondFlavor: document.querySelector("#second-flavor"),
    doubleIngredientsGroup: document.querySelector("#double-ingredients-group"),
    doubleIngredients: document.querySelector("#double-ingredients"),
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
  },
  orderConfirmation: {
    backdrop: document.querySelector("#order-confirmation-backdrop"),
    items: document.querySelector("#order-confirmation-items"),
    payment: document.querySelector("#order-confirmation-payment"),
    subtotal: document.querySelector("#order-confirmation-subtotal"),
    delivery: document.querySelector("#order-confirmation-delivery"),
    total: document.querySelector("#order-confirmation-total"),
    cancelButton: document.querySelector("#order-confirmation-cancel"),
    confirmButton: document.querySelector("#order-confirmation-confirm")
  },
  userProfile: {
    backdrop: document.querySelector("#user-profile-backdrop"),
    backButton: document.querySelector("#user-profile-back"),
    form: document.querySelector("#user-profile-form"),
    name: document.querySelector("#customer-name"),
    neighborhood: document.querySelector("#customer-neighborhood"),
    address: document.querySelector("#customer-address"),
    reference: document.querySelector("#customer-reference")
  },
  ordersScreen: {
    backdrop: document.querySelector("#orders-screen-backdrop"),
    backButton: document.querySelector("#orders-back"),
    empty: document.querySelector("#orders-empty"),
    list: document.querySelector("#orders-list")
  },
  orderDetail: {
    backdrop: document.querySelector("#order-detail-backdrop"),
    title: document.querySelector("#order-detail-title"),
    content: document.querySelector("#order-detail-content"),
    closeButton: document.querySelector("#order-detail-close")
  },
  orderSuccess: {
    backdrop: document.querySelector("#order-success-backdrop"),
    message: document.querySelector("#order-success-message"),
    closeButton: document.querySelector("#order-success-close")
  }
};

const state = {
  banners: [],
  categorias: [],
  pedidos: [],
  produtos: [],
  categoriaAtiva: appConfig.defaultCategoryId,
  carrinhoItens: [],
  pendingPayment: null
};

const splash = createSplashController({
  splashElement: elements.splash,
  messageElement: elements.splashMessage
});
const toast = createToast(elements.toast);
const databaseService = createDatabaseService();
const repository = createPizzariaRepository(databaseService);
const customerStorage = createCustomerStorageService();
const cartSummary = createCartSummary({
  countElement: [elements.cartCount, elements.bottomCartCount],
  buttonElement: elements.cartButton
});
const promoBanner = createPromoBanner({
  element: elements.promoBanner,
  async onOrderBanner(banner) {
    const unitPrice = banner.produto.reduce((total, item) => total + Number(item.valor || 0), 0);
    const payload = {
      produtoId: `banner-${banner.id}`,
      produtoNome: banner.titulo,
      bannerId: banner.id,
      itensBanner: banner.produto.map((item) => ({
        nome: item.item,
        valor: Number(item.valor || 0)
      })),
      quantidade: 1,
      recheioExtra: false,
      valorRecheioExtra: 0,
      observacao: banner.descricao || "",
      precoBase: unitPrice,
      precoUnitario: unitPrice,
      total: unitPrice
    };

    try {
      const savedItem = await splash.run("Adicionando promocao ao carrinho...", () =>
        repository.criarItemPedido(payload)
      );
      state.carrinhoItens.push(savedItem);
      renderCart();
      toast.show("Promocao adicionada ao carrinho.");
    } catch (error) {
      toast.show(error.message || "Nao foi possivel adicionar a promocao.");
    }
  }
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

function getAllOrders() {
  const ordersById = new Map();
  [...customerStorage.getOrders(), ...state.pedidos]
    .filter((order) => order.tipo === "pedido")
    .forEach((order) => {
      ordersById.set(order.id, order);
    });
  return [...ordersById.values()];
}

function parseOrderNumber(orderNumber) {
  const value = String(orderNumber || "");
  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const alphaMatch = value.match(/^A(\d{3})$/);
  if (alphaMatch) {
    return 999 + Number(alphaMatch[1]);
  }

  return 0;
}

function formatOrderNumber(sequence) {
  if (sequence <= 999) {
    return String(sequence);
  }

  return `A${String(sequence - 999).padStart(3, "0")}`;
}

function getNextOrderNumber() {
  const highestSequence = getAllOrders().reduce(
    (highest, order) => Math.max(highest, parseOrderNumber(order.numeroPedido)),
    0
  );
  return formatOrderNumber(highestSequence + 1);
}

function openOrderConfirmation(payment) {
  const customer = customerStorage.getCustomer();

  if (!customer) {
    state.pendingPayment = payment;
    toast.show("Preencha seus dados para continuar o pedido.");
    userProfileScreen.open({ mode: "checkout" });
    return;
  }

  orderConfirmationPopup.open({
    items: state.carrinhoItens,
    totals: obterTotaisCarrinho(),
    payment,
    customer
  });
}

function createConfirmedOrder(order) {
  const customer = customerStorage.getCustomer();
  return customerStorage.saveOrder({
    numeroPedido: getNextOrderNumber(),
    clienteId: customer.id,
    cliente: customer,
    statusId: "recebido",
    statusNome: "Aguardando Pizzaria aceitar",
    criadoEm: new Date().toISOString(),
    itens: order.items,
    pagamento: order.payment,
    totais: order.totals
  });
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
  getProducts: () => state.produtos,
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
    openOrderConfirmation(payment);
  }
});

const orderConfirmationPopup = createOrderConfirmationPopup({
  elements: elements.orderConfirmation,
  onCancel() {
    toast.show("Pedido ainda nao confirmado. Revise antes de finalizar.");
  },
  onConfirm(order) {
    const savedOrder = createConfirmedOrder(order);
    state.carrinhoItens = [];
    renderCart();
    ordersScreen.render(getAllOrders());
    cartDrawer.close();
    paymentSheet.close();
    bottomNavigation.setActive("home");
    orderSuccessPopup.open(savedOrder);
  }
});

const userProfileScreen = createUserProfileScreen({
  elements: elements.userProfile,
  storageService: customerStorage,
  onBack() {
    bottomNavigation.setActive("home");
  },
  onSave(customer, { mode }) {
    toast.show("Dados do cliente salvos.");
    if (mode === "checkout" && state.pendingPayment) {
      const payment = state.pendingPayment;
      state.pendingPayment = null;
      openOrderConfirmation(payment);
    }
  }
});

const orderDetailPopup = createOrderDetailPopup({
  elements: elements.orderDetail
});

const ordersScreen = createOrdersScreen({
  elements: elements.ordersScreen,
  onBack() {
    bottomNavigation.setActive("home");
  },
  onOpenOrder(order) {
    orderDetailPopup.open(order);
  }
});

const orderSuccessPopup = createOrderSuccessPopup({
  elements: elements.orderSuccess,
  onClose() {
    bottomNavigation.setActive("orders");
    ordersScreen.open(getAllOrders());
  }
});

const cartDrawer = createCartDrawer({
  elements: elements.cartDrawer,
  onBack() {
    bottomNavigation.setActive("home");
  },
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

const bottomNavigation = createBottomNavigation({
  element: elements.bottomNav,
  buttons: elements.bottomNavButtons,
  onSelect(route) {
    if (route === "home") {
      cartDrawer.close();
      ordersScreen.close();
      userProfileScreen.close();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (route === "cart") {
      ordersScreen.close();
      userProfileScreen.close();
      renderCart();
      cartDrawer.open();
      return;
    }

    if (route === "orders") {
      cartDrawer.close();
      userProfileScreen.close();
      ordersScreen.open(getAllOrders());
      return;
    }

    if (route === "user") {
      cartDrawer.close();
      ordersScreen.close();
      userProfileScreen.open();
    }
  }
});

elements.cartButton.addEventListener("click", () => {
  bottomNavigation.setActive("cart");
  renderCart();
  cartDrawer.open();
});

function renderApp() {
  promoBanner.render(state.banners);
  menuView.renderCategories(state.categorias);
  menuView.setActiveCategory(state.categoriaAtiva);
  menuView.renderProducts(filtrarProdutos());
  renderCart();
  elements.appShell.hidden = false;
  bottomNavigation.show();
}

async function startApp() {
  splash.show("Carregando cardapio...");

  try {
    const [banners, categorias, produtos, pedidos] = await Promise.all([
      repository.listarBanners(),
      repository.listarCategorias(),
      repository.listarProdutos(),
      repository.listarPedidos()
    ]);

    state.banners = banners;
    state.categorias = categorias;
    state.produtos = produtos;
    state.pedidos = pedidos;
    renderApp();
  } catch (error) {
    elements.appShell.hidden = true;
    toast.show(error.message || "Nao foi possivel carregar os dados.");
  } finally {
    splash.hide();
  }
}

startApp();
