// Validates and loads story data, and looks up targets by index.

const ALLOWED_IDS = ["necklace", "plant", "animal"];

function fail(path, message) {
  throw new Error(`${path} ${message}`);
}

function requireString(value, path) {
  if (typeof value !== "string" || value.length === 0) {
    fail(path, "must be a non-empty string");
  }
}

function requireStringArray(value, path) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    fail(path, "must be an array of strings");
  }
}

export function validateStories(data) {
  if (!data || !Array.isArray(data.targets) || data.targets.length !== 3) {
    fail("targets", "must be an array of 3 targets");
  }

  data.targets.forEach((target, i) => {
    const base = `targets[${i}]`;
    if (target.index !== i) {
      fail(`${base}.index`, `must equal ${i}`);
    }
    if (!ALLOWED_IDS.includes(target.id)) {
      fail(`${base}.id`, `must be one of ${ALLOWED_IDS.join(", ")}`);
    }
    requireString(target.title, `${base}.title`);
    requireString(target.summary, `${base}.summary`);
    requireStringArray(target.details, `${base}.details`);
    requireString(target.folklore, `${base}.folklore`);
    if (typeof target.verified !== "boolean") {
      fail(`${base}.verified`, "must be a boolean");
    }
    requireString(target.image, `${base}.image`);
  });

  if (!data.before || typeof data.before !== "object") {
    fail("before", "must be an object");
  }
  if (!Array.isArray(data.before.greetings)) {
    fail("before.greetings", "must be an array");
  }
  data.before.greetings.forEach((greeting, i) => {
    requireString(greeting?.maa, `before.greetings[${i}].maa`);
    requireString(greeting?.english, `before.greetings[${i}].english`);
  });
  requireStringArray(data.before.etiquette, "before.etiquette");

  return data;
}

export function loadStories(data) {
  return validateStories(data);
}

export function getStoryByIndex(stories, index) {
  return stories.targets.find((target) => target.index === index);
}
