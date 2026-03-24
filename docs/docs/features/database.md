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

## The `id` Column

Every record is automatically assigned a numeric `id`. Unlike other fields you define, the `id` is a **top-level database column** and is not stored inside the JSON data.

### Querying by `id`
Because `id` is a real database column, you can query it directly in the `.where()` clause. The SDK optimizes these queries as primary key lookups.

```ts
// Fetch record with ID 5
const record = await posts.select("*").where({ id: { eq: 5 } }).execute();
```

### Selection and Merging
- When you use `select("*")`, the SDK automatically merges the `id` column into the resulting record object.
- When you select specific columns, you can include `"id"` in the array to receive it.

```ts
const rows = await posts.select(["id", "title"]).execute();
// Returns [{ id: 1, title: "..." }, ...]
```

## Select

Start a SELECT query with `.select()`. Pass `"*"` for all columns, or an array of column names.

```ts
const posts = wio.useRelation("posts");

const all = await posts.select("*").execute();
const titles = await posts.select(["id", "title", "author"]).execute();
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
await posts.select("*").where({ id: { lt: 50 } }).execute();
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

:::warning String vs Numeric Sorting
User-defined data is stored as JSON strings. The database performs string comparisons during `orderBy`. For example, a "95" score will appear *after* a "100" score when sorted ascending.

**To sort user data numerically:** Fetch all results, cast values using `Number()`, and sort them in JavaScript.

**Sorting by `id`** works correctly in the database as it is a native numeric column.
:::

```ts
await posts.select("*").orderBy("id", "desc").execute();
```

### `.limit(count)` / `.offset(count)`

Paginate results.

```ts
await posts.select("*").limit(10).offset(20).execute();
```

## Insert

Insert one or more records. Returns the inserted records (including their new IDs).

```ts
await posts.insert({ title: "Hello", body: "World" }).execute();

await posts.insert([
  { title: "Post 1" },
  { title: "Post 2" }
]).execute();
```

## Update

Update records by ID. Accepts a single ID or an array of IDs with matching data. Returns the updated records.

```ts
await posts.update(1, { title: "Updated Title" }).execute();

await posts.update([1, 2], [
  { title: "First Updated" },
  { title: "Second Updated" }
]).execute();
```

## Delete

Delete records by ID. Returns a result object indicating success and which IDs were removed.

```ts
const result = await posts.delete(5).execute();
// result = { success: true, deleted_ids: [5] }
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
    // Sort by id (numeric) works correctly in-database
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
