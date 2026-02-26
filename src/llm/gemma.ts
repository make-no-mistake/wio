import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY environment variable is required but not set.",
  );
}

const ai = new GoogleGenAI({ apiKey });

const MODEL = "gemma-3-27b-it";

export interface LLMResult {
  success: boolean;
  response?: string;
  error?: string;
  statusCode?: number;
}

export function llmFailureResult(
  error: string,
  statusCode: number = 500,
): LLMResult {
  return { success: false, error, statusCode };
}

export function llmSuccessResult(response: string): LLMResult {
  return { success: true, response };
}

/**
 * Sends a text prompt to the Gemini model and returns a structured result.
 *
 * @param prompt - The user's text prompt (must be non-empty, max 6767 chars)
 * @returns An LLMResult object containing either the response or an error
 */
export async function generateText(prompt: string): Promise<LLMResult> {
  if (!prompt || prompt.trim().length === 0) {
    return llmFailureResult("A non-empty 'prompt' string is required.", 400);
  }

  if (prompt.length > 6767) {
    return llmFailureResult("Prompt must not exceed 6767 characters.", 400);
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      return llmFailureResult("The model returned an empty response.");
    }

    return llmSuccessResult(text);
  } catch (error) {
    if (
      (error as { status?: number }).status === 503 ||
      String(error).includes("503") ||
      String(error).includes("UNAVAILABLE")
    ) {
      return llmFailureResult(
        "The AI model is currently experiencing high traffic. Please try again later.",
        503,
      );
    }
    return llmFailureResult("Failed to generate a response from the LLM.");
  }
}
