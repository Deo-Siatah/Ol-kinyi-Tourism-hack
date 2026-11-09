// Server handler that answers questions using only approved story text.

import storiesData from "../content/stories.json";
import { answerLocal, buildMessages, NOT_FOUND } from "../src/ask.js";

export async function handleAsk(body, { callGroq, stories }) {
  const question = body?.question;
  if (typeof question !== "string" || question.trim() === "") {
    return { status: 400, json: { error: "question must be a non-empty string" } };
  }

  const match = answerLocal(question, stories);
  if (match.storyId === null) {
    return { status: 200, json: { answer: NOT_FOUND, storyId: null } };
  }

  const story = stories.targets.find((target) => target.id === match.storyId);
  const messages = buildMessages(question, story);
  const answer = await callGroq(messages);

  return { status: 200, json: { answer, storyId: match.storyId } };
}

async function callGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set; cannot call Groq");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export default async function handler(req, res) {
  const { status, json } = await handleAsk(req.body, {
    callGroq,
    stories: storiesData,
  });
  res.status(status).json(json);
}
