---
sidebar_position: 4
title: SDK
---

# SDK Reference

The Wio SDK is a client-side JavaScript module that provides access to all Wio platform services. It is served automatically at `/wio.js` for every deployed site.

```html
<script type="module">
  import wio from "/wio.js";
</script>
```

## API Overview

| Property / Method | Type | Description |
|---|---|---|
| `wio.useRelation(name)` | `(string) => Relation` | Access a database relation |
| `wio.ask(text)` | `(string) => Promise<string>` | Send a prompt to the LLM |
| `wio.ws` | `WioWebSocket` | WebSocket client instance |
| `wio.renderMarkdown(md)` | `(string) => Promise<string>` | Render markdown to HTML |
| `wio.playSound(sound)` | `(string) => Promise<void>` | Play a sound for all users |
| `wio.openModal(id)` | `(string) => void` | Open a `<wio-modal>` by ID |

---

## Database — `wio.useRelation()`

Creates a query builder for a named relation (table). Each site has its own isolated data namespace.

```ts
const posts = wio.useRelation("posts");
```

See the [Database feature guide](/docs/features/database) for full details.

### `relation.select(columns)`

Starts a SELECT query. Pass `"*"` for all columns, or an array of column names.

```ts
const rows = await posts.select("*").execute();
const names = await posts.select(["title", "author"]).execute();
```

Returns a `SelectClause` with chainable methods:

#### `.where(conditions)`

Filter results using column conditions and logical operators.

**Direct equality:**
```ts
.where({ status: "published" })
```

**Comparison operators** (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`):
```ts
.where({ age: { gte: 18 } })
.where({ name: { like: "Al%" } })
```

**Logical combinators** (`and`, `or`, `not`):
```ts
.where({
  status: "active",
  or: [
    { role: { eq: "admin" } },
    { role: { eq: "owner" } }
  ]
})
```

#### `.orderBy(column, order?)`

Sort results. Default order is `"asc"`.

```ts
.orderBy("created_at", "desc")
```

#### `.limit(count)` / `.offset(count)`

Paginate results.

```ts
.limit(10).offset(20)
```

#### `.execute()`

Runs the query and returns a `Promise<object[]>`.

### `relation.insert(data)`

Insert one or more records.

```ts
await posts.insert({ title: "Hello", body: "World" }).execute();
await posts.insert([
  { title: "Post 1" },
  { title: "Post 2" }
]).execute();
```

### `relation.update(id, data)`

Update records by ID. Accepts a single ID or array of IDs, and matching data.

```ts
await posts.update(1, { title: "Updated" }).execute();
await posts.update([1, 2], [
  { title: "First Updated" },
  { title: "Second Updated" }
]).execute();
```

### `relation.delete(ids)`

Delete records by ID.

```ts
await posts.delete(5).execute();
await posts.delete([1, 2, 3]).execute();
```

---

## AI — `wio.ask()`

Send a text prompt to the server-side LLM and receive a text response.

```ts
const answer = await wio.ask("Explain gravity in one sentence");
console.log(answer);
```

**Parameters:**
- `text` (`string`) — The prompt to send (max 6,767 characters)

**Returns:** `Promise<string>` — The generated response

Throws an `Error` if the request fails or the model is unavailable.

---

## WebSockets — `wio.ws`

A Socket.IO client that automatically connects to the site's room. All visitors to the same site share a room — events emitted by one user are broadcast to all others (excluding the sender).

### `wio.ws.on(event, handler)`

Listen for custom events from other users.

```ts
wio.ws.on("chat-message", (data) => {
  console.log(data);
});
```

### `wio.ws.off(event, handler)`

Remove an event handler.

### `wio.ws.emit(event, data)`

Send an event to all other users in the room.

```ts
wio.ws.emit("chat-message", { text: "hello" });
```

### Connection Lifecycle

```ts
wio.ws.onConnect((data) => {
  console.log("Connected:", data.socketId);
});

wio.ws.onDisconnect((data) => {
  console.log("Disconnected:", data.reason);
});

wio.ws.onReconnect((data) => {
  console.log("Reconnected after", data.attempt, "attempts");
});

wio.ws.onError((data) => {
  console.error("Error:", data.message);
});
```

### Built-in Events

| Event | Direction | Data |
|-------|-----------|------|
| `user-joined` | Received | `{ connectedCount, socketId }` |
| `user-left` | Received | `{ connectedCount, socketId }` |
| `play-sound` | Received | Sound file path (auto-played) |

### Properties

- `wio.ws.id` — Current socket ID (`string | undefined`)
- `wio.ws.connected` — Whether the socket is connected (`boolean`)

### `wio.ws.disconnect()`

Manually disconnect from the server.

---

## Markdown — `wio.renderMarkdown()`

Render a markdown string to HTML using the server-side renderer (Bun's built-in markdown parser).

```ts
const html = await wio.renderMarkdown("# Hello\n\nThis is **bold**.");
document.body.innerHTML = html;
```

**Parameters:**
- `markdown` (`string`) — Markdown text to render

**Returns:** `Promise<string>` — The rendered HTML

Code blocks include language-specific CSS classes (`language-js`, etc.) for syntax highlighting.

---

## Sound Player — `wio.playSound()`

Play a sound effect for **all connected users** in the current site room.

```ts
await wio.playSound("pop");
```

**Available sounds:** `pop`, `fart`

The sound is broadcast via WebSockets, so every visitor hears it simultaneously.

---

## Web Components

The SDK registers two custom HTML elements.

### `<wio-button>`

A styled button with optional modal integration.

```html
<wio-button>Click me</wio-button>
<wio-button modal="my-modal">Open Modal</wio-button>
```

**Attributes:**
- `modal` — ID of a `<wio-modal>` to open on click

Style the inner button via the `::part(button)` CSS selector.

### `<wio-modal>`

A modal dialog with overlay, close-on-escape, and close-on-backdrop-click.

```html
<wio-modal id="my-modal">
  <h2>Modal Content</h2>
  <p>This is inside the modal.</p>
</wio-modal>
```

**Attributes:**
- `open` — When present, the modal is visible

**Events:**
- `wio-modal-open` — Dispatched when the modal opens
- `wio-modal-close` — Dispatched when the modal closes

**Programmatic control:**

```ts
wio.openModal("my-modal");
```

Style via `::part(overlay)` and `::part(modal)` CSS selectors.

---

## Additional SDK Features

This section is intentionally left blank for future SDK documentation updates.
