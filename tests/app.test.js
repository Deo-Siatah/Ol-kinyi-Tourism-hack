// @vitest-environment jsdom
// Tests for the mounted screens and interactions.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountApp } from "../src/app.js";
import { createTrip } from "../src/trip.js";
import { storyFixture } from "./fixtures.js";

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
  };
}

function setup() {
  document.body.innerHTML = '<div id="root"></div>';
  const root = document.getElementById("root");
  const stories = storyFixture();
  const trip = createTrip(fakeStorage());
  const ask = vi.fn(async () => ({
    text: "Ask answer",
    storyId: "plant",
    source: "local",
  }));
  const narrator = {
    play: vi.fn(async () => "speech"),
    stop: vi.fn(),
  };
  const app = mountApp(root, { stories, trip, ask, narrator });
  return { root, stories, trip, ask, narrator, app };
}

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("mountApp screens", () => {
  it("renders the three screens and starts on Before", () => {
    const { root } = setup();

    expect(root.querySelector('[data-screen="before"]')).toBeTruthy();
    expect(root.querySelector('[data-screen="explore"]')).toBeTruthy();
    expect(root.querySelector('[data-screen="after"]')).toBeTruthy();
    expect(root.querySelector('[data-screen="explore"]').hidden).toBe(true);
    expect(root.querySelector('[data-tab="before"]').getAttribute("aria-selected")).toBe("true");
  });

  it("shows the welcome headline, greetings, etiquette and start button", () => {
    const { root } = setup();
    const before = root.querySelector('[data-screen="before"]');

    expect(before.textContent).toContain("maa");
    expect(before.textContent).toContain("english");
    expect(before.textContent).toContain("etiquette");
    expect(root.querySelector("[data-start]")).toBeTruthy();
  });

  it("switches screens and aria-selected when a tab is clicked", () => {
    const { root } = setup();

    root.querySelector('[data-tab="after"]').click();

    expect(root.querySelector('[data-screen="after"]').hidden).toBe(false);
    expect(root.querySelector('[data-screen="before"]').hidden).toBe(true);
    expect(root.querySelector('[data-tab="after"]').getAttribute("aria-selected")).toBe("true");
    expect(root.querySelector('[data-tab="before"]').getAttribute("aria-selected")).toBe("false");
  });

  it("opens Explore from the start button", () => {
    const { root } = setup();

    root.querySelector("[data-start]").click();

    expect(root.querySelector('[data-screen="explore"]').hidden).toBe(false);
  });

  it("renders three tap-to-view targets with image thumbnails", () => {
    const { root, stories } = setup();
    const buttons = root.querySelectorAll("[data-target]");

    expect(buttons).toHaveLength(3);
    expect(buttons[0].getAttribute("data-target")).toBe("0");
    expect(buttons[0].querySelector("img").getAttribute("src")).toBe(stories.targets[0].image);
  });
});

describe("story sheet", () => {
  it("opens with story content and records the trip when a target is found", () => {
    const { root, trip, app } = setup();

    const story = app.onTargetFound(0);

    const sheet = root.querySelector("[data-sheet]");
    expect(sheet.hidden).toBe(false);
    expect(sheet.textContent).toContain("Necklace");
    expect(sheet.textContent).toContain("A beaded necklace.");
    expect(sheet.textContent).toContain("Detail one");
    expect(sheet.textContent).toContain("Necklace folklore.");
    expect(sheet.textContent).toContain("Illustrative");
    expect(story.id).toBe("necklace");
    expect(trip.list()).toEqual(["necklace"]);
  });

  it("returns null and keeps the sheet closed for an unknown index", () => {
    const { root, app } = setup();

    expect(app.onTargetFound(9)).toBeNull();
    expect(root.querySelector("[data-sheet]").hidden).toBe(true);
  });

  it("hides the Illustrative badge for verified stories", () => {
    const { root, app } = setup();

    app.onTargetFound(1);

    expect(root.querySelector("[data-sheet]").textContent).not.toContain("Illustrative");
  });

  it("shows a visible but disabled Listen button", () => {
    const { root } = setup();
    const listen = root.querySelector("[data-listen]");

    expect(listen).toBeTruthy();
    expect(listen.disabled).toBe(true);
  });

  it("enables Listen and plays the open story", async () => {
    const { root, stories, narrator, app } = setup();
    app.onTargetFound(1);
    const listen = root.querySelector("[data-listen]");

    expect(listen.disabled).toBe(false);
    listen.click();
    await flush();

    expect(narrator.play).toHaveBeenCalledWith(stories.targets[1]);
  });

  it("stops narration when the sheet closes", () => {
    const { root, narrator, app } = setup();
    app.onTargetFound(0);
    narrator.stop.mockClear();

    root.querySelector("[data-sheet-close]").click();

    expect(narrator.stop).toHaveBeenCalled();
    expect(root.querySelector("[data-listen]").disabled).toBe(true);
  });

  it("stops narration when another target opens", () => {
    const { narrator, app } = setup();
    app.onTargetFound(0);
    narrator.stop.mockClear();

    app.onTargetFound(1);

    expect(narrator.stop).toHaveBeenCalled();
  });

  it("stops narration when the tab changes", () => {
    const { root, narrator, app } = setup();
    app.onTargetFound(0);
    narrator.stop.mockClear();

    root.querySelector('[data-tab="after"]').click();

    expect(narrator.stop).toHaveBeenCalled();
  });

  it("shows a status when nothing can be played", async () => {
    const { root, narrator, app } = setup();
    narrator.play.mockResolvedValueOnce("none");
    app.onTargetFound(0);

    root.querySelector("[data-listen]").click();
    await flush();

    const status = root.querySelector("[data-listen-status]");
    expect(status.hidden).toBe(false);
    expect(status.textContent).toContain("not available");
  });

  it("submits an ask and shows the answer", async () => {
    const { root, stories, app, ask } = setup();
    app.onTargetFound(2);

    const input = root.querySelector("[data-ask-input]");
    input.value = "What is this?";
    root
      .querySelector("[data-ask-form]")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(ask).toHaveBeenCalledWith("What is this?", stories);
    expect(root.querySelector("[data-answer]").textContent).toContain("Ask answer");
  });
});

describe("After screen", () => {
  it("shows progress and scanned story cards", () => {
    const { root, app } = setup();
    app.onTargetFound(0);

    root.querySelector('[data-tab="after"]').click();
    const after = root.querySelector('[data-screen="after"]');
    expect(after.textContent).toContain("1 of 3 discovered");
    expect(after.textContent).toContain("Necklace");
  });

  it("shows the empty state when nothing is scanned", () => {
    const { root } = setup();

    root.querySelector('[data-tab="after"]').click();

    expect(root.querySelector('[data-screen="after"]').textContent).toContain("No scans yet");
  });
});

describe("camera error", () => {
  it("shows a friendly message and keeps the targets available", () => {
    const { root, app } = setup();

    app.showCameraError("Camera unavailable. Tap a card to explore.");

    const error = root.querySelector("[data-camera-error]");
    expect(error.hidden).toBe(false);
    expect(error.textContent).toContain("Camera unavailable");
    expect(root.querySelectorAll("[data-target]")).toHaveLength(3);
  });
});
