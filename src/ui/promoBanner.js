import { formatCurrency } from "../utils/formatters.js";

function formatOfferValue(value) {
  return value > 0 ? formatCurrency(value) : "Gratis";
}

function createBannerCard(banner) {
  const card = document.createElement("article");
  card.className = "promo-banner__card";

  const label = document.createElement("p");
  label.className = "promo-banner__label";
  label.textContent = "Oferta da pizzaria";

  const title = document.createElement("h2");
  title.textContent = banner.titulo;

  const description = document.createElement("p");
  description.className = "promo-banner__description";
  description.textContent = banner.descricao || "Confira a promocao preparada para hoje.";

  const offers = document.createElement("div");
  offers.className = "promo-banner__offers";

  banner.produto.forEach((item) => {
    const offer = document.createElement("div");
    offer.className = "promo-banner__offer";

    const name = document.createElement("strong");
    name.textContent = item.item;

    const price = document.createElement("span");
    price.textContent = formatOfferValue(item.valor);

    offer.append(name, price);
    offers.append(offer);
  });

  card.append(label, title, description, offers);
  return card;
}

export function createPromoBanner({ element }) {
  function render(banners) {
    element.replaceChildren();

    const activeBanners = banners.filter((banner) => banner.ativo !== false);
    if (activeBanners.length === 0) {
      element.hidden = true;
      return;
    }

    element.hidden = false;

    const track = document.createElement("div");
    track.className = activeBanners.length > 1 ? "promo-banner__track is-marquee" : "promo-banner__track is-single";

    const bannersToRender = activeBanners.length > 1 ? [...activeBanners, ...activeBanners] : activeBanners;
    bannersToRender.forEach((banner) => {
      track.append(createBannerCard(banner));
    });

    element.append(track);
  }

  return {
    render
  };
}
