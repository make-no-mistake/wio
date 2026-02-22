import { request } from "./request";

/**
 * Wio AI Client SDK
 *
 * Provides a simple interface to send prompts to the server-side LLM endpoint.
 *
 * Usage: wio.ask("Your question").then(console.log)
 *
 * @param text - The prompt text to send
 * @returns The generated response as a string
 */
export async function ask(text: string): Promise<string> {
  return request({ prompt: text });
}
