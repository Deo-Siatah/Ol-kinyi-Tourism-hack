// Mounts the Before, Explore and After screens and their interactions.

import { getStoryByIndex } from "./stories.js";
import { icon } from "./icons.js";

const PREVIEW_ICONS = {
  necklace: "gem",
  plant: "leaf",
  animal: "paw",
};

const PREVIEW_IMAGES = {
  necklace: "/img/landing/beadwork.jpg",
  plant: "/img/landing/savanna.jpg",
  animal: "/img/landing/lion.jpg",
};

export function mountApp(root, { stories, trip, ask, narrator }) {
  root.innerHTML = `
    <div class="app">
      <main class="screens">
        <section class="screen screen--before" data-screen="before">
          <header class="landing-hero">
            <img class="landing-hero__image" data-hero-image src="/img/landing/hero-mara.jpg" alt="Sunbeams breaking through clouds over the Maasai Mara plains" />
            <div class="landing-hero__scrim" aria-hidden="true"></div>
            <div class="landing-hero__content">
              <p class="eyebrow">Ol-Kinyi · Maasai Mara</p>
              <h1 class="hero-title">Discover the story of the Maasai</h1>
              <p class="lede">A unique culture to appreciate. Scan a bead, a tree or a lion, and let the Mara speak.</p>
              <button class="btn btn--accent" type="button" data-start>Scan to enter the Mara</button>
              <a class="btn btn--ghost" href="#before-you-go" data-before-link>Before you go</a>
            </div>
          </header>
          <div class="landing-body">
            <section class="values" aria-label="Why Ol-Kinyi">
              <article class="value">
                <span class="value__icon">${icon("sparkles")}</span>
                <div>
                  <h2>Discover the story</h2>
                  <p>Every bead, tree and lion opens a story worth hearing.</p>
                </div>
              </article>
              <article class="value">
                <span class="value__icon">${icon("compass")}</span>
                <div>
                  <h2>A unique culture</h2>
                  <p>Learn the greetings and etiquette that make a visit respectful.</p>
                </div>
              </article>
              <article class="value">
                <span class="value__icon">${icon("paw")}</span>
                <div>
                  <h2>Appreciate the jump</h2>
                  <p>Meet the Adumu jump in the story of the lion and the Maasai Olympics.</p>
                </div>
              </article>
            </section>
            <section class="discover">
              <div class="section-head">
                <h2 class="section-title">What you will discover</h2>
                <span class="section-kicker">${stories.targets.length} stories</span>
              </div>
              <div class="preview-grid" data-preview></div>
            </section>
            <section class="panel" id="before-you-go">
              <h2 class="panel-title">${icon("volume")} Greetings</h2>
              <ul class="greetings" data-greetings></ul>
            </section>
            <section class="panel">
              <h2 class="panel-title">${icon("sparkles")} Etiquette</h2>
              <ul class="etiquette" data-etiquette></ul>
            </section>
            <p class="credits">
              Photos:
              <a href="https://commons.wikimedia.org/wiki/File:Maasai_Mara_landscape_beneath_clouds_and_sunbeams.jpg">Daniel Case</a>,
              <a href="https://commons.wikimedia.org/wiki/File:Handmade_maasai_beadwork.jpg">Cecilia Nkini</a>,
              <a href="https://commons.wikimedia.org/wiki/File:Maasai_Mara_savanna_landscape%2C_Kenya.jpg">Daniel Case</a>,
              <a href="https://commons.wikimedia.org/wiki/File:Male_lion_resting_Maasai_Mara_Kenya.jpg">Smtunli</a>
              · CC BY-SA 4.0 via Wikimedia Commons
            </p>
          </div>
        </section>

        <section class="screen screen--explore" data-screen="explore" hidden>
          <div class="camera-view" data-camera-view>
            <video class="camera-video" data-camera-video playsinline muted autoplay></video>
            <div class="camera-error" data-camera-error hidden></div>
          </div>
          <div class="scan-guide" data-scan-guide>
            <div class="reticle" aria-hidden="true"></div>
            <p class="scan-guide__text">Point at the necklace, plant or animal card</p>
          </div>
          <div class="target-dock">
            <div class="targets" data-targets></div>
          </div>
          <div class="sheet sheet--reveal" data-sheet hidden>
            <img class="sheet__image" data-sheet-image alt="" />
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

      <nav class="tabbar" aria-label="Journey steps">
        <button class="tab" type="button" data-tab="before" aria-selected="true">
          ${icon("compass", "tab__icon")}<span class="tab__label">Discover</span>
        </button>
        <button class="tab tab--scan" type="button" data-tab="explore" aria-selected="false">
          <span class="tab__scan-badge">${icon("scan", "tab__icon")}</span><span class="tab__label">Scan</span>
        </button>
        <button class="tab" type="button" data-tab="after" aria-selected="false">
          ${icon("book", "tab__icon")}<span class="tab__label">Reflect</span>
        </button>
      </nav>
    </div>
  `;

  const screens = root.querySelectorAll("[data-screen]");
  const tabs = root.querySelectorAll("[data-tab]");
  const sheet = root.querySelector("[data-sheet]");
  const sheetImage = root.querySelector("[data-sheet-image]");
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

  function renderPreview() {
    const container = root.querySelector("[data-preview]");
    for (const story of stories.targets) {
      const card = document.createElement("article");
      card.className = "preview";
      card.dataset.previewTarget = String(story.index);
      const img = document.createElement("img");
      img.src = PREVIEW_IMAGES[story.id] ?? story.image;
      img.alt = "";
      const iconWrap = document.createElement("span");
      iconWrap.className = "preview__icon";
      iconWrap.innerHTML = icon(PREVIEW_ICONS[story.id] ?? "sparkles");
      const title = document.createElement("h3");
      title.textContent = story.title;
      card.append(img, iconWrap, title);
      container.appendChild(card);
    }
  }

  function renderStart() {
    const visited = trip.list();
    if (visited.length === 0) {
      return;
    }
    root.querySelector("[data-start]").textContent =
      `Continue your journey · ${visited.length} of ${stories.targets.length}`;
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
    sheetImage.src = story.image;
    sheetImage.alt = story.title;
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
  renderPreview();
  renderStart();
  renderTargets();
  renderAfter();
  showScreen("before");

  return { onTargetFound, showCameraError };
}
