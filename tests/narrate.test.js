// Tests for audio-first narration with speech-synthesis fallback.

import { describe, it, expect, vi } from "vitest";
import { createNarrator } from "../src/narrate.js";

function fakeAudio(overrides = {}) {
  return {
    play: vi.fn(async () => {}),
    pause: vi.fn(),
    currentTime: 4,
    ...overrides,
  };
}

function fakeSynth(overrides = {}) {
  return {
    speak: vi.fn(async () => {}),
    cancel: vi.fn(),
    ...overrides,
  };
}

describe("createNarrator play", () => {
  it("plays a recording and returns audio", async () => {
    const audio = fakeAudio();
    const audioFactory = vi.fn(() => audio);
    const synth = fakeSynth();
    const narrator = createNarrator({ audioFactory, synth, lang: "en" });

    const result = await narrator.play({
      audio: "audio/plant.mp3",
      folklore: "Plant folklore",
    });

    expect(result).toBe("audio");
    expect(audioFactory).toHaveBeenCalledWith("audio/plant.mp3");
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(synth.speak).not.toHaveBeenCalled();
  });

  it("speaks folklore when the story has no recording", async () => {
    const synth = fakeSynth();
    const narrator = createNarrator({ audioFactory: vi.fn(), synth, lang: "en" });

    const result = await narrator.play({ folklore: "Plant folklore" });

    expect(result).toBe("speech");
    expect(synth.speak).toHaveBeenCalledWith("Plant folklore", "en");
  });

  it("defaults the speech language to en", async () => {
    const synth = fakeSynth();
    const narrator = createNarrator({ synth });

    await narrator.play({ folklore: "Folklore" });

    expect(synth.speak).toHaveBeenCalledWith("Folklore", "en");
  });

  it("speaks folklore when the recording fails to play", async () => {
    const synth = fakeSynth();
    const narrator = createNarrator({
      audioFactory: () =>
        fakeAudio({
          play: vi.fn(async () => {
            throw new Error("blocked");
          }),
        }),
      synth,
      lang: "en",
    });

    const result = await narrator.play({
      audio: "audio/animal.mp3",
      folklore: "Lion folklore",
    });

    expect(result).toBe("speech");
    expect(synth.speak).toHaveBeenCalledWith("Lion folklore", "en");
  });

  it("speaks folklore when the audio factory throws", async () => {
    const synth = fakeSynth();
    const narrator = createNarrator({
      audioFactory: () => {
        throw new Error("missing");
      },
      synth,
      lang: "en",
    });

    const result = await narrator.play({
      audio: "audio/animal.mp3",
      folklore: "Lion folklore",
    });

    expect(result).toBe("speech");
  });

  it("returns none when there is no recording and no speech", async () => {
    const narrator = createNarrator({});

    const result = await narrator.play({ folklore: "Folklore" });

    expect(result).toBe("none");
  });

  it("returns none when audio fails and there is no speech", async () => {
    const narrator = createNarrator({
      audioFactory: () => {
        throw new Error("missing");
      },
    });

    const result = await narrator.play({
      audio: "audio/plant.mp3",
      folklore: "Plant folklore",
    });

    expect(result).toBe("none");
  });

  it("returns none when speech fails", async () => {
    const synth = fakeSynth({
      speak: vi.fn(async () => {
        throw new Error("unavailable");
      }),
    });
    const narrator = createNarrator({ synth });

    const result = await narrator.play({ folklore: "Folklore" });

    expect(result).toBe("none");
  });
});

describe("createNarrator stop", () => {
  it("stops the previous narration before starting a new one", async () => {
    const first = fakeAudio();
    const second = fakeAudio();
    const audioFactory = vi
      .fn()
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second);
    const synth = fakeSynth();
    const narrator = createNarrator({ audioFactory, synth });

    await narrator.play({ audio: "audio/a.mp3", folklore: "A" });
    await narrator.play({ audio: "audio/b.mp3", folklore: "B" });

    expect(first.pause).toHaveBeenCalledTimes(1);
    expect(first.currentTime).toBe(0);
    expect(synth.cancel).toHaveBeenCalled();
  });

  it("pauses audio, rewinds it and cancels speech", async () => {
    const audio = fakeAudio();
    const synth = fakeSynth();
    const narrator = createNarrator({ audioFactory: () => audio, synth });

    await narrator.play({ audio: "audio/a.mp3", folklore: "A" });
    synth.cancel.mockClear();
    narrator.stop();

    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(audio.currentTime).toBe(0);
    expect(synth.cancel).toHaveBeenCalledTimes(1);
  });

  it("is safe when nothing is playing", () => {
    const synth = fakeSynth();
    const narrator = createNarrator({ synth });

    expect(() => narrator.stop()).not.toThrow();
    expect(synth.cancel).toHaveBeenCalledTimes(1);
  });
});
