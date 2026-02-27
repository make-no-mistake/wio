import type { MarkdownPayload, MarkdownResponse } from "./payload";

const MARKDOWN_ENDPOINT = "/markdown";
export async function request(payload: MarkdownPayload): Promise<string> {
  const res = await fetch(MARKDOWN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as MarkdownResponse;

  if (!res.ok) {
    const message = data.error ?? `Markdown request failed (${res.status})`;
    throw new Error(message);
  }

  return data.html;
}
