// Wires the camera, MindAR, service worker and real dependencies into the app.

import { MindARThree } from "../vendor/mindar-image-three.prod.js";
import { mountApp } from "./app.js";
import { createTrip } from "./trip.js";
import { ask } from "./ask.js";
import { createNarrator } from "./narrate.js";
import { createSpeechSynth } from "./speech.js";

function safeStorage() {
  try {
    return window.localStorage;
  } catch {
    return { getItem: () => null, setItem: () => {} };
  }
}

async function loadStories() {
  const response = await fetch("/content/stories.json");
  if (!response.ok) {
    throw new Error(`Failed to load stories.json with status ${response.status}`);
  }
  return response.json();
}

function askFromServer(question, stories) {
  return ask(question, stories, { fetchFn: window.fetch.bind(window) });
}

async function startCameraPreview(showCameraError) {
  const video = document.querySelector("[data-camera-video]");
  if (!navigator.mediaDevices?.getUserMedia) {
    showCameraError("Camera is not available. Tap a card to explore instead.");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    video.hidden = false;
    video.srcObject = stream;
    await video.play();
  } catch {
    showCameraError("Camera was blocked. Tap a card to explore instead.");
  }
}

async function startAR(stories, app) {
  if (!window.isSecureContext) {
    app.showCameraError("Camera needs HTTPS. Tap a card to explore instead.");
    return;
  }
  try {
    const container = document.querySelector("[data-camera-view]");
    document.querySelector("[data-camera-video]").hidden = true;
    const mindarThree = new MindARThree({
      container,
      imageTargetSrc: "/targets.mind",
    });
    const { renderer, scene, camera } = mindarThree;
    for (const story of stories.targets) {
      const anchor = mindarThree.addAnchor(story.index);
      anchor.onTargetFound = () => app.onTargetFound(story.index);
    }
    await mindarThree.start();
    renderer.setAnimationLoop(() => renderer.render(scene, camera));
  } catch {
    app.showCameraError("Augmented reality could not start. Tap a card to explore instead.");
    await startCameraPreview(app.showCameraError);
  }
}

async function bootstrap() {
  const root = document.getElementById("root");
  const stories = await loadStories();
  const trip = createTrip(safeStorage());
  const narrator = createNarrator({
    audioFactory: (path) => new Audio(path),
    synth: createSpeechSynth(),
    lang: "en",
  });
  const app = mountApp(root, { stories, trip, ask: askFromServer, narrator });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { type: "module" }).catch(() => {});
  }

  await startAR(stories, app);
}

bootstrap().catch((error) => {
  document.getElementById("root").textContent =
    `Could not load the app: ${error.message}`;
});
