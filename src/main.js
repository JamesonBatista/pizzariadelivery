import { appConfig } from "./config/appConfig.js";
import { createPizzariaRepository } from "./repositories/pizzariaRepository.js";
import { createDatabaseService } from "./services/databaseService.js";
import { createItemSheet } from "./ui/itemSheet.js";
import { createMenuView } from "./ui/menuView.js";
import { createSplashController } from "./ui/splashController.js";
import { createToast } from "./ui/toast.js";

const elements = {
  splash: document.querySelector("#splash-screen"),
  splashMessage: document.querySelector("#splash-message"),
  appShell: document.querySelector("#app-shell"),
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
    notes: document.querySelector("#item-notes")
  }
};

const state = {
  categorias: [],
  produtos: [],
  categoriaAtiva: appConfig.defaultCategoryId
};

const splash = createSplashController({
  splashElement: elements.splash,
  messageElement: elements.splashMessage
});
const toast = createToast(elements.toast);
const databaseService = createDatabaseService();
const repository = createPizzariaRepository(databaseService);

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
  async onSubmit(itemPedido) {
    try {
      await splash.run("Adicionando item ao pedido...", () => repository.criarItemPedido(itemPedido));
      toast.show("Item adicionado ao pedido.");
    } catch (error) {
      toast.show(error.message || "Nao foi possivel adicionar o item.");
    }
  }
});

function renderApp() {
  menuView.renderCategories(state.categorias);
  menuView.setActiveCategory(state.categoriaAtiva);
  menuView.renderProducts(filtrarProdutos());
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
