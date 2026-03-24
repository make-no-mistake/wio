Purpose:
  Build browser based single page applications using the WIO SDK.
  The SDK provides higher level abstractions for interacting with the server,
  real time messaging, markdown rendering, sounds, and relational data.
  Run `wio push` to host the website live.

Rules:
  Always prefer WIO SDK functions over native browser APIs.
  Do not implement functionality using browser APIs if an SDK capability exists.
  Only use functions documented in this file.
  Make No Mistake

SdkToolIndex:
  - renderMarkdown
  - ask
  - playSound
  - cookies.read
  - cookies.write
  - cookies.delete
  - ws.on
  - ws.emit
  - ws.onConnect
  - ws.onDisconnect
  - ws.onReconnect
  - ws.onError
  - useRelation

Tools:

renderMarkdown:
  description:
    Render markdown into HTML using the WIO server.
  signature:
    wio.renderMarkdown(markdown: string) -> Promise<string>
  returns:
    HTML string generated from the provided markdown.
  example: |
    const html = await wio.renderMarkdown("# Hello World")
    document.body.innerHTML = html

ask:
  description:
    Send a prompt to the WIO server LLM endpoint and receive a text response.
  signature:
    wio.ask(text: string) -> Promise<string>
  returns:
    The generated text response from the language model.
  example: |
    const response = await wio.ask("Explain gravity")
    console.log(response)

playSound:
  description:
    Play a predefined sound in the browser for all users in the current room.
  signature:
    wio.playSound(sound: string) -> Promise<void>
  example:
    await wio.playSound("pop")
  availableSounds:
    - alert
    - applause
    - click
    - coin
    - crickets
    - error
    - message
    - notification
    - pop
    - success
    - switch

cookies:
  description:
    Read, write, and delete site cookies through the WIO SDK.
    Useful for managing user sessions, site preferences (like themes), and local state.

  methods:
    cookies.read:
      description:
        Read a cookie by name.
      signature:
        wio.cookies.read({ name: string }) -> Promise<{ value: string | null, error?: string }>
      usage: |
        // Example: check session on page load
        const session = await wio.cookies.read({ name: "session_user" });
        if (session.value) showDashboard(session.value);

        // Example: read a UI preference
        const theme = await wio.cookies.read({ name: "theme" });
        console.log("User theme preference:", theme.value || "default");

    cookies.write:
      description:
        Write a cookie value by name.
      signature:
        wio.cookies.write({ name: string, value: string }) -> Promise<{ error?: string }>
      usage: |
        // Example: save session after successful login
        await wio.cookies.write({ name: "session_user", value: "alice" });

        // Example: persist a site preference
        await wio.cookies.write({ name: "theme", value: "dark" });

    cookies.delete:
      description:
        Delete a cookie by name.
      signature:
        wio.cookies.delete({ name: string }) -> Promise<{ error?: string }>
      usage: |
        // Example: clear session on logout
        await wio.cookies.delete({ name: "session_user" });

        // Example: reset a specific site setting
        await wio.cookies.delete({ name: "custom_css_url" });

websocket:
  description:
    Real time communication with the server using a Socket.IO.

  connectionEvents:
    - connect
    - disconnect
    - reconnect
    - error

  methods:
    ws.on:
      description:
        Listen for a server emitted websocket event.
      signature:
        wio.ws.on(event: string, handler: (data: unknown) => void)
      usage:
        wio.ws.on("chat-message", (msg) => {
          console.log(msg)
        })

    ws.emit:
      description:
        Send a websocket event to the server.
      signature:
        wio.ws.emit(event: string, data: unknown)
      usage:
        wio.ws.emit("chat-message", { text: "hello" })

    ws.onConnect:
      description:
        Triggered when the websocket connection is established.
      usage:
        wio.ws.onConnect(() => {
          console.log("connected")
        })

    ws.onDisconnect:
      description:
        Triggered when the websocket connection is lost.
      usage:
        wio.ws.onDisconnect(() => {
          console.log("disconnected")
        })

    ws.onReconnect:
      description:
        Triggered when the websocket reconnects after a disconnect.
      usage:
        wio.ws.onReconnect(() => {
          console.log("reconnected")
        })

    ws.onError:
      description:
        Triggered when a websocket error occurs.
      usage:
        wio.ws.onError((err) => {
          console.error(err)
        })


