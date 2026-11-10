// Tests for story validation, loading and index lookup.

import { describe, it, expect } from "vitest";
import {
  validateStories,
  loadStories,
  getStoryByIndex,
} from "../src/stories.js";

function validData() {
  return {
    targets: [
      {
        index: 0,
        id: "necklace",
        title: "title",
        summary: "summary",
        details: ["detail"],
        folklore: "folklore",
        verified: false,
        image: "img/necklace.jpg",
      },
      {
        index: 1,
        id: "plant",
        title: "title",
        summary: "summary",
        details: ["detail"],
        folklore: "folklore",
        verified: false,
        image: "img/plant.jpg",
      },
      {
        index: 2,
        id: "animal",
        title: "title",
        summary: "summary",
        details: ["detail"],
        folklore: "folklore",
        verified: false,
        image: "img/animal.jpg",
      },
      {
        index: 3,
        id: "shuka",
        title: "title",
        summary: "summary",
        details: ["detail"],
        folklore: "folklore",
        verified: true,
        image: "img/shuka.jpg",
      },
      {
        index: 4,
        id: "manyatta",
        title: "title",
        summary: "summary",
        details: ["detail"],
        folklore: "folklore",
        verified: true,
        image: "img/manyatta.jpg",
      },
    ],
    before: {
      greetings: [{ maa: "maa", english: "english" }],
      etiquette: ["etiquette"],
    },
  };
}

describe("validateStories", () => {
  it("returns the data unchanged when valid", () => {
    const data = validData();
    expect(validateStories(data)).toBe(data);
  });

  it("throws naming targets[1].summary when summary is missing", () => {
    const data = validData();
    delete data.targets[1].summary;
    expect(() => validateStories(data)).toThrow(/targets\[1\]\.summary/);
  });

  it("throws naming targets[0].index when index does not match position", () => {
    const data = validData();
    data.targets[0].index = 5;
    expect(() => validateStories(data)).toThrow(/targets\[0\]\.index/);
  });

  it("throws naming targets[2].details when details is not an array of strings", () => {
    const data = validData();
    data.targets[2].details = "not an array";
    expect(() => validateStories(data)).toThrow(/targets\[2\]\.details/);
  });

  it("throws naming targets[0].verified when verified is not a boolean", () => {
    const data = validData();
    data.targets[0].verified = "yes";
    expect(() => validateStories(data)).toThrow(/targets\[0\]\.verified/);
  });

  it("throws naming targets[1].id when id is not an allowed value", () => {
    const data = validData();
    data.targets[1].id = "invalid";
    expect(() => validateStories(data)).toThrow(/targets\[1\]\.id/);
  });

  it("accepts an optional audio path", () => {
    const data = validData();
    data.targets[0].audio = "audio/necklace.mp3";
    expect(validateStories(data)).toBe(data);
  });

  it("accepts targets without an audio path", () => {
    const data = validData();
    expect(validateStories(data)).toBe(data);
  });

  it("accepts structured highlights", () => {
    const data = validData();
    data.targets[0].highlights = {
      colors: [{ name: "Red", meaning: "meaning" }],
      stages: [{ name: "Brides", detail: "detail" }],
    };
    expect(validateStories(data)).toBe(data);
  });

  it("throws naming targets[0].highlights.colors[1].meaning when meaning is missing", () => {
    const data = validData();
    data.targets[0].highlights = {
      colors: [{ name: "Red", meaning: "meaning" }, { name: "Blue" }],
    };
    expect(() => validateStories(data)).toThrow(
      /targets\[0\]\.highlights\.colors\[1\]\.meaning/,
    );
  });

  it("throws naming targets[2].highlights.timeline when timeline is not an array", () => {
    const data = validData();
    data.targets[2].highlights = { timeline: "not an array" };
    expect(() => validateStories(data)).toThrow(/targets\[2\]\.highlights\.timeline/);
  });

  it("throws naming before.greetings when greetings is missing", () => {
    const data = validData();
    delete data.before.greetings;
    expect(() => validateStories(data)).toThrow(/before\.greetings/);
  });

  it("throws naming before.etiquette when etiquette is not an array of strings", () => {
    const data = validData();
    data.before.etiquette = [1, 2];
    expect(() => validateStories(data)).toThrow(/before\.etiquette/);
  });
});

describe("loadStories", () => {
  it("returns the data unchanged when valid", () => {
    const data = validData();
    expect(loadStories(data)).toBe(data);
  });

  it("throws when the data is invalid", () => {
    const data = validData();
    delete data.targets[0].title;
    expect(() => loadStories(data)).toThrow(/targets\[0\]\.title/);
  });
});

describe("getStoryByIndex", () => {
  it("returns the matching target", () => {
    const data = validData();
    expect(getStoryByIndex(data, 1)).toBe(data.targets[1]);
  });

  it("returns undefined when no target has that index", () => {
    const data = validData();
    expect(getStoryByIndex(data, 9)).toBeUndefined();
  });
});
