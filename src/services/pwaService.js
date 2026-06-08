export function registerPwaServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // O Web App continua funcionando mesmo sem cache/offline.
    });
  });
}
