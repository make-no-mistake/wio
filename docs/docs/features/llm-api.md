---
sidebar_position: 5
title: LLM API
---

# LLM API

Wio provides a built-in AI text generation endpoint powered by Google's Gemma 3 (27B) model. Your app can send prompts and receive generated text without managing API keys or server infrastructure.

## SDK Usage

```ts
import wio from "/wio.js";

const response = await wio.ask("Explain photosynthesis in two sentences.");
console.log(response);
```

### `wio.ask(text)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | `string` | The prompt to send (max 6,767 characters) |

**Returns:** `Promise<string>` — The generated text response.

Throws an `Error` if:
- The prompt is empty
- The prompt exceeds 6,767 characters
- The model is unavailable (503)
- The model returns an empty response

## Model

The current model is **Gemma 3 27B IT** (`gemma-3-27b-it`), served via the Google Gen AI API. The model selection is managed server-side — client apps don't need to specify or configure it.

## Limitations

- **Prompt length:** Maximum 6,767 characters
- **Rate limiting:** The model may return a 503 error during high traffic periods
- **No conversation history:** Each call is stateless; there is no built-in chat memory
- **Text only:** The API accepts and returns plain text

## Example: Q&A Interface

```html
<input id="prompt" placeholder="Ask anything..." />
<button id="ask-btn">Ask</button>
<p id="response"></p>

<script type="module">
  import wio from "/wio.js";

  document.getElementById("ask-btn").onclick = async () => {
    const prompt = document.getElementById("prompt").value;
    try {
      const answer = await wio.ask(prompt);
      document.getElementById("response").textContent = answer;
    } catch (err) {
      document.getElementById("response").textContent = "Error: " + err.message;
    }
  };
</script>
```
