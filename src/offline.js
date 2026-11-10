// Builds the offline precache list and serves requests cache-first.

const CORE_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/targets.mind",
  "/content/stories.json",
  "/content/visualize.json",
  "/content/visualize.svg",
  "/src/main.js",
  "/src/narrate.js",
  "/src/speech.js",
];

function toAbsolutePath(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function buildPrecacheList(data) {
  const images = data.targets.map((target) => toAbsolutePath(target.image));
  const audio = data.targets
    .filter((target) => target.audio)
    .map((target) => toAbsolutePath(target.audio));
  return [...new Set([...CORE_FILES, ...images, ...audio])];
}

export async function cacheFirst(request, cache, fetchFn) {
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  const url = typeof request === "string" ? request : request.url;
  try {
    const response = await fetchFn(request);
    await cache.put(request, response.clone());
    return response;
  } catch {
    throw new Error(`Could not fetch ${url} and it is not cached`);
  }
}
