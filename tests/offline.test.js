// Tests for offline precaching and cache-first fetching.

import { describe, it, expect, vi } from "vitest";
import { buildPrecacheList, cacheFirst } from "../src/offline.js";
import { storyFixture } from "./fixtures.js";

const CORE_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/targets.mind",
  "/content/stories.json",
  "/src/main.js",
  "/src/narrate.js",
  "/src/speech.js",
];

function fakeCache(initialKey, initialResponse) {
  const store = new Map();
  if (initialKey) {
    store.set(initialKey, initialResponse);
  }
  return {
    match: vi.fn(async (request) => store.get(String(request))),
    put: vi.fn(async (request, response) => {
      store.set(String(request), response);
    }),
  };
}

function fakeResponse(body) {
  return { body, clone: () => ({ body, cloned: true }) };
}

describe("buildPrecacheList", () => {
  it("includes every core file", () => {
    const list = buildPrecacheList(storyFixture());

    for (const file of CORE_FILES) {
      expect(list).toContain(file);
    }
  });

  it("includes every target image as an absolute path", () => {
    const list = buildPrecacheList(storyFixture());

    expect(list).toContain("/img/necklace.jpg");
    expect(list).toContain("/img/plant.jpg");
    expect(list).toContain("/img/animal.jpg");
  });

  it("includes every target audio path as an absolute path when present", () => {
    const data = storyFixture();
    data.targets[0].audio = "audio/necklace.mp3";
    data.targets[1].audio = "/audio/plant.mp3";

    const list = buildPrecacheList(data);

    expect(list).toContain("/audio/necklace.mp3");
    expect(list).toContain("/audio/plant.mp3");
  });

  it("omits audio paths that are not present", () => {
    const list = buildPrecacheList(storyFixture());

    expect(list.some((path) => path.startsWith("/audio/"))).toBe(false);
  });

  it("returns unique paths", () => {
    const data = storyFixture();
    data.targets[1].image = "img/necklace.jpg";
    data.targets[1].audio = "audio/plant.mp3";
    data.targets[2].audio = "/audio/plant.mp3";

    const list = buildPrecacheList(data);

    expect(list.filter((path) => path === "/img/necklace.jpg")).toHaveLength(1);
    expect(list.filter((path) => path === "/audio/plant.mp3")).toHaveLength(1);
  });
});

describe("cacheFirst", () => {
  it("returns the cached response without fetching when present", async () => {
    const cached = fakeResponse("cached");
    const cache = fakeCache("/app.js", cached);
    const fetchFn = vi.fn();

    const result = await cacheFirst("/app.js", cache, fetchFn);

    expect(result).toBe(cached);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("fetches, stores a clone, and returns the response when not cached", async () => {
    const cache = fakeCache();
    const response = fakeResponse("network");
    const fetchFn = vi.fn(async () => response);

    const result = await cacheFirst("/app.js", cache, fetchFn);

    expect(result).toBe(response);
    expect(fetchFn).toHaveBeenCalledWith("/app.js");
    expect(cache.put).toHaveBeenCalledTimes(1);
    expect(cache.put.mock.calls[0][0]).toBe("/app.js");
    expect(cache.put.mock.calls[0][1].cloned).toBe(true);
  });

  it("throws an error naming the URL when offline with nothing cached", async () => {
    const cache = fakeCache();
    const fetchFn = vi.fn(async () => {
      throw new Error("offline");
    });

    await expect(
      cacheFirst("https://example.com/missing.js", cache, fetchFn),
    ).rejects.toThrow(/https:\/\/example\.com\/missing\.js/);
  });
});
