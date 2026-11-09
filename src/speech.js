// Wraps the browser Web Speech API as a narration synthesizer.

export function createSpeechSynth({
  speech = globalThis.speechSynthesis,
  Utterance = globalThis.SpeechSynthesisUtterance,
} = {}) {
  function cancel() {
    if (speech) {
      speech.cancel();
    }
  }

  function speak(text, lang) {
    if (!speech || typeof Utterance !== "function") {
      throw new Error("Speech synthesis is not available");
    }
    if (typeof text !== "string" || text.length === 0) {
      throw new Error("Speech text must be a non-empty string");
    }
    cancel();
    const utterance = new Utterance(text);
    utterance.lang = lang;
    speech.speak(utterance);
  }

  return { speak, cancel };
}
