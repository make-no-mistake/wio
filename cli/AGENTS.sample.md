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
  example:
    const html = await wio.renderMarkdown("# Hello World")
    document.body.innerHTML = html

ask:
  description:
    Send a prompt to the WIO server LLM endpoint and receive a text response.
  signature:
    wio.ask(text: string) -> Promise<string>
  returns:
    The generated text response from the language model.
  example:
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

  methods:
    cookies.read:
      description:
        Read a cookie by name.
      signature:
        wio.cookies.read({ name: string }) -> Promise<{ value: string | null, error?: string }>
      usage:
        const result = await wio.cookies.read({ name: "user" })
        console.log(result.value)

    cookies.write:
      description:
        Write a cookie value by name.
      signature:
        wio.cookies.write({ name: string, value: string }) -> Promise<{ error?: string }>
      usage:
        await wio.cookies.write({ name: "user", value: "username" })

    cookies.delete:
      description:
        Delete a cookie by name.
      signature:
        wio.cookies.delete({ name: string }) -> Promise<{ error?: string }>
      usage:
        await wio.cookies.delete({ name: "user" })

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

  usage:
    const users = wio.useRelation("users")

    // Select rows
    const rows = await users
      .select(["id", "name"])
      .where({
        status: "active",
        or: [{ role: { eq: "admin" } }, { role: { eq: "owner" } }],
      })
      .orderBy("name", "asc")
      .limit(10)
      .offset(2)
      .execute()

    // Insert rows
    await users
      .insert([
        { name: "Alice" },
        { name: "Bob" }
      ])
      .execute()

    // Update rows
    await users
      .update([1, 2], [
        { name: "Alice Updated" },
        { name: "Bob Updated" }
      ])
      .execute()

    // Delete rows
    await users
      .delete([3, 4])
      .execute()

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
              .select(["id", "name"])
              .where({
                status: "active",
                or: [{ role: { eq: "admin" } }, { rank: { lte: 7 } }],
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
            Execute the insert query and return inserted rows.
          signature:
            insert.execute() -> Promise<object[]>
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
        Execute a built query and return the resulting rows.
      signature:
        clause.execute() -> Promise<object[]>

  casting_and_sorting:
    warning:
      Database reads from relations return values as strings (e.g., "100" instead of 100).
      This causes the `orderBy` method to perform string comparisons (e.g., "95" > "100").
    rule:
      Do not rely on `orderBy` for numeric sorting. Always fetch the results,
      cast the values to numbers (e.g., `Number(row.score)`), and sort them
      in JavaScript.
    example:
      const rows = await users.select("*").execute()
      const sorted = rows.sort((a, b) => Number(b.score) - Number(a.score))
