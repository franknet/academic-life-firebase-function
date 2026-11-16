import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config();

let openaiInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured in environment variables. Please provide it in .env or Firebase secrets."
      );
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export const OPENAI_DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
