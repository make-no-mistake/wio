import { describe, expect, test, beforeEach, mock } from "bun:test";
import { Migration, MigrationShape } from "@/db/migrations";
import { migrationsRepository } from "@/repositories/migrations.repository";
import { sql } from "bun";

describe("Migration", () => {
  describe("isNewerThan", () => {
    test("returns true when migration name sorts after the given name", () => {
      const migration = new Migration("002_add_users.ts", "/fake/path");
      expect(migration.isNewerThan("001_base.ts")).toBe(true);
    });

    test("returns false when migration name sorts before the given name", () => {
      const migration = new Migration("001_base.ts", "/fake/path");
      expect(migration.isNewerThan("002_add_users.ts")).toBe(false);
    });

    test("returns false when names are equal", () => {
      const migration = new Migration("001_base.ts", "/fake/path");
      expect(migration.isNewerThan("001_base.ts")).toBe(false);
    });
  });

  describe("compare", () => {
    test("returns positive when this migration sorts after other", () => {
      const a = new Migration("002_add_users.ts", "/fake/path");
      const b = new Migration("001_base.ts", "/fake/path");
      expect(a.compare(b)).toBeGreaterThan(0);
    });

    test("returns negative when this migration sorts before other", () => {
      const a = new Migration("001_base.ts", "/fake/path");
      const b = new Migration("002_add_users.ts", "/fake/path");
      expect(a.compare(b)).toBeLessThan(0);
    });
  });

  describe("apply", () => {
    test("calls the default export of the migration module", async () => {
      class TestMigration extends MigrationShape {
        async upgrade() {
          (globalThis as Record<string, unknown>).__migrationApplied = true;
        }
      }

      const fakePath = "/fake/test_migration.ts";
      mock.module(fakePath, () => ({ default: TestMigration }));

      const migration = new Migration("test_migration.ts", fakePath);
      await migration.apply();

      expect((globalThis as Record<string, unknown>).__migrationApplied).toBe(
        true,
      );
      delete (globalThis as Record<string, unknown>).__migrationApplied;
    });

    test("throws when module does not export a MigrationShape subclass", async () => {
      class Bad {}

      const fakePath = "/fake/bad_migration.ts";
      mock.module(fakePath, () => ({ default: Bad }));

      const migration = new Migration("bad_migration.ts", fakePath);

      await expect(migration.apply()).rejects.toThrow(
        "must implmenet the MigrationShape abstract class",
      );
    });
  });
});

describe("MigrationsRepository", () => {
  describe("readMigrations", () => {
    test("returns Migration instances for .ts files in the migrations directory", async () => {
      const migrations = await migrationsRepository.readMigrations();

      expect(migrations.length).toBeGreaterThan(0);
      expect(migrations[0]).toBeInstanceOf(Migration);
      expect(migrations.some((m) => m.name === "001_base.ts")).toBe(true);
    });

    test("all returned migrations have .ts extension", async () => {
      const migrations = await migrationsRepository.readMigrations();

      for (const m of migrations) {
        expect(m.name.endsWith(".ts")).toBe(true);
      }
    });
  });

  describe("getCurrentVersion / setCurrentVersion", () => {
    beforeEach(async () => {
      await sql`DELETE FROM migration`;
      await sql`INSERT INTO migration (version) VALUES ('000')`;
    });

    test("returns the initial version", async () => {
      const version = await migrationsRepository.getCurrentVersion();
      expect(version).toBe("000");
    });

    test("updates and retrieves the current version", async () => {
      await migrationsRepository.setCurrentVersion("001_base.ts");
      const version = await migrationsRepository.getCurrentVersion();
      expect(version).toBe("001_base.ts");
    });
  });
});

describe("migrate", () => {
  beforeEach(async () => {
    await sql`DELETE FROM migration`;
    await sql`INSERT INTO migration (version) VALUES ('000')`;
  });

  test("applies pending migrations and updates version", async () => {
    const { default: migrate } = await import("@/db/migrator");
    const logFn = mock(() => {});

    await migrate(logFn);

    const version = await migrationsRepository.getCurrentVersion();
    expect(version).not.toBe("000");

    const calls = logFn.mock.calls.flat();
    expect(
      calls.some(
        (c: unknown) =>
          typeof c === "object" &&
          c !== null &&
          (c as Record<string, unknown>).event ===
            "database_migration_starting",
      ),
    ).toBe(true);
  });

  test("logs no-op when already up to date", async () => {
    const { default: migrate } = await import("@/db/migrator");
    const logFn = mock(() => {});

    // Run once to get up to date
    await migrate(logFn);

    // Run again — should be a no-op
    const logFn2 = mock(() => {});
    await migrate(logFn2);

    const calls = logFn2.mock.calls.flat();
    expect(
      calls.some(
        (c: unknown) =>
          typeof c === "object" &&
          c !== null &&
          (c as Record<string, unknown>).event ===
            "database_migration_no_migrations_to_apply",
      ),
    ).toBe(true);
  });
});
