// @vitest-environment jsdom
// Tests for the mounted screens and interactions.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountApp } from "../src/app.js";
import { createTrip } from "../src/trip.js";
import {
  storyFixture,
  visualizeFixture,
  visualizeSvgFixture,
} from "./fixtures.js";

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
  };
}

function setup({ storedIds = [], withVisualize = false } = {}) {
  document.body.innerHTML = '<div id="root"></div>';
  const root = document.getElementById("root");
  const stories = storyFixture();
  const storage = fakeStorage();
  if (storedIds.length > 0) {
    storage.setItem("olkinyi.trip.ids", JSON.stringify(storedIds));
  }
  const trip = createTrip(storage);
  const ask = vi.fn(async () => ({
    text: "Ask answer",
    storyId: "plant",
    source: "local",
  }));
  const narrator = {
    play: vi.fn(async () => "speech"),
    stop: vi.fn(),
  };
  const visualize = withVisualize ? visualizeFixture() : undefined;
  const visualizeSvg = withVisualize ? visualizeSvgFixture() : undefined;
  const app = mountApp(root, {
    stories,
    trip,
    ask,
    narrator,
    visualize,
    visualizeSvg,
  });
  return { root, stories, trip, ask, narrator, visualize, app };
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

  it("renders five tap-to-view targets with image thumbnails", () => {
    const { root, stories } = setup();
    const buttons = root.querySelectorAll("[data-target]");

    expect(buttons).toHaveLength(5);
    expect(buttons[0].getAttribute("data-target")).toBe("0");
    expect(buttons[0].querySelector("img").getAttribute("src")).toBe(stories.targets[0].image);
    expect(buttons[4].getAttribute("data-target")).toBe("4");
  });
});

