import { Migration } from "@/db/migrations";
import { sql } from "bun";
import { readdir } from "node:fs/promises";

class MigrationsRepository {
  migrationsDirectory(): string {
    return `${import.meta.dir}/../db/migrations`;
  }

  async readMigrations(): Promise<Migration[]> {
    return (await readdir(this.migrationsDirectory()))
      .filter((filename) => filename.endsWith(".ts"))
      .map(
        (filename) =>
          new Migration(filename, `${this.migrationsDirectory()}/${filename}`),
      );
  }

  private async initMigrationTable() {
    await sql`CREATE TABLE IF NOT EXISTS migration (version TEXT PRIMARY KEY);`;
    await sql`INSERT INTO migration (version) SELECT '000' WHERE NOT EXISTS (SELECT 1 FROM migration);`;
  }

  async getCurrentVersion(): Promise<string> {
    await this.initMigrationTable();
    const [version] = await sql<
      { version: string }[]
    >`SELECT version FROM migration`;
    if (!version) throw new Error("Migration table is empty");
    return version.version;
  }

  async setCurrentVersion(version: string) {
    await this.initMigrationTable();
    await sql`UPDATE migration SET version = ${version}`;
  }
}

export const migrationsRepository = new MigrationsRepository();
