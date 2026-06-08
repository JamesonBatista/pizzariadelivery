export function createToast(element) {
  let timerId = null;

  function show(message) {
    window.clearTimeout(timerId);
    element.textContent = message;
    element.hidden = false;

    timerId = window.setTimeout(() => {
      element.hidden = true;
    }, 2800);
  }

  return {
    show
  };
}
