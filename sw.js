// Service worker: precaches core assets on install and serves fetches cache-first.

import { buildPrecacheList, cacheFirst } from "./src/offline.js";

const CACHE_NAME = "olkinyi-v3";

const VENDOR_FILES = [
  "/vendor/mindar-image-three.prod.js",
  "/vendor/controller-mGt1s8dJ.js",
  "/vendor/ui-fBadYuor.js",
  "/vendor/three.module.min.js",
  "/vendor/addons/renderers/CSS3DRenderer.js",
];

const APP_FILES = [
  "/src/app.js",
  "/src/ask.js",
  "/src/offline.js",
  "/src/overlay.js",
  "/src/scan.js",
  "/src/speech.js",
  "/src/stories.js",
  "/src/trip.js",
];

async function precacheUrls() {
  try {
    const response = await fetch("/content/stories.json");
    const data = await response.json();
    return [...new Set([...buildPrecacheList(data), ...VENDOR_FILES, ...APP_FILES])];
  } catch {
    return [
      "/",
      "/index.html",
      "/manifest.json",
      "/content/stories.json",
      "/src/main.js",
      ...VENDOR_FILES,
      ...APP_FILES,
    ];
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const urls = await precacheUrls();
      await Promise.all(
        urls.map(async (url) => {
          try {
            await cache.add(url);
          } catch {
            return;
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const isStaticGet =
    request.method === "GET" &&
    url.origin === self.location.origin &&
    !url.pathname.startsWith("/api/");

  if (!isStaticGet) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      return cacheFirst(request, cache, (req) => fetch(req));
    })(),
  );
});
