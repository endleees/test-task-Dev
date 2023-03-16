import Vue from 'vue';
import YmapPlugin from 'vue-yandex-maps';
import App from './App.vue';
import './registerServiceWorker';

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),

}).$mount('#app');

Vue.use(YmapPlugin, {
  // API-ключ yandex maps
  apiKey: 'b4636411-1572-423e-9f03-825ef98cd096',
  lang: 'ru_RU',
  coordorder: 'lat-long',
  version: '2.1',
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(() => {});
  });
}
const manifestJSON = {
  name: 'My app',
  short_name: 'My App',
  start_url: '/',
  display: 'standalone',
  theme_color: '#ffffff',
  background_color: '#ffffff',
};

const stringManifest = JSON.stringify(manifestJSON);
document.querySelector('head').insertAdjacentHTML(
  'beforeend',
  `<link rel="manifest" href="data:application/json,${stringManifest}">`,
);
const CACHE_NAME = 'my-pwa-cache';

const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
];

window.self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => window.self.skipWaiting()),
  );
});

window.self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.filter((cacheName) => cacheName.startsWith('my-app') && cacheName !== CACHE_NAME).map((cacheName) => caches.delete(cacheName)),
    )).then(() => window.self.clients.claim()),
  );
});

window.self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});