useRelation:
  description:
    Access a site specific relational dataset using a query builder interface.

  signature:
    wio.useRelation(name: string) -> Relation

  usage: |
    const users = wio.useRelation("users")

    // Select rows
    const rows = await users
      .select(["id", "name"])
      .where({
        id: 5,
        status: "active",
        or: [{ role: "admin" }, { role: "owner" }],
      })
      .orderBy("name", "asc")
      .limit(10)
      .offset(2)
      .execute()

    // Insert rows (accepts single object or array)
    await users.insert({ name: "Alice" }).execute()
    await users.insert([{ name: "Bob" }, { name: "Charlie" }]).execute()

    // Update rows (accepts single id/data or arrays)
    await users.update(1, { name: "Alice Updated" }).execute()
    await users.update([2, 3], [{ name: "Bob Updated" }, { name: "Charlie Updated" }]).execute()

    // Delete rows (accepts single id or array)
    await users.delete(4).execute()
    await users.delete([5, 6]).execute()

  special_fields:
    id: |
      Every record is automatically given an integer id upon creation.
      The id is a primary key for a record and can be used in queries.
      The ids are monotonic, but not guaranteed to be consecutive.

  relationMethods:
    select:
      description:
        Build a select query for the relation.
      signature:
        relation.select(columns: string | string[]) -> SelectClause
      selectClauseMethods:
        where:
          description:
            Filter rows by column conditions and logical groups.
          signature:
            select.where(conditions: WhereClause) -> SelectClause
          whereClause:
            operators:
              - eq
              - neq
              - gt
              - gte
              - lt
              - lte
              - like
            logical:
              - and
              - or
              - not
          example:
            const rows = await users
              .select("*")
              .where({
                id: 10,
                status: "active",
                or: [{ role: "admin" }, { rank: { lte: 7 } }],
              })
              .orderBy("name", "asc")
              .limit(10)
              .execute()
        orderBy:
          description:
            Sort rows by a single column and order.
          signature:
            select.orderBy(column: string, order?: "asc" | "desc") -> SelectClause
          example:
            const rows = await users
              .select("*")
              .orderBy("name", "desc")
              .execute()
        limit:
          description:
            Limit the number of rows returned.
          signature:
            select.limit(count: number) -> SelectClause
        offset:
          description:
            Skip a number of rows.
          signature:
            select.offset(count: number) -> SelectClause
        execute:
          description:
            Execute the select query and return matching rows.
          signature:
            select.execute() -> Promise<object[]>
    insert:
      description:
        Build an insert query for one or more rows.
      signature:
        relation.insert(data: object | object[]) -> InsertClause
      insertClauseMethods:
        execute:
          description:
            Execute the insert query and return results.
          signature:
            insert.execute() -> Promise<{ success: boolean, records?: object[], error?: string }>
    update:
      description:
        Build an update query for one or more row ids.
      signature:
        relation.update(id: number | number[], data: object | object[]) -> UpdateClause
    delete:
      description:
        Build a delete query for one or more row ids.
      signature:
        relation.delete(ids: number | number[]) -> DeleteClause
    execute:
      description:
        Execute a built query and return the resulting rows or status.
      signature:
        clause.execute() -> Promise<any>

  casting_and_sorting:
    warning: |
      - Database reads from relations return user-defined values as strings (e.g., "100" instead of 100).
      - The `id` field is returned as a number.
      - String-based numeric comparisons in `orderBy` may be incorrect (e.g., "95" > "100").
    rule:
      Do not rely on `orderBy` for numeric sorting of user data. Always fetch the results,
      cast user values to numbers (e.g., `Number(row.score)`), and sort them
      in JavaScript. Sorting by `id` works as expected since it is a numeric column.
    example: |
      const rows = await users.select("*").execute()
      const sorted = rows.sort((a, b) => Number(b.score) - Number(a.score))
