// Tests for mapping scan indexes to stories.

import { describe, it, expect, vi } from "vitest";
import { createScanner } from "../src/scan.js";
import { storyFixture } from "./fixtures.js";

describe("createScanner", () => {
  it("returns the story and calls onStory for a known index", () => {
    const stories = storyFixture();
    const onStory = vi.fn();
    const scanner = createScanner(stories, onStory);

    const result = scanner.onTargetFound(1);

    expect(result).toBe(stories.targets[1]);
    expect(onStory).toHaveBeenCalledWith(stories.targets[1]);
  });

  it("returns null and does not call onStory for an unknown index", () => {
    const stories = storyFixture();
    const onStory = vi.fn();
    const scanner = createScanner(stories, onStory);

    expect(scanner.onTargetFound(9)).toBeNull();
    expect(onStory).not.toHaveBeenCalled();
  });
});
