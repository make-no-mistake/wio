---
sidebar_position: 3
title: Markdown Renderer
---

# Markdown Renderer

Wio provides server-side markdown to HTML conversion via Bun's built-in markdown parser.

## SDK Usage

```ts
import wio from "/wio.js";

const html = await wio.renderMarkdown("# Hello World\n\nThis is **bold** text.");
document.getElementById("content").innerHTML = html;
```

### `wio.renderMarkdown(markdown)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `markdown` | `string` | Markdown text to render |

**Returns:** `Promise<string>` — The rendered HTML string.

Throws an `Error` if the server request fails.

## Supported Syntax

The renderer uses Bun's built-in markdown parser, which supports standard Markdown including:

- Headings (`#`, `##`, `###`, etc.)
- Bold, italic, strikethrough
- Links and images
- Ordered and unordered lists
- Code blocks with language annotation
- Blockquotes
- Tables
- Horizontal rules

## Code Blocks

Fenced code blocks include language-specific CSS classes for syntax highlighting:

````markdown
```javascript
console.log("hello");
```
````

Renders as:

```html
<pre><code class="language-javascript">console.log("hello");</code></pre>
```

You can use a client-side syntax highlighting library (like Prism or Highlight.js) to style these blocks.

## Example: Markdown Editor

```html
<textarea id="editor" placeholder="Write markdown..."></textarea>
<div id="preview"></div>

<script type="module">
  import wio from "/wio.js";

  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");

  editor.addEventListener("input", async () => {
    preview.innerHTML = await wio.renderMarkdown(editor.value);
  });
</script>
```
