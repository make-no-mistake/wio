import { SelectClause } from "./clauses/select";
import { InsertClause } from "./clauses/insert";
import { UpdateClause } from "./clauses/update";
import { DeleteClause } from "./clauses/delete";

export class Relation<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  protected _relationName: string;

  constructor(relationName: string) {
    this._relationName = relationName;
  }

  select(columns: string | string[]): SelectClause<T> {
    return new SelectClause<T>(this._relationName, columns);
  }

  insert(data: Partial<T> | Partial<T>[]): InsertClause<T> {
    return new InsertClause<T>(this._relationName, data);
  }

  update(
    id: number | number[],
    data: Partial<T> | Partial<T>[],
  ): UpdateClause<T> {
    return new UpdateClause<T>(this._relationName, id, data);
  }

  delete(ids: number | number[]): DeleteClause {
    return new DeleteClause(this._relationName, ids);
  }
}

export function useRelation<
  T extends Record<string, unknown> = Record<string, unknown>,
>(relationName: string): Relation<T> {
  return new Relation<T>(relationName);
}
