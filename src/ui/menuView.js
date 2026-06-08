import { appConfig } from "../config/appConfig.js";
import { formatCurrency } from "../utils/formatters.js";

function createCategoryMap(categories) {
  return new Map(categories.map((category) => [category.id, category.nome]));
}

export function createMenuView({ categoryListElement, productListElement, onCategoryChange, onAddProduct }) {
  let categoryMap = new Map();
  let activeCategoryId = appConfig.defaultCategoryId;

  function renderCategories(categories) {
    const allCategories = [
      {
        id: appConfig.defaultCategoryId,
        nome: appConfig.defaultCategoryLabel
      },
      ...categories
    ];

    categoryMap = createCategoryMap(allCategories);
    categoryListElement.replaceChildren();

    const fragment = document.createDocumentFragment();
    allCategories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "category-button";
      button.textContent = category.nome;
      button.dataset.categoryId = category.id;
      button.setAttribute("aria-pressed", String(category.id === activeCategoryId));

      if (category.id === activeCategoryId) {
        button.classList.add("is-active");
      }

      button.addEventListener("click", () => {
        activeCategoryId = category.id;
        onCategoryChange(category.id);
      });

      fragment.append(button);
    });

    categoryListElement.append(fragment);
  }

  function renderProducts(products) {
    productListElement.replaceChildren();

    if (products.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent = "Nenhum produto encontrado para esta categoria.";
      productListElement.append(emptyState);
      return;
    }

    const fragment = document.createDocumentFragment();
    products.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";

      const image = document.createElement("img");
      image.className = "product-card__image";
      image.src = product.imagem;
      image.alt = product.nome;
      image.loading = "lazy";

      const body = document.createElement("div");
      body.className = "product-card__body";

      const category = document.createElement("p");
      category.className = "product-card__category";
      category.textContent = categoryMap.get(product.categoriaId) || "Produto";

      const title = document.createElement("h3");
      title.className = "product-card__title";
      title.textContent = product.nome;

      const description = document.createElement("p");
      description.className = "product-card__description";
      description.textContent = product.descricao;

      const footer = document.createElement("div");
      footer.className = "product-card__footer";

      const price = document.createElement("strong");
      price.className = "product-card__price";
      price.textContent = formatCurrency(product.preco);

      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "product-card__add";
      addButton.textContent = "Adicionar";
      addButton.addEventListener("click", () => onAddProduct(product));

      footer.append(price, addButton);
      body.append(category, title, description, footer);
      card.append(image, body);
      fragment.append(card);
    });

    productListElement.append(fragment);
  }

  function setActiveCategory(categoryId) {
    activeCategoryId = categoryId;
    categoryListElement.querySelectorAll(".category-button").forEach((button) => {
      const isActive = button.dataset.categoryId === categoryId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function getCategoryName(categoryId) {
    return categoryMap.get(categoryId) || "Produto";
  }

  return {
    renderCategories,
    renderProducts,
    setActiveCategory,
    getCategoryName
  };
}
