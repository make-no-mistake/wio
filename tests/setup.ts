import { beforeAll, afterAll } from "bun:test";
import migrate from "@/db/migrator";
import { seed, unseed } from "@/db/seeds";

beforeAll(async () => {
  await migrate();
  await seed();
});

afterAll(async () => {
  await unseed();
});
