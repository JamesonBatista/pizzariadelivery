export function createSplashController({ splashElement, messageElement }) {
  function show(message = "Carregando dados...") {
    messageElement.textContent = message;
    splashElement.hidden = false;
    splashElement.setAttribute("aria-busy", "true");
  }

  function hide() {
    splashElement.hidden = true;
    splashElement.setAttribute("aria-busy", "false");
  }

  async function run(message, operation) {
    show(message);
    try {
      return await operation();
    } finally {
      hide();
    }
  }

  return {
    show,
    hide,
    run
  };
}
