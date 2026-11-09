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
      },
    ],
    before: {
      greetings: [{ maa: "maa", english: "english" }],
      etiquette: ["etiquette"],
    },
  };
}
