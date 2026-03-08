import { sql } from "bun";
import { parseArgs } from "util";

async function simulate() {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      tag: { type: "string", default: "5771406651824817" },
      domain: { type: "string", default: "wio.onl" },
      logs: { type: "string", default: "5000" },
    },
    strict: false,
    allowPositionals: true,
  });

  const userTag = values.tag as string;
  const baseDomain = values.domain as string;
  const totalLogs = parseInt(values.logs as string, 10);

  console.log(`Starting simulation for user: ${userTag}`);
  console.log(`Targeting base domain: ${baseDomain}`);
  console.log(`Generating ${totalLogs} events...`);

  // Find or create the user
  let userResult = await sql`SELECT id FROM users WHERE tag = ${userTag}`;
  if (userResult.length === 0) {
    console.log(`User with tag ${userTag} not found. Creating...`);
    userResult =
      await sql`INSERT INTO users (tag) VALUES (${userTag}) RETURNING id`;
  }
  const userId = userResult[0].id;
  console.log(`Using user ID: ${userId}`);

  // Create sites
  const siteNames = ["ecommerce-demo", "chat-app", "landing-page"];
  const siteIds: number[] = [];

  for (const name of siteNames) {
    let siteResult = await sql`SELECT id FROM sites WHERE name = ${name}`;
    if (siteResult.length === 0) {
      siteResult =
        await sql`INSERT INTO sites (name, owner_id) VALUES (${name}, ${userId}) RETURNING id`;
    }
    siteIds.push(siteResult[0].id);
    console.log(`Site ${name} (ID: ${siteResult[0].id}) ready.`);
  }

  // Generate logs over the past 30 days
  const now = new Date();
  const logsToInsert = [];

  for (let i = 0; i < totalLogs; i++) {
    const siteIndex = Math.floor(Math.random() * siteIds.length);
    const siteId = siteIds[siteIndex];
    const siteName = siteNames[siteIndex];
    const host = `${siteName}.${baseDomain}`;

    const daysAgo = Math.random() * 30; // 0 to 30 days ago
    const logTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const reqId = `req-sim-${Math.floor(Math.random() * 1000000)}`;

    // Choose an event type based on weight
    const rand = Math.random();

    if (rand < 0.6) {
      // 60% standard HTTP request
      const paths = [
        "/",
        "/api/users",
        "/static/app.js",
        "/favicon.ico",
        "/login",
        "/dashboard",
        "/products",
        "/images/logo.png",
      ];
      const url = paths[Math.floor(Math.random() * paths.length)];
      const responseTime = Math.random() * 100 + 10;
      let statusCode = 200;
      if (Math.random() > 0.9) statusCode = 404;
      if (Math.random() > 0.98) statusCode = 500;
      if (Math.random() > 0.95) statusCode = 301;

      const reqContent = {
        reqId,
        siteId,
        req: { method: "GET", url, host, remoteAddress: "178.128.69.202" },
      };

      const resContent = {
        reqId,
        siteId,
        res: { statusCode },
        responseTime,
      };

      logsToInsert.push({
        time: logTime.toISOString(),
        pid: 1,
        level: 30,
        hostname: "prod-server-1",
        msg: "incoming request",
        content: JSON.stringify(reqContent),
      });

      logsToInsert.push({
        time: new Date(logTime.getTime() + responseTime).toISOString(),
        pid: 1,
        level: 30,
        hostname: "prod-server-1",
        msg: "request completed",
        content: JSON.stringify(resContent),
      });
    } else if (rand < 0.85) {
      // 25% WebSocket interaction
      const wsSessionId = `ws-sim-${Math.floor(Math.random() * 1000000)}`;

      logsToInsert.push({
        time: logTime.toISOString(),
        pid: 1,
        level: 30,
        hostname: "prod-server-1",
        msg: null,
        content: JSON.stringify({
          event: "ws_connect",
          siteId,
          socketId: wsSessionId,
        }),
      });

      const messageCount = Math.floor(Math.random() * 5) + 1;
      let msgTime = logTime.getTime();
      for (let m = 0; m < messageCount; m++) {
        msgTime += Math.random() * 5000 + 500; // msgs arrive over time
        logsToInsert.push({
          time: new Date(msgTime).toISOString(),
          pid: 1,
          level: 30,
          hostname: "prod-server-1",
          msg: null,
          content: JSON.stringify({
            event: "ws_message",
            siteId,
            socketId: wsSessionId,
            wsEvent: "chat-message",
            data: { text: "Hello!" },
          }),
        });
      }

      msgTime += Math.random() * 20000 + 5000;
      logsToInsert.push({
        time: new Date(msgTime).toISOString(),
        pid: 1,
        level: 30,
        hostname: "prod-server-1",
        msg: null,
        content: JSON.stringify({
          event: "ws_disconnect",
          siteId,
          socketId: wsSessionId,
        }),
      });
    } else {
      // 15% AI Prompt
      const prompts = [
        "Generate a polite greeting",
        "Summarize this text",
        "Create a hero component",
        "Translate to French",
        "Write a sorting algorithm in Python",
      ];
      const prompt = prompts[Math.floor(Math.random() * prompts.length)];
      const isError = Math.random() > 0.85;

      const aiContent: {
        event: string;
        siteId: number;
        promptLength: number;
        success: boolean;
        error?: string;
      } = {
        event: "ai_prompt",
        siteId,
        promptLength: prompt?.length ?? 0,
        success: !isError,
      };

      if (isError) {
        aiContent.error = "Model overloaded";
      }

      logsToInsert.push({
        time: logTime.toISOString(),
        pid: 1,
        level: 30,
        hostname: "prod-server-1",
        msg: null,
        content: JSON.stringify(aiContent),
      });
    }
  }

  console.log(
    `Inserting ${logsToInsert.length} log records into the database...`,
  );

  // Insert in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < logsToInsert.length; i += batchSize) {
    const batch = logsToInsert.slice(i, i + batchSize);

    for (const log of batch) {
      await sql`
         INSERT INTO logs (time, pid, level, hostname, msg, content)
         VALUES (${log.time}, ${log.pid}, ${log.level}, ${log.hostname}, ${log.msg}, ${log.content})
       `;
    }
    process.stdout.write(
      `\rInserted ${Math.min(i + batchSize, logsToInsert.length)} / ${logsToInsert.length}`,
    );
  }

  console.log("\nSimulation complete! Data is ready for production viewing.");
  process.exit(0);
}

simulate().catch((err) => {
  console.error(err);
  process.exit(1);
});
