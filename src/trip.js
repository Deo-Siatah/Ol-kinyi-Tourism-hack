// Records visited target ids in scan order, persisted when storage works.

const STORAGE_KEY = "olkinyi.trip.ids";

export function createTrip(storage) {
  let ids = [];

  try {
    const stored = storage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        ids = [...new Set(parsed.filter((id) => typeof id === "string"))];
      }
    }
  } catch {
    ids = [];
  }

  function persist() {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      return;
    }
  }

  return {
    add(id) {
      if (!ids.includes(id)) {
        ids.push(id);
        persist();
      }
    },
    list() {
      return ids.slice();
    },
  };
}
