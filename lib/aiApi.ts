"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function expandContractions(text: string[], maxTokens = 300) {
  const completion = await openai.chat.completions.create({
    model: "deepseek-v3",
    temperature: 0,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'You are a helpful assistant that expands English contractions while ensuring grammatical correctness. When encountering possessive forms (e.g., George\'s), retain them as they are. Only expand standard contractions (e.g., "don\'t" to "do not"). Don\'t do anything else such as grammar correction or spell correction. Return Input if it is not a contraction.',
      },
      { role: "user", content: JSON.stringify(text) },
    ],
  });

  console.log("Input: ", text);
  console.log("Output: ", completion.choices[0].message.content!);

  return JSON.parse(completion.choices[0].message.content!);
}
