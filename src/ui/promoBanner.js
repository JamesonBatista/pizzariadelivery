import { formatCurrency } from "../utils/formatters.js";

function createOfferCard(item) {
  const card = document.createElement("article");
  card.className = "promo-banner__offer";

  const name = document.createElement("strong");
  name.textContent = item.item;

  const price = document.createElement("span");
  price.textContent = formatCurrency(item.valor);

  card.append(name, price);
  return card;
}

export function createPromoBanner({ element }) {
  function render(banners) {
    element.replaceChildren();

    const [banner] = banners;
    if (!banner) {
      element.hidden = true;
      return;
    }

    element.hidden = false;
    const content = document.createElement("div");
    content.className = "promo-banner__content";

    const label = document.createElement("p");
    label.className = "promo-banner__label";
    label.textContent = "Oferta da pizzaria";

    const title = document.createElement("h2");
    title.textContent = banner.titulo;

    const description = document.createElement("p");
    description.className = "promo-banner__description";
    description.textContent = banner.descricao || "Confira a promocao preparada para hoje.";

    const track = document.createElement("div");
    track.className =
      banner.produto.length > 1 ? "promo-banner__track is-marquee" : "promo-banner__track is-single";

    const offers = banner.produto.length > 1 ? [...banner.produto, ...banner.produto] : banner.produto;
    offers.forEach((item) => {
      track.append(createOfferCard(item));
    });

    content.append(label, title, description, track);
    element.append(content);
  }

  return {
    render
  };
}
