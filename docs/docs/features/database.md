---
sidebar_position: 6
title: Database
---

# Database

Wio provides a built-in database for every site. Each site has its own isolated data — records created by one site are not visible to any other. Data is stored as JSON documents in named relations (tables), and accessed through a chainable query builder in the SDK.

## Quick Start

```ts
import wio from "/wio.js";

const todos = wio.useRelation("todos");

// Insert a record
await todos.insert({ title: "Buy milk", done: false }).execute();

// Query all records
const all = await todos.select("*").execute();
console.log(all);
```

## Creating a Relation

Relations are created implicitly — the first time you insert data into a relation name, it exists. No schema definition or migration is required.

```ts
const posts = wio.useRelation("posts");
await posts.insert({ title: "First post", body: "Hello world" }).execute();
```

Each record is automatically assigned a numeric `id`.

## Select

Start a SELECT query with `.select()`. Pass `"*"` for all columns, or an array of column names.

```ts
const posts = wio.useRelation("posts");

const all = await posts.select("*").execute();
const titles = await posts.select(["title", "author"]).execute();
```

### `.where(conditions)`

Filter results using column conditions.

**Direct equality:**
```ts
await posts.select("*").where({ status: "published" }).execute();
```

**Comparison operators** (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`):
```ts
await posts.select("*").where({ age: { gte: 18 } }).execute();
await posts.select("*").where({ name: { like: "Al%" } }).execute();
```

**Logical combinators** (`and`, `or`, `not`):
```ts
await posts.select("*").where({
  or: [
    { role: "admin" },
    { role: "owner" }
  ]
}).execute();
```

### `.orderBy(column, order?)`

Sort results. Default order is `"asc"`.

```ts
await posts.select("*").orderBy("created_at", "desc").execute();
```

### `.limit(count)` / `.offset(count)`

Paginate results.

```ts
await posts.select("*").limit(10).offset(20).execute();
```

## Insert

Insert one or more records.

```ts
await posts.insert({ title: "Hello", body: "World" }).execute();

await posts.insert([
  { title: "Post 1" },
  { title: "Post 2" }
]).execute();
```

## Update

Update records by ID. Accepts a single ID or an array of IDs with matching data.

```ts
await posts.update(1, { title: "Updated Title" }).execute();

await posts.update([1, 2], [
  { title: "First Updated" },
  { title: "Second Updated" }
]).execute();
```

## Delete

Delete records by ID.

```ts
await posts.delete(5).execute();
await posts.delete([1, 2, 3]).execute();
```

## API Summary

| Method | Description |
|--------|-------------|
| `wio.useRelation(name)` | Create a query builder for a named relation |
| `.select(columns)` | Start a SELECT query (`"*"` or `string[]`) |
| `.where(conditions)` | Filter with equality, operators, and logical combinators |
| `.orderBy(column, order?)` | Sort results (`"asc"` or `"desc"`) |
| `.limit(count)` | Limit the number of returned rows |
| `.offset(count)` | Skip rows for pagination |
| `.insert(data)` | Insert one record or an array of records |
| `.update(id, data)` | Update one or more records by ID |
| `.delete(ids)` | Delete one or more records by ID |
| `.execute()` | Run the query and return a `Promise` |

## Where Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal | `{ age: { eq: 25 } }` |
| `neq` | Not equal | `{ status: { neq: "draft" } }` |
| `gt` | Greater than | `{ price: { gt: 100 } }` |
| `gte` | Greater than or equal | `{ age: { gte: 18 } }` |
| `lt` | Less than | `{ stock: { lt: 5 } }` |
| `lte` | Less than or equal | `{ rating: { lte: 3 } }` |
| `like` | Pattern match | `{ name: { like: "A%" } }` |

Logical combinators `and`, `or`, and `not` can be nested to build complex filters.

## Example: Todo App

```html
<input id="task" placeholder="New task..." />
<button id="add">Add</button>
<ul id="list"></ul>

<script type="module">
  import wio from "/wio.js";

  const todos = wio.useRelation("todos");

  async function render() {
    const items = await todos.select("*").orderBy("id", "desc").execute();
    const list = document.getElementById("list");
    list.innerHTML = "";
    for (const item of items) {
      const li = document.createElement("li");
      li.textContent = item.title;
      list.appendChild(li);
    }
  }

  document.getElementById("add").onclick = async () => {
    const input = document.getElementById("task");
    if (input.value.trim()) {
      await todos.insert({ title: input.value.trim(), done: false }).execute();
      input.value = "";
      await render();
    }
  };

  render();
</script>
```
