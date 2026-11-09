// Tests for the server ask handler.

import { describe, it, expect, vi } from "vitest";
import { handleAsk } from "../api/ask.js";
import { buildMessages } from "../src/ask.js";
import { storyFixture } from "./fixtures.js";

const NOT_FOUND = "That's not in our approved stories yet.";

describe("handleAsk", () => {
  it("returns 400 when the question is empty", async () => {
    const result = await handleAsk(
      { question: "" },
      { callGroq: vi.fn(), stories: storyFixture() },
    );

    expect(result.status).toBe(400);
    expect(result.json.error).toBeTruthy();
  });

  it("returns 400 when the question is only whitespace", async () => {
    const result = await handleAsk(
      { question: "   " },
      { callGroq: vi.fn(), stories: storyFixture() },
    );

    expect(result.status).toBe(400);
  });

  it("calls Groq with only the matched story's messages and returns 200", async () => {
    const stories = storyFixture();
    const callGroq = vi.fn(async () => "Groq answer");

    const result = await handleAsk(
      { question: "healing plant" },
      { callGroq, stories },
    );

    expect(result).toEqual({
      status: 200,
      json: { answer: "Groq answer", storyId: "plant" },
    });
    expect(callGroq).toHaveBeenCalledTimes(1);
    expect(callGroq).toHaveBeenCalledWith(
      buildMessages("healing plant", stories.targets[1]),
    );
    const [messages] = callGroq.mock.calls[0];
    expect(messages[0].content).not.toContain("A beaded necklace.");
  });

  it("returns the not-found line without calling Groq when nothing matches", async () => {
    const callGroq = vi.fn();

    const result = await handleAsk(
      { question: "spaceship" },
      { callGroq, stories: storyFixture() },
    );

    expect(result).toEqual({
      status: 200,
      json: { answer: NOT_FOUND, storyId: null },
    });
    expect(callGroq).not.toHaveBeenCalled();
  });
});
