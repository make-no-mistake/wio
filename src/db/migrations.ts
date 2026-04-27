export abstract class MigrationShape {
  abstract upgrade(): void;
}

export class Migration {
  constructor(
    public name: string,
    private path: string,
  ) {}

  isNewerThan(name: string): boolean {
    return this.name.localeCompare(name) > 0;
  }

  compare(other: Migration): number {
    return this.isNewerThan(other.name) ? 1 : -1;
  }

  async apply() {
    const module = await import(this.path);
    const migration_obj = new module.default();

    if (!(migration_obj instanceof MigrationShape)) {
      throw new Error(
        `Migration ${this.name} must implmenet the MigrationShape abstract class.`,
      );
    }

    await migration_obj.upgrade();
  }
}
