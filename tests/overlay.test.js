// Tests for rendering story overlays and trip records.

import { describe, it, expect } from "vitest";
import { renderOverlay, renderTripRecord } from "../src/overlay.js";
import { storyFixture } from "./fixtures.js";

describe("renderOverlay", () => {
  it("includes title, summary, details and folklore", () => {
    const [story] = storyFixture().targets;

    const html = renderOverlay(story);

    expect(html).toContain("Necklace");
    expect(html).toContain("A beaded necklace.");
    expect(html).toContain("Detail one");
    expect(html).toContain("Detail two");
    expect(html).toContain("Necklace folklore.");
  });

  it("adds the Illustrative label when verified is false", () => {
    const [story] = storyFixture().targets;

    expect(renderOverlay(story)).toContain("Illustrative");
  });

  it("omits the Illustrative label when verified is true", () => {
    const story = storyFixture().targets[1];

    expect(renderOverlay(story)).not.toContain("Illustrative");
  });

  it("escapes HTML in story text", () => {
    const [story] = storyFixture().targets;
    story.title = "<b>bold</b>";

    const html = renderOverlay(story);

    expect(html).toContain("&lt;b&gt;bold&lt;/b&gt;");
    expect(html).not.toContain("<b>bold</b>");
  });
});

describe("renderTripRecord", () => {
  it("returns 'No scans yet' when there are no ids", () => {
    expect(renderTripRecord([], storyFixture())).toContain("No scans yet");
  });

  it("lists titles in order", () => {
    const stories = storyFixture();

    const html = renderTripRecord(["animal", "necklace"], stories);

    expect(html.indexOf("Animal")).toBeLessThan(html.indexOf("Necklace"));
  });

  it("escapes HTML in titles", () => {
    const stories = storyFixture();
    stories.targets[0].title = "<i>x</i>";

    const html = renderTripRecord(["necklace"], stories);

    expect(html).toContain("&lt;i&gt;x&lt;/i&gt;");
    expect(html).not.toContain("<i>x</i>");
  });
});
