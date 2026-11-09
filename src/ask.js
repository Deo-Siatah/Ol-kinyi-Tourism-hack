// Local story matching, chat message building, and server-first ask with fallback.

export const NOT_FOUND = "That's not in our approved stories yet.";

function toWords(text) {
  return String(text).toLowerCase().match(/[a-z0-9']+/g) ?? [];
}

function storyText(story) {
  return [story.title, story.summary, ...story.details, story.folklore].join(" ");
}

export function answerLocal(question, stories) {
  const questionWords = toWords(question);
  let best = null;
  let bestScore = 0;

  for (const story of stories.targets) {
    const storyWords = new Set(toWords(storyText(story)));
    const score = questionWords.filter((word) => storyWords.has(word)).length;
    if (score > bestScore) {
      best = story;
      bestScore = score;
    }
  }

  if (!best) {
    return { text: NOT_FOUND, storyId: null, source: "local" };
  }

  return { text: best.summary, storyId: best.id, source: "local" };
}

export function buildMessages(question, story) {
  const approvedText = [
    `Title: ${story.title}`,
    `Summary: ${story.summary}`,
    `Details: ${story.details.join("; ")}`,
    `Folklore: ${story.folklore}`,
  ].join("\n");

  return [
    {
      role: "system",
      content:
        "Answer only from the approved story text below. " +
        `If the answer is not in it, reply exactly: "${NOT_FOUND}"\n\n` +
        approvedText,
    },
    { role: "user", content: question },
  ];
}

export async function ask(question, stories, { fetchFn }) {
  try {
    const response = await fetchFn("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      return answerLocal(question, stories);
    }

    const data = await response.json();
    return { text: data.answer, storyId: data.storyId, source: "groq" };
  } catch {
    return answerLocal(question, stories);
  }
}
