export function createBottomNavigation({ element, buttons, onSelect }) {
  function show() {
    element.hidden = false;
  }

  function setActive(route) {
    buttons.forEach((button) => {
      const isActive = button.dataset.route === route;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const route = button.dataset.route;
      setActive(route);
      onSelect(route);
    });
  });

  return {
    show,
    setActive
  };
}
