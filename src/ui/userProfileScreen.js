export function createUserProfileScreen({ elements, onBack }) {
  let lastFocusedElement = null;

  function open() {
    lastFocusedElement = document.activeElement;
    elements.backdrop.hidden = false;
    elements.backButton.focus();
  }

  function close() {
    elements.backdrop.hidden = true;

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  elements.backButton.addEventListener("click", () => {
    close();
    onBack();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.backdrop.hidden) {
      close();
      onBack();
    }
  });

  return {
    open,
    close
  };
}
