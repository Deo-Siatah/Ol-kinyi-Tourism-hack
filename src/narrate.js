// Plays stories from recordings when available, otherwise from speech synthesis.

function stopAudio(audio) {
  if (!audio) {
    return;
  }
  try {
    audio.pause();
  } catch {
    // narration must never throw
  }
  try {
    if (typeof audio.currentTime === "number") {
      audio.currentTime = 0;
    }
  } catch {
    // narration must never throw
  }
}

export function createNarrator({ audioFactory, synth, lang = "en" } = {}) {
  let currentAudio = null;
  let token = 0;

  function stop() {
    token += 1;
    stopAudio(currentAudio);
    currentAudio = null;
    if (synth) {
      try {
        synth.cancel();
      } catch {
        // narration must never throw
      }
    }
  }

  async function play(story) {
    stop();
    const playToken = token;

    if (story?.audio && typeof audioFactory === "function") {
      let audio = null;
      try {
        audio = audioFactory(story.audio);
        currentAudio = audio;
        await audio.play();
        return "audio";
      } catch {
        if (playToken === token) {
          stopAudio(audio);
          currentAudio = null;
        }
      }
    }

    if (!synth || typeof synth.speak !== "function") {
      return "none";
    }

    try {
      await synth.speak(story?.folklore, lang);
      return "speech";
    } catch {
      return "none";
    }
  }

  return { play, stop };
}
