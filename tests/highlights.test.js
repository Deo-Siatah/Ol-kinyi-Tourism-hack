// Tests for rendering structured story highlights.

import { describe, it, expect } from "vitest";
import { renderHighlights } from "../src/highlights.js";

describe("renderHighlights", () => {
  it("renders bead colours and life stages", () => {
    const html = renderHighlights({
      highlights: {
        colors: [{ name: "Red", meaning: "meaning one" }],
        stages: [{ name: "Brides", detail: "stage detail" }],
      },
    });

    expect(html).toContain("Bead colours");
    expect(html).toContain("Red");
    expect(html).toContain("meaning one");
    expect(html).toContain("Life stages");
    expect(html).toContain("Brides");
    expect(html).toContain("stage detail");
  });

  it("renders tree roles", () => {
    const html = renderHighlights({
      highlights: { roles: [{ name: "Food", detail: "role detail" }] },
    });

    expect(html).toContain("Roles");
    expect(html).toContain("Food");
    expect(html).toContain("role detail");
  });

  it("renders the lion timeline", () => {
    const html = renderHighlights({
      highlights: { timeline: [{ name: "Olamayio", detail: "timeline detail" }] },
    });

    expect(html).toContain("From hunt to guardianship");
    expect(html).toContain("Olamayio");
    expect(html).toContain("timeline detail");
  });

  it("returns an empty string when there are no highlights", () => {
    expect(renderHighlights({ highlights: undefined })).toBe("");
  });

  it("escapes story text", () => {
    const html = renderHighlights({
      highlights: {
        colors: [{ name: "<b>Red</b>", meaning: "<script>bad</script>" }],
      },
    });

    expect(html).not.toContain("<b>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;b&gt;Red&lt;/b&gt;");
  });
});
