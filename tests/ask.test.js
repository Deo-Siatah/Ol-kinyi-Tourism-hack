// Tests for local answering, message building, and server-first ask fallback.

import { describe, it, expect, vi } from "vitest";
import { answerLocal, buildMessages, ask } from "../src/ask.js";
import { storyFixture } from "./fixtures.js";

const NOT_FOUND = "That's not in our approved stories yet.";

describe("answerLocal", () => {
  it("picks the story with the most word overlap", () => {
    const result = answerLocal("Tell me about the beaded necklace", storyFixture());

    expect(result).toEqual({
      text: "A beaded necklace.",
      storyId: "necklace",
      source: "local",
    });
  });

  it("matches case-insensitively", () => {
    const result = answerLocal("BEADED Necklace", storyFixture());

    expect(result.storyId).toBe("necklace");
  });

  it("returns the not-found line when there is no overlap", () => {
    const result = answerLocal("spaceship", storyFixture());

    expect(result).toEqual({ text: NOT_FOUND, storyId: null, source: "local" });
  });
});

describe("buildMessages", () => {
  it("builds a system message with the story text and a user question", () => {
    const story = storyFixture().targets[1];

    const messages = buildMessages("What does the plant mean?", story);

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain("A healing plant.");
    expect(messages[0].content).toContain(NOT_FOUND);
    expect(messages[1]).toEqual({
      role: "user",
      content: "What does the plant mean?",
    });
  });
});

describe("ask", () => {
  it("posts to /api/ask and returns the Groq answer on success", async () => {
    const fetchFn = vi.fn(async () => ({
      ok: true,
      json: async () => ({ answer: "Groq answer", storyId: "plant" }),
    }));

    const result = await ask("healing plant", storyFixture(), { fetchFn });

    expect(result).toEqual({
      text: "Groq answer",
      storyId: "plant",
      source: "groq",
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("/api/ask");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ question: "healing plant" });
  });

  it("falls back to answerLocal on a non-OK response", async () => {
    const fetchFn = vi.fn(async () => ({ ok: false, status: 500 }));
    const stories = storyFixture();

    const result = await ask("healing plant", stories, { fetchFn });

    expect(result).toEqual(answerLocal("healing plant", stories));
  });

  it("falls back to answerLocal on a network error", async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error("offline");
    });
    const stories = storyFixture();

    const result = await ask("healing plant", stories, { fetchFn });

    expect(result).toEqual(answerLocal("healing plant", stories));
    expect(result.source).toBe("local");
  });
});
