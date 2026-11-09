// Renders story and trip-record HTML.

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderOverlay(story) {
  const label = story.verified ? "" : '<span class="illustrative">Illustrative</span>';
  const details = story.details
    .map((detail) => `<li>${escapeHtml(detail)}</li>`)
    .join("");

  return (
    '<article class="overlay">' +
    `<h2>${escapeHtml(story.title)}</h2>` +
    label +
    `<p>${escapeHtml(story.summary)}</p>` +
    `<ul>${details}</ul>` +
    `<p>${escapeHtml(story.folklore)}</p>` +
    "</article>"
  );
}

export function renderTripRecord(ids, stories) {
  if (ids.length === 0) {
    return "No scans yet";
  }

  const items = ids
    .map((id) => stories.targets.find((target) => target.id === id))
    .filter(Boolean)
    .map((story) => `<li>${escapeHtml(story.title)}</li>`)
    .join("");

  return `<ul>${items}</ul>`;
}
