// Validates the Visualize cutaway content and looks up its sections.

function fail(path, message) {
  throw new Error(`${path} ${message}`);
}

function requireString(value, path) {
  if (typeof value !== "string" || value.length === 0) {
    fail(path, "must be a non-empty string");
  }
}

export function validateVisualize(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    fail("visualize", "must be an object");
  }
  requireString(data.title, "title");
  requireString(data.summary, "summary");
  if (typeof data.verified !== "boolean") {
    fail("verified", "must be a boolean");
  }
  if (!Array.isArray(data.sections) || data.sections.length < 4) {
    fail("sections", "must be an array of at least 4 sections");
  }
  data.sections.forEach((section, i) => {
    const base = `sections[${i}]`;
    if (!section || typeof section !== "object" || Array.isArray(section)) {
      fail(base, "must be an object");
    }
    requireString(section.id, `${base}.id`);
    requireString(section.label, `${base}.label`);
    requireString(section.title, `${base}.title`);
    requireString(section.text, `${base}.text`);
    if (typeof section.verified !== "boolean") {
      fail(`${base}.verified`, "must be a boolean");
    }
  });
  return data;
}

export function getSection(visualize, id) {
  return visualize?.sections.find((section) => section.id === id) ?? null;
}
