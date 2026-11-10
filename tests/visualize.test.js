// Tests for Visualize content validation and section lookup.

import { describe, it, expect } from "vitest";
import { validateVisualize, getSection } from "../src/visualize.js";
import { visualizeFixture } from "./fixtures.js";

describe("validateVisualize", () => {
  it("returns the data unchanged when valid", () => {
    const data = visualizeFixture();
    expect(validateVisualize(data)).toBe(data);
  });

  it("throws naming sections[1].text when text is missing", () => {
    const data = visualizeFixture();
    delete data.sections[1].text;
    expect(() => validateVisualize(data)).toThrow(/sections\[1\]\.text/);
  });

  it("throws naming sections when there are fewer than four sections", () => {
    const data = visualizeFixture();
    data.sections = data.sections.slice(0, 3);
    expect(() => validateVisualize(data)).toThrow(/sections/);
  });

  it("throws naming sections[0].verified when verified is not a boolean", () => {
    const data = visualizeFixture();
    data.sections[0].verified = "yes";
    expect(() => validateVisualize(data)).toThrow(/sections\[0\]\.verified/);
  });
});

describe("getSection", () => {
  it("returns the matching section", () => {
    const data = visualizeFixture();
    expect(getSection(data, "walls")).toBe(data.sections[1]);
  });

  it("returns null for an unknown id", () => {
    const data = visualizeFixture();
    expect(getSection(data, "missing")).toBeNull();
  });
});
