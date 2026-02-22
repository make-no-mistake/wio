import type { PromptPayload, PromptResponse } from "./payload";

const LLM_PROMPT_ENDPOINT = "/llm/prompt";

export async function request(payload: PromptPayload): Promise<string> {
  const res = await fetch(LLM_PROMPT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as Record<
      string,
      string
    > | null;
    const message = body?.error ?? `LLM request failed (${res.status})`;
    throw new Error(message);
  }

  const data = (await res.json()) as PromptResponse;
  return data.response;
}
