// Wires the camera, MindAR, service worker and real dependencies into the app.

import { MindARThree } from "../vendor/mindar-image-three.prod.js";
import { mountApp } from "./app.js";
import { createTrip } from "./trip.js";
import { ask } from "./ask.js";
import { createNarrator } from "./narrate.js";
import { createSpeechSynth } from "./speech.js";
import { validateVisualize } from "./visualize.js";

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

async function loadVisualize() {
  let contentResponse;
  let svgResponse;
  try {
    [contentResponse, svgResponse] = await Promise.all([
      fetch("/content/visualize.json"),
      fetch("/content/visualize.svg"),
    ]);
  } catch {
    return null;
  }
  if (!contentResponse.ok || !svgResponse.ok) {
    return null;
  }
  const data = validateVisualize(await contentResponse.json());
  return { data, svg: await svgResponse.text() };
}

function askFromServer(question, stories) {
  return ask(question, stories, { fetchFn: window.fetch.bind(window) });
}

function createScanSession({ stories, app }) {
  const container = document.querySelector("[data-ar-view]");
  const video = document.querySelector("[data-camera-video]");
  let mindarThree = null;
  let previewStream = null;
  let session = 0;
  let pending = null;
  let running = false;

  function stopInstance(instance) {
    instance.renderer.setAnimationLoop(null);
    const stream = instance.video?.srcObject;
    try {
      instance.stop();
    } catch {
      // MindAR may fail to stop before its controller is ready.
    }
    if (stream?.getTracks) {
      stream.getTracks().forEach((track) => track.stop());
    }
    container.replaceChildren();
  }

  function clear() {
    if (mindarThree) {
      stopInstance(mindarThree);
      mindarThree = null;
    } else {
      container.replaceChildren();
    }
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
      previewStream = null;
    }
    video.srcObject = null;
    video.hidden = true;
  }

  function stop() {
    session += 1;
    running = false;
    clear();
  }

  async function startPreview() {
    if (!navigator.mediaDevices?.getUserMedia) {
      app.showCameraError("Camera is not available. Tap a card to explore instead.");
      return false;
    }
    try {
      previewStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      video.hidden = false;
      video.srcObject = previewStream;
      await video.play();
      return true;
    } catch {
      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
        previewStream = null;
      }
      video.srcObject = null;
      video.hidden = true;
      app.showCameraError("Camera was blocked. Tap a card to explore instead.");
      return false;
    }
  }

  async function begin() {
    const request = ++session;
    if (!window.isSecureContext) {
      app.showCameraError("Camera needs HTTPS. Tap a card to explore instead.");
      return false;
    }
    clear();
    const instance = new MindARThree({
      container,
      imageTargetSrc: "/targets.mind",
      uiLoading: "no",
      uiScanning: "no",
      uiError: "no",
    });
    mindarThree = instance;
    const { renderer, scene, camera } = instance;
    for (const story of stories.targets) {
      const anchor = instance.addAnchor(story.index);
      anchor.onTargetFound = () => {
        if (request === session) {
          app.onTargetFound(story.index);
        }
      };
    }
    try {
      await instance.start();
      if (request !== session) {
        stopInstance(instance);
        if (mindarThree === instance) {
          mindarThree = null;
        }
        return false;
      }
      renderer.setAnimationLoop(() => renderer.render(scene, camera));
      running = true;
      return true;
    } catch {
      if (request !== session) {
        stopInstance(instance);
        if (mindarThree === instance) {
          mindarThree = null;
        }
        return false;
      }
      stopInstance(instance);
      mindarThree = null;
      app.showCameraError("Augmented reality could not start. Tap a card to explore instead.");
      running = await startPreview();
      if (request !== session) {
        clear();
        running = false;
        return false;
      }
      return running;
    }
  }

  function start() {
    if (running) {
      return Promise.resolve(true);
    }
    if (!pending) {
      pending = begin().finally(() => {
        pending = null;
      });
    }
    return pending;
  }

  return { start, stop };
}

async function bootstrap() {
  const root = document.getElementById("root");
  const stories = await loadStories();
  const visualize = await loadVisualize();
  const trip = createTrip(safeStorage());
  const narrator = createNarrator({
    audioFactory: (path) => new Audio(path),
    synth: createSpeechSynth(),
    lang: "en",
  });
  let session = null;
  const scanner = {
    start: () => session.start(),
    stop: () => session.stop(),
  };
  const app = mountApp(root, {
    stories,
    trip,
    ask: askFromServer,
    narrator,
    scanner,
    visualize: visualize?.data,
    visualizeSvg: visualize?.svg,
  });
  session = createScanSession({ stories, app });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      app.stopScan();
    }
  });
  window.addEventListener("pagehide", () => app.stopScan());

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { type: "module" }).catch(() => {});
  }
}

bootstrap().catch((error) => {
  document.getElementById("root").textContent =
    `Could not load the app: ${error.message}`;
});
