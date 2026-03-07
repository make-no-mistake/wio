import build from "pino-abstract-transport";
import { sql } from "bun";

export default function () {
  return build(
    async function (source) {
      for await (const obj of source) {
        if (!obj) continue;

        type PinoLog = {
          time: number;
          pid: number;
          level: number;
          hostname: string;
          msg: string;
          req?: unknown;
          [key: string]: unknown;
        };

        try {
          const { time, pid, level, hostname, msg, req, ...rest } =
            obj as PinoLog;

          const finalRest = { ...rest };
          if (req) {
            finalRest.req = req;
          }

          await sql`
            INSERT INTO logs (
              time, pid, level, hostname, msg, content
            )
            VALUES (
              to_timestamp(${Math.floor(time / 1000)}), 
              ${pid}, 
              ${level}, 
              ${hostname}, 
              ${msg}, 
              ${JSON.stringify(finalRest)}
            )
          `;
        } catch (err) {
          console.error("pino-db-transport failed to insert log:", err);
        }
      }
    },
    {
      async close() {
        // Bun sql handles termination automatically
      },
    },
  );
}
