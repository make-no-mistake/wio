---
sidebar_position: 1
title: Websockets
---

# WebSockets

Wio provides real-time communication between all visitors of a site via Socket.IO. Each site has an isolated room — events emitted by one user are broadcast to all other connected users.

## Quick Start

```ts
import wio from "/wio.js";

wio.ws.onConnect(() => {
  console.log("Connected!");
});

wio.ws.on("chat", (data) => {
  console.log("Received:", data);
});

document.getElementById("send").onclick = () => {
  wio.ws.emit("chat", { message: "Hello everyone!" });
};
```

## How Rooms Work

When a user visits `my-site.wio.onl`, the SDK automatically opens a Socket.IO connection. The server extracts the site name from the subdomain and places the socket into a room named `site:my-site`.

- Events are broadcast to all sockets in the room **except the sender** (no echo).
- When a user joins, all others receive a `user-joined` event with the current connected count.
- When a user leaves, all others receive a `user-left` event.

## Listening for Events

```ts
wio.ws.on("event-name", (data) => {
  // handle incoming data from other users
});
```

Remove a listener:

```ts
const handler = (data) => console.log(data);
wio.ws.on("event-name", handler);
wio.ws.off("event-name", handler);
```

## Emitting Events

```ts
wio.ws.emit("event-name", { key: "value" });
```

The data can be any serializable value.

## Connection Lifecycle Events

| Method | Fires when |
|--------|-----------|
| `wio.ws.onConnect(fn)` | WebSocket connection is established |
| `wio.ws.onDisconnect(fn)` | Connection is lost |
| `wio.ws.onReconnect(fn)` | Successfully reconnected after a drop |
| `wio.ws.onError(fn)` | A connection error occurs |

```ts
wio.ws.onConnect((data) => {
  console.log("Socket ID:", data.socketId);
});

wio.ws.onDisconnect((data) => {
  console.log("Reason:", data.reason);
});
```

## Built-in Events

These events are emitted automatically by the server:

| Event | Data | Description |
|-------|------|-------------|
| `user-joined` | `{ connectedCount, socketId }` | A new user connected to the room |
| `user-left` | `{ connectedCount, socketId }` | A user disconnected from the room |

## Properties

```ts
wio.ws.id        // Current socket ID (string | undefined)
wio.ws.connected // Whether connected (boolean)
```

## Example: Real-Time Chat

```html
<ul id="messages"></ul>
<input id="msg" placeholder="Type a message..." />
<button id="send">Send</button>

<script type="module">
  import wio from "/wio.js";

  wio.ws.on("chat", (data) => {
    const li = document.createElement("li");
    li.textContent = data.message;
    document.getElementById("messages").appendChild(li);
  });

  document.getElementById("send").onclick = () => {
    const input = document.getElementById("msg");
    wio.ws.emit("chat", { message: input.value });
    input.value = "";
  };
</script>
```
