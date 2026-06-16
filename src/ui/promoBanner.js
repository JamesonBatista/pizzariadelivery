import { formatCurrency } from "../utils/formatters.js";

function formatOfferValue(value) {
  return value > 0 ? formatCurrency(value) : "Incluso";
}

function calculateBannerTotal(banner) {
  return banner.produto.reduce((total, item) => total + Number(item.valor || 0), 0);
}

function createBannerCard(banner, onOrderBanner) {
  const card = document.createElement("article");
  card.className = "promo-banner__slide";

  const label = document.createElement("p");
  label.className = "promo-banner__label";
  label.textContent = "Oferta da pizzaria";

  const title = document.createElement("h2");
  title.textContent = banner.titulo;

  const description = document.createElement("p");
  description.className = "promo-banner__description";
  description.textContent = banner.descricao || "Confira a promocao preparada para hoje.";

  const art = document.createElement("div");
  art.className = "promo-banner__art";
  art.setAttribute("aria-hidden", "true");
  art.innerHTML = `
    <span class="promo-banner__pizza">
      <i></i><i></i><i></i><i></i>
    </span>
    <span class="promo-banner__spark promo-banner__spark--one"></span>
    <span class="promo-banner__spark promo-banner__spark--two"></span>
  `;

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

  const footer = document.createElement("div");
  footer.className = "promo-banner__footer";

  const total = document.createElement("strong");
  total.className = "promo-banner__total";
  total.textContent = formatCurrency(calculateBannerTotal(banner));

  const button = document.createElement("button");
  button.className = "promo-banner__button";
  button.type = "button";
  button.textContent = "Pedir";
  button.addEventListener("click", () => onOrderBanner(banner));

  footer.append(total, button);
  card.append(label, title, description, art, offers, footer);
  return card;
}

export function createPromoBanner({ element, onOrderBanner, intervalMs = 2000 }) {
  let intervalId = null;
  let activeIndex = 0;

  function stopCarousel() {
    window.clearInterval(intervalId);
    intervalId = null;
  }

  function updateCarousel(track, dots, nextIndex) {
    activeIndex = nextIndex;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function render(banners) {
    stopCarousel();
    element.replaceChildren();

    const activeBanners = banners.filter((banner) => banner.ativo !== false);
    if (activeBanners.length === 0) {
      element.hidden = true;
      return;
    }

    element.hidden = false;
    activeIndex = 0;

    const viewport = document.createElement("div");
    viewport.className = "promo-banner__viewport";

    const track = document.createElement("div");
    track.className = "promo-banner__track";

    activeBanners.forEach((banner) => {
      track.append(createBannerCard(banner, onOrderBanner));
    });

    viewport.append(track);
    element.append(viewport);

    const dots = activeBanners.map((banner, index) => {
      const dot = document.createElement("button");
      dot.className = "promo-banner__dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Ver ${banner.titulo}`);
      dot.addEventListener("click", () => {
        stopCarousel();
        updateCarousel(track, dots, index);
      });
      return dot;
    });

    if (dots.length > 1) {
      const controls = document.createElement("div");
      controls.className = "promo-banner__dots";
      dots.forEach((dot) => controls.append(dot));
      element.append(controls);

      intervalId = window.setInterval(() => {
        updateCarousel(track, dots, (activeIndex + 1) % activeBanners.length);
      }, intervalMs);
    }

    updateCarousel(track, dots, 0);
  }

  return {
    render
  };
}
