const CACHE_NAME = "pizzaria-web-app-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./dados.json",
  "./src/styles.css",
  "./src/main.js",
  "./src/config/appConfig.js",
  "./src/config/firestoreConfig.js",
  "./src/config/whatsappConfig.js",
  "./src/database/fakeFirestoreClient.js",
  "./src/database/firestoreConnection.js",
  "./src/repositories/pizzariaRepository.js",
  "./src/services/databaseService.js",
  "./src/services/orderNotificationService.js",
  "./src/services/pricingService.js",
  "./src/services/pwaService.js",
  "./src/services/whatsappService.js",
  "./src/ui/bottomNavigation.js",
  "./src/ui/cartDrawer.js",
  "./src/ui/cartSummary.js",
  "./src/ui/itemSheet.js",
  "./src/ui/menuView.js",
  "./src/ui/paymentSheet.js",
  "./src/ui/splashController.js",
  "./src/ui/toast.js",
  "./src/ui/userProfileScreen.js",
  "./src/utils/formatters.js",
  "./assets/icons/pizza-icon.svg",
  "./assets/images/pizza-salgada.svg",
  "./assets/images/pizza-doce.svg",
  "./assets/images/sobremesa.svg",
  "./assets/images/bebida.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  if (url.pathname.endsWith("/dados.json")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
