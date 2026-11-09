// Mounts the Before, Explore and After screens and their interactions.

import { getStoryByIndex } from "./stories.js";

export function mountApp(root, { stories, trip, ask, narrator }) {
  root.innerHTML = `
    <div class="app">
      <main class="screens">
        <section class="screen screen--before" data-screen="before">
          <p class="eyebrow">Maasai Mara</p>
          <h1 class="hero-title">Welcome to Ol-Kinyi</h1>
          <p class="lede">Point your phone at a bead, a plant or an animal to hear its story.</p>
          <section class="panel">
            <h2>Greetings</h2>
            <ul class="greetings" data-greetings></ul>
          </section>
          <section class="panel">
            <h2>Etiquette</h2>
            <ul class="etiquette" data-etiquette></ul>
          </section>
          <button class="btn btn--accent" type="button" data-start>Start exploring</button>
        </section>

        <section class="screen screen--explore" data-screen="explore" hidden>
          <div class="camera-view" data-camera-view>
            <video class="camera-video" data-camera-video playsinline muted autoplay></video>
            <div class="camera-error" data-camera-error hidden></div>
          </div>
          <div class="target-dock">
            <div class="targets" data-targets></div>
          </div>
          <div class="sheet" data-sheet hidden>
            <button class="sheet__close" type="button" data-sheet-close aria-label="Close story">Close</button>
            <div class="sheet__head">
              <h2 data-sheet-title></h2>
              <span class="badge" data-sheet-badge hidden></span>
            </div>
            <p class="sheet__summary" data-sheet-summary></p>
            <ul class="sheet__details" data-sheet-details></ul>
            <p class="sheet__folklore" data-sheet-folklore></p>
            <button class="btn btn--accent" type="button" data-listen disabled>Listen</button>
            <p class="listen-status" data-listen-status hidden></p>
            <form class="ask" data-ask-form>
              <input class="ask__input" type="text" data-ask-input placeholder="Ask about this story" autocomplete="off" />
              <button class="btn btn--mid" type="submit">Ask</button>
            </form>
            <p class="ask__answer" data-answer></p>
          </div>
        </section>

        <section class="screen screen--after" data-screen="after" hidden>
          <h1>Your trip</h1>
          <p class="progress" data-progress></p>
          <div class="cards" data-cards></div>
        </section>
      </main>

      <nav class="tabbar" aria-label="Sections">
        <button class="tab" type="button" data-tab="before" aria-selected="true">Before</button>
        <button class="tab" type="button" data-tab="explore" aria-selected="false">Explore</button>
        <button class="tab" type="button" data-tab="after" aria-selected="false">After</button>
      </nav>
    </div>
  `;

  const screens = root.querySelectorAll("[data-screen]");
  const tabs = root.querySelectorAll("[data-tab]");
  const sheet = root.querySelector("[data-sheet]");
  const sheetTitle = root.querySelector("[data-sheet-title]");
  const sheetSummary = root.querySelector("[data-sheet-summary]");
  const sheetDetails = root.querySelector("[data-sheet-details]");
  const sheetFolklore = root.querySelector("[data-sheet-folklore]");
  const sheetBadge = root.querySelector("[data-sheet-badge]");
  const answerEl = root.querySelector("[data-answer]");
  const askForm = root.querySelector("[data-ask-form]");
  const askInput = root.querySelector("[data-ask-input]");
  const progress = root.querySelector("[data-progress]");
  const cards = root.querySelector("[data-cards]");
  const cameraError = root.querySelector("[data-camera-error]");
  const listenButton = root.querySelector("[data-listen]");
  const listenStatus = root.querySelector("[data-listen-status]");
  let currentStory = null;

  function showScreen(name) {
    screens.forEach((screen) => {
      screen.hidden = screen.dataset.screen !== name;
    });
    tabs.forEach((tab) => {
      tab.setAttribute("aria-selected", String(tab.dataset.tab === name));
    });
  }

  function renderGreetings() {
    const list = root.querySelector("[data-greetings]");
    for (const greeting of stories.before.greetings) {
      const item = document.createElement("li");
      const maa = document.createElement("strong");
      maa.textContent = greeting.maa;
      const english = document.createElement("span");
      english.textContent = greeting.english;
      item.append(maa, english);
      list.appendChild(item);
    }
  }

  function renderEtiquette() {
    const list = root.querySelector("[data-etiquette]");
    for (const rule of stories.before.etiquette) {
      const item = document.createElement("li");
      item.textContent = rule;
      list.appendChild(item);
    }
  }

  function renderTargets() {
    const container = root.querySelector("[data-targets]");
    for (const story of stories.targets) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "target";
      button.dataset.target = String(story.index);
      const img = document.createElement("img");
      img.src = story.image;
      img.alt = story.title;
      const label = document.createElement("span");
      label.textContent = story.title;
      button.append(img, label);
      button.addEventListener("click", () => onTargetFound(story.index));
      container.appendChild(button);
    }
  }

  function openSheet(story) {
    narrator.stop();
    currentStory = story;
    listenButton.disabled = false;
    listenStatus.hidden = true;
    listenStatus.textContent = "";
    sheetTitle.textContent = story.title;
    sheetSummary.textContent = story.summary;
    sheetDetails.replaceChildren(
      ...story.details.map((detail) => {
        const item = document.createElement("li");
        item.textContent = detail;
        return item;
      }),
    );
    sheetFolklore.textContent = story.folklore;
    sheetBadge.textContent = story.verified ? "" : "Illustrative";
    sheetBadge.hidden = story.verified;
    answerEl.textContent = "";
    askInput.value = "";
    sheet.hidden = false;
  }

  function closeSheet() {
    narrator.stop();
    currentStory = null;
    listenButton.disabled = true;
    listenStatus.hidden = true;
    listenStatus.textContent = "";
    sheet.hidden = true;
  }

  function renderAfter() {
    const ids = trip.list();
    progress.textContent = `${ids.length} of ${stories.targets.length} discovered`;
    cards.replaceChildren();

    if (ids.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No scans yet";
      cards.appendChild(empty);
      return;
    }

    for (const id of ids) {
      const story = stories.targets.find((target) => target.id === id);
      if (!story) {
        continue;
      }
      const card = document.createElement("article");
      card.className = "card";
      const img = document.createElement("img");
      img.src = story.image;
      img.alt = "";
      const body = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = story.title;
      const summary = document.createElement("p");
      summary.textContent = story.summary;
      body.append(title, summary);
      card.append(img, body);
      cards.appendChild(card);
    }
  }

  function onTargetFound(index) {
    const story = getStoryByIndex(stories, index);
    if (!story) {
      return null;
    }
    trip.add(story.id);
    openSheet(story);
    renderAfter();
    return story;
  }

  function showCameraError(message) {
    cameraError.textContent = message;
    cameraError.hidden = false;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      narrator.stop();
      showScreen(tab.dataset.tab);
    });
  });
  root.querySelector("[data-start]").addEventListener("click", () => showScreen("explore"));
  root.querySelector("[data-sheet-close]").addEventListener("click", () => {
    closeSheet();
  });
  listenButton.addEventListener("click", async () => {
    if (!currentStory) {
      return;
    }
    const story = currentStory;
    listenStatus.hidden = true;
    const result = await narrator.play(story);
    if (currentStory !== story || result !== "none") {
      return;
    }
    listenStatus.textContent = "Audio is not available on this device.";
    listenStatus.hidden = false;
  });
  askForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = askInput.value.trim();
    if (!question) {
      return;
    }
    answerEl.textContent = "Thinking…";
    const result = await ask(question, stories);
    answerEl.textContent = result.text;
  });

  renderGreetings();
  renderEtiquette();
  renderTargets();
  renderAfter();
  showScreen("before");

  return { onTargetFound, showCameraError };
}