describe("landing", () => {
  it("renders the hero image, promise and scan CTA", () => {
    const { root } = setup();
    const before = root.querySelector('[data-screen="before"]');

    expect(before.querySelector("[data-hero-image]").getAttribute("src")).toBe(
      "/img/landing/hero-mara.jpg",
    );
    expect(before.textContent).toContain("Discover the story of the Maasai");
    expect(before.textContent).toContain("Scan to enter the Mara");
    expect(before.querySelector("[data-start]")).toBeTruthy();
  });

  it("shows the cultural value messages and photo credits", () => {
    const { root } = setup();
    const before = root.querySelector('[data-screen="before"]');

    expect(before.textContent).toContain("A unique culture");
    expect(before.textContent).toContain("Adumu jump");
    expect(before.textContent).toContain("CC BY-SA 4.0");
    expect(before.querySelector(".credits a").getAttribute("href")).toContain(
      "commons.wikimedia.org",
    );
  });

  it("links to the before-you-go guidance", () => {
    const { root } = setup();
    const link = root.querySelector("[data-before-link]");

    expect(link.getAttribute("href")).toBe("#before-you-go");
    expect(root.querySelector("#before-you-go").textContent).toContain("Greetings");
  });

  it("previews the three discoverable targets", () => {
    const { root } = setup();
    const previews = root.querySelectorAll("[data-preview-target]");

    expect(previews).toHaveLength(5);
    expect(previews[0].textContent).toContain("Necklace");
    expect(previews[0].querySelector("img").getAttribute("src")).toBe(
      "/img/landing/beadwork.jpg",
    );
    expect(previews[2].querySelector("img").getAttribute("src")).toBe(
      "/img/landing/lion.jpg",
    );
    expect(previews[3].textContent).toContain("Shuka");
  });

  it("shows a continue CTA for a returning traveller", () => {
    const { root } = setup({ storedIds: ["necklace", "plant"] });
    const start = root.querySelector("[data-start]");

    expect(start.textContent).toContain("Continue your journey");
    expect(start.textContent).toContain("2 of 5");
  });

  it("labels the three steps Discover, Scan and Reflect", () => {
    const { root } = setup();
    const tabs = root.querySelectorAll("[data-tab]");

    expect(tabs).toHaveLength(3);
    expect(tabs[0].textContent).toContain("Discover");
    expect(tabs[1].textContent).toContain("Scan");
    expect(tabs[2].textContent).toContain("Reflect");
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

  it("renders structured highlights in the reveal", () => {
    const { root, app } = setup();

    app.onTargetFound(0);

    const highlights = root.querySelector("[data-sheet-highlights]");
    expect(highlights).toBeTruthy();
    expect(highlights.textContent).toContain("Bead colours");
    expect(highlights.textContent).toContain("meaning one");
    expect(highlights.textContent).toContain("stage detail");
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
    expect(after.textContent).toContain("1 of 5 discovered");
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
    expect(root.querySelectorAll("[data-target]")).toHaveLength(5);
  });
});

describe("scan guide", () => {
  it("shows pointing instructions over the camera", () => {
    const { root } = setup();
    const guide = root.querySelector('[data-screen="explore"] [data-scan-guide]');

    expect(guide).toBeTruthy();
    expect(guide.textContent).toContain("Point at");
    expect(guide.textContent).toContain("card");
  });
});

describe("Scan tab", () => {
  it("carries a dedicated, labelled icon badge", () => {
    const { root } = setup();
    const tab = root.querySelector('[data-tab="explore"]');

    expect(tab.classList.contains("tab--scan")).toBe(true);
    expect(tab.querySelector(".tab__scan-badge .tab__icon")).toBeTruthy();
    expect(tab.querySelector(".tab__label").textContent).toBe("Scan");
  });
});

describe("story reveal", () => {
  it("opens full screen with the story image", () => {
    const { root, stories, app } = setup();

    app.onTargetFound(1);

    const sheet = root.querySelector("[data-sheet]");
    expect(sheet.classList.contains("sheet--reveal")).toBe(true);
    expect(sheet.querySelector("[data-sheet-image]").getAttribute("src")).toBe(
      stories.targets[1].image,
    );
  });

  it("closes back to the scan guide", () => {
    const { root, app } = setup();
    app.onTargetFound(0);

    root.querySelector("[data-sheet-close]").click();

    expect(root.querySelector("[data-sheet]").hidden).toBe(true);
    expect(root.querySelector('[data-screen="explore"] [data-scan-guide]')).toBeTruthy();
  });
});

describe("Visualize", () => {
  it("adds no tab or screen when the content is absent", () => {
    const { root, app } = setup();

    expect(root.querySelector('[data-tab="visualize"]')).toBeNull();
    expect(root.querySelector('[data-screen="visualize"]')).toBeNull();
    expect(app.onTargetFound(4).id).toBe("manyatta");
    expect(root.querySelector("[data-sheet]").hidden).toBe(false);
    expect(root.querySelector('[data-screen="before"]').hidden).toBe(false);
  });

  it("adds a Visualize tab and screen when the content is present", () => {
    const { root } = setup({ withVisualize: true });

    expect(root.querySelector('[data-tab="visualize"]').textContent).toContain("Visualize");
    expect(root.querySelector('[data-screen="visualize"]').hidden).toBe(true);
  });

  it("switches to the Visualize screen from its tab", () => {
    const { root } = setup({ withVisualize: true });

    root.querySelector('[data-tab="visualize"]').click();

    expect(root.querySelector('[data-screen="visualize"]').hidden).toBe(false);
    expect(root.querySelector('[data-tab="visualize"]').getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("selects the first section on open", () => {
    const { root } = setup({ withVisualize: true });

    const panel = root.querySelector("[data-section-panel]");
    expect(panel.textContent).toContain("PLACEHOLDER-roof");
    expect(
      root.querySelector('[data-section-chip="roof"]').classList.contains("is-active"),
    ).toBe(true);
    expect(
      root.querySelector('[data-cutaway] [data-section="roof"]').classList.contains("is-active"),
    ).toBe(true);
  });

  it("selects a section from a chip with a single active part", () => {
    const { root } = setup({ withVisualize: true });

    root.querySelector('[data-section-chip="walls"]').click();

    expect(root.querySelector("[data-section-panel]").textContent).toContain("PLACEHOLDER-walls");
    expect(root.querySelectorAll(".is-active")).toHaveLength(2);
    expect(
      root.querySelector('[data-section-chip="walls"]').classList.contains("is-active"),
    ).toBe(true);
    expect(
      root.querySelector('[data-cutaway] [data-section="walls"]').classList.contains("is-active"),
    ).toBe(true);
  });

  it("selects a section by tapping the drawing", () => {
    const { root } = setup({ withVisualize: true });

    root.querySelector('[data-cutaway] [data-section="entrance"]').dispatchEvent(
      new Event("click", { bubbles: true }),
    );

    expect(root.querySelector("[data-section-panel]").textContent).toContain(
      "PLACEHOLDER-entrance",
    );
  });

  it("expands and collapses the cutaway", () => {
    const { root } = setup({ withVisualize: true });
    const expand = root.querySelector("[data-expand]");
    const cutaway = root.querySelector("[data-cutaway]");

    expect(expand.getAttribute("aria-pressed")).toBe("false");
    expand.click();
    expect(expand.getAttribute("aria-pressed")).toBe("true");
    expect(cutaway.classList.contains("is-expanded")).toBe(true);
    expand.click();
    expect(expand.getAttribute("aria-pressed")).toBe("false");
    expect(cutaway.classList.contains("is-expanded")).toBe(false);
  });

  it("shows Illustrative for unverified sections and hides it for verified ones", () => {
    const { root, visualize } = setup({ withVisualize: true });
    const badge = root.querySelector("[data-visualize-badge]");

    expect(badge.hidden).toBe(false);
    expect(badge.textContent).toContain("Illustrative");

    visualize.sections[1].verified = true;
    root.querySelector('[data-section-chip="walls"]').click();

    expect(badge.hidden).toBe(true);
  });

  it("opens the shuka story when target 3 is found", () => {
    const { root, app } = setup({ withVisualize: true });

    const story = app.onTargetFound(3);

    expect(story.id).toBe("shuka");
    expect(root.querySelector("[data-sheet]").textContent).toContain("Shuka");
  });

  it("opens the Visualize screen when target 4 is found", () => {
    const { root, app } = setup({ withVisualize: true });

    app.onTargetFound(4);

    expect(root.querySelector('[data-screen="visualize"]').hidden).toBe(false);
  });
});
