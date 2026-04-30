import { ChatOpenAI } from "@langchain/openai";

export function createLLM() {
  const apiKey = process.env.OPEN_ROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPEN_ROUTER_API_KEY");
  }

  return new ChatOpenAI({
    apiKey,
    modelName: "nvidia/nemotron-3-super-120b-a12b:free",
    temperature: 0.3,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "AI App Builder",
      },
    },
  });
}