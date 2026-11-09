// Tests for the Web Speech API narration adapter.

import { describe, it, expect, vi } from "vitest";
import { createSpeechSynth } from "../src/speech.js";

class FakeUtterance {
  constructor(text) {
    this.text = text;
    this.lang = "";
  }
}

function fakeSpeech() {
  return {
    speak: vi.fn(),
    cancel: vi.fn(),
  };
}

describe("createSpeechSynth speak", () => {
  it("speaks an utterance with the text and language", () => {
    const speech = fakeSpeech();
    const synth = createSpeechSynth({ speech, Utterance: FakeUtterance });

    synth.speak("Plant folklore", "en");

    expect(speech.speak).toHaveBeenCalledTimes(1);
    const utterance = speech.speak.mock.calls[0][0];
    expect(utterance).toBeInstanceOf(FakeUtterance);
    expect(utterance.text).toBe("Plant folklore");
    expect(utterance.lang).toBe("en");
  });

  it("cancels the previous utterance before speaking", () => {
    const speech = fakeSpeech();
    const synth = createSpeechSynth({ speech, Utterance: FakeUtterance });

    synth.speak("Plant folklore", "en");

    expect(speech.cancel).toHaveBeenCalledTimes(1);
    expect(speech.cancel.mock.invocationCallOrder[0]).toBeLessThan(
      speech.speak.mock.invocationCallOrder[0],
    );
  });

  it("throws when speech synthesis is unavailable", () => {
    const synth = createSpeechSynth({ speech: undefined, Utterance: FakeUtterance });

    expect(() => synth.speak("Plant folklore", "en")).toThrow(/not available/);
  });

  it("throws when the utterance constructor is unavailable", () => {
    const synth = createSpeechSynth({ speech: fakeSpeech(), Utterance: undefined });

    expect(() => synth.speak("Plant folklore", "en")).toThrow(/not available/);
  });

  it("throws when the text is empty", () => {
    const synth = createSpeechSynth({ speech: fakeSpeech(), Utterance: FakeUtterance });

    expect(() => synth.speak("", "en")).toThrow(/non-empty string/);
    expect(() => synth.speak(undefined, "en")).toThrow(/non-empty string/);
  });
});

describe("createSpeechSynth cancel", () => {
  it("cancels the current utterance", () => {
    const speech = fakeSpeech();
    const synth = createSpeechSynth({ speech, Utterance: FakeUtterance });

    synth.cancel();

    expect(speech.cancel).toHaveBeenCalledTimes(1);
  });

  it("is safe when speech synthesis is unavailable", () => {
    const synth = createSpeechSynth({ speech: undefined, Utterance: FakeUtterance });

    expect(() => synth.cancel()).not.toThrow();
  });
});
