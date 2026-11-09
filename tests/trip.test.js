// Tests for the persisted trip record.

import { describe, it, expect } from "vitest";
import { createTrip } from "../src/trip.js";

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
  };
}

function throwingStorage() {
  return {
    getItem: () => {
      throw new Error("storage blocked");
    },
    setItem: () => {
      throw new Error("storage blocked");
    },
  };
}

describe("createTrip", () => {
  it("lists added ids in scan order", () => {
    const trip = createTrip(fakeStorage());

    trip.add("necklace");
    trip.add("animal");

    expect(trip.list()).toEqual(["necklace", "animal"]);
  });

  it("lists unique ids only", () => {
    const trip = createTrip(fakeStorage());

    trip.add("necklace");
    trip.add("necklace");
    trip.add("plant");

    expect(trip.list()).toEqual(["necklace", "plant"]);
  });

  it("survives a new createTrip on the same storage", () => {
    const storage = fakeStorage();
    createTrip(storage).add("plant");

    expect(createTrip(storage).list()).toEqual(["plant"]);
  });

  it("keeps working in memory when storage throws", () => {
    const trip = createTrip(throwingStorage());

    trip.add("necklace");

    expect(trip.list()).toEqual(["necklace"]);
  });
});
