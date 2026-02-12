import { beforeAll, afterAll } from "bun:test";
import { initDatabase, clearDatabase } from "../src/db/schema";

beforeAll(async () => {
  await initDatabase();
});

afterAll(async () => {
  await clearDatabase();
});
