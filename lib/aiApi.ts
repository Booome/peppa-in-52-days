"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function expandContractions(text: string[]) {
  const completion = await openai.chat.completions.create({
    model: "deepseek-v3",
    messages: [
      {
        role: "system",
        content:
          'You are a helpful assistant that expands English contractions while ensuring grammatical correctness. When encountering possessive forms (e.g., George\'s), retain them as they are and do not expand them. Only expand standard contractions (e.g., "don\'t" to "do not"). I will give you a stringifyed array of strings, and you will return a stringifyed array of strings only. no markdown, no code block, no other text.',
      },
      { role: "user", content: JSON.stringify(text) },
    ],
  });

  return JSON.parse(completion.choices[0].message.content!);
}
