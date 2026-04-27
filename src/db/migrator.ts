import { migrationsRepository } from "@/repositories/migrations.repository";
import { Migration } from "./migrations";

class Migrator {
  constructor(private readonly logFn: (...args: unknown[]) => void) {}

  async run() {
    const current_version = await migrationsRepository.getCurrentVersion();
    const migrations = (await migrationsRepository.readMigrations())
      .filter((m) => m.isNewerThan(current_version))
      .sort((a, b) => a.compare(b));

    this.logSteps(current_version, migrations);

    for (const migration of migrations) {
      await migration.apply();
      await migrationsRepository.setCurrentVersion(migration.name);
      this.logFn({
        event: "database_migration_applied",
        migration_name: migration.name,
      });
    }
  }

  private logSteps(current_version: string, migrations: Migration[]) {
    this.logFn({
      event: "database_migration_starting",
      current_version: current_version,
    });

    if (migrations.length === 0) {
      this.logFn({
        event: "database_migration_no_migrations_to_apply",
      });
      return;
    }

    this.logFn({
      event: "database_migration_applying_migrations",
      migrations: migrations.map((m) => m.name),
    });
  }
}

export default function migrate(
  logFn: (...args: unknown[]) => void = console.log,
) {
  return new Migrator(logFn).run();
}
