// Tests for inline SVG icons.

import { describe, it, expect } from "vitest";
import { icon } from "../src/icons.js";

describe("icon", () => {
  it("returns an inline svg that inherits colour", () => {
    const svg = icon("leaf");

    expect(svg).toContain("<svg");
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).toContain('aria-hidden="true"');
  });

  it("throws naming an unknown icon", () => {
    expect(() => icon("missing")).toThrow(/missing/);
  });
});
