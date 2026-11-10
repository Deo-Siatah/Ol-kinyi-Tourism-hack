// Renders approved story highlights as colour swatches and timelines.

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function swatchClass(name) {
  const slug = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `swatch--${slug}`;
}

function section(title, body) {
  return `<section class="highlight"><h3 class="highlight__title">${title}</h3>${body}</section>`;
}

function renderSwatches(colors) {
  const items = colors
    .map(
      (color) =>
        `<li class="swatch"><span class="swatch__dot ${swatchClass(color.name)}" aria-hidden="true"></span><span class="swatch__text"><strong>${escapeHtml(color.name)}</strong><span>${escapeHtml(color.meaning)}</span></span></li>`,
    )
    .join("");
  return `<ul class="swatches">${items}</ul>`;
}

function renderTimeline(items) {
  const list = items
    .map(
      (item) =>
        `<li class="timeline__item"><span class="timeline__dot" aria-hidden="true"></span><div><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(item.detail)}</p></div></li>`,
    )
    .join("");
  return `<ol class="timeline">${list}</ol>`;
}

export function renderHighlights(story) {
  const highlights = story?.highlights;
  if (!highlights) {
    return "";
  }

  const parts = [];
  if (Array.isArray(highlights.colors)) {
    parts.push(section("Bead colours", renderSwatches(highlights.colors)));
  }
  if (Array.isArray(highlights.stages)) {
    parts.push(section("Life stages", renderTimeline(highlights.stages)));
  }
  if (Array.isArray(highlights.roles)) {
    parts.push(section("Roles", renderTimeline(highlights.roles)));
  }
  if (Array.isArray(highlights.timeline)) {
    parts.push(section("From hunt to guardianship", renderTimeline(highlights.timeline)));
  }
  return parts.join("");
}
