import { request } from "./request";

/**
 * Wio Markdown Client SDK
 *
 * Provides a simple interface to render markdown to HTML on the server.
 *
 * Usage: wio.renderMarkdown("# Hello")
 *
 * @param markdown - The markdown text to render
 * @param endpoint - Optional endpoint override
 * @returns The rendered HTML as a string
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  return request({ markdown });
}
