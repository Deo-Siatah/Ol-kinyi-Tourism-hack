// Shared story fixtures for tests.

export function storyFixture() {
  return {
    targets: [
      {
        index: 0,
        id: "necklace",
        title: "Necklace",
        summary: "A beaded necklace.",
        details: ["Detail one", "Detail two"],
        folklore: "Necklace folklore.",
        verified: false,
        image: "img/necklace.jpg",
        highlights: {
          colors: [{ name: "Red", meaning: "meaning one" }],
          stages: [{ name: "Brides", detail: "stage detail" }],
        },
      },
      {
        index: 1,
        id: "plant",
        title: "Plant",
        summary: "A healing plant.",
        details: ["Leaf"],
        folklore: "Plant folklore.",
        verified: true,
        image: "img/plant.jpg",
        highlights: { roles: [{ name: "Food", detail: "role detail" }] },
      },
      {
        index: 2,
        id: "animal",
        title: "Animal",
        summary: "A wild animal.",
        details: ["Mane"],
        folklore: "Animal folklore.",
        verified: false,
        image: "img/animal.jpg",
        highlights: { timeline: [{ name: "Olamayio", detail: "timeline detail" }] },
      },
      {
        index: 3,
        id: "shuka",
        title: "Shuka",
        summary: "A woven cloth.",
        details: ["Cloth detail"],
        folklore: "Shuka folklore.",
        verified: true,
        image: "img/shuka.jpg",
        highlights: { colors: [{ name: "Red", meaning: "red meaning" }] },
      },
      {
        index: 4,
        id: "manyatta",
        title: "Manyatta",
        summary: "A homestead.",
        details: ["Home detail"],
        folklore: "Manyatta folklore.",
        verified: true,
        image: "img/manyatta.jpg",
      },
    ],
    before: {
      greetings: [{ maa: "maa", english: "english" }],
      etiquette: ["etiquette"],
    },
  };
}

export function visualizeFixture() {
  return {
    title: "PLACEHOLDER-visualize",
    summary: "PLACEHOLDER-visualize",
    verified: false,
    sections: [
      {
        id: "roof",
        label: "PLACEHOLDER-roof",
        title: "PLACEHOLDER-roof",
        text: "PLACEHOLDER-roof",
        verified: false,
      },
      {
        id: "walls",
        label: "PLACEHOLDER-walls",
        title: "PLACEHOLDER-walls",
        text: "PLACEHOLDER-walls",
        verified: false,
      },
      {
        id: "entrance",
        label: "PLACEHOLDER-entrance",
        title: "PLACEHOLDER-entrance",
        text: "PLACEHOLDER-entrance",
        verified: false,
      },
      {
        id: "interior",
        label: "PLACEHOLDER-interior",
        title: "PLACEHOLDER-interior",
        text: "PLACEHOLDER-interior",
        verified: false,
      },
      {
        id: "enclosure",
        label: "PLACEHOLDER-enclosure",
        title: "PLACEHOLDER-enclosure",
        text: "PLACEHOLDER-enclosure",
        verified: false,
      },
    ],
  };
}

export function visualizeSvgFixture() {
  return [
    '<svg viewBox="0 0 800 500">',
    '<g data-section="roof"></g>',
    '<g data-section="walls"></g>',
    '<g data-section="entrance"></g>',
    '<g data-section="interior"></g>',
    '<g data-section="enclosure"></g>',
    "</svg>",
  ].join("");
}
