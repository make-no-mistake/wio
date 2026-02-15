import type { SelectPayload, WhereClause, JsonValue } from "../payload";
import { Clause } from "./base";

export class SelectClause<T = JsonValue> extends Clause<T[]> {
  private _payload: SelectPayload;

  constructor(relationName: string, selectColumns: string | string[]) {
    super(relationName);
    this._payload = {
      select: Array.isArray(selectColumns) ? selectColumns : [selectColumns],
    };
  }

  where(conditions: WhereClause<T>): SelectClause<T> {
    this._payload.where = conditions;
    return this;
  }

  orderBy(column: string, order: "asc" | "desc" = "asc"): SelectClause<T> {
    this._payload.order_by = [{ column, order }];
    return this;
  }

  limit(count: number): SelectClause<T> {
    this._payload.limit = count;
    return this;
  }

  offset(count: number): SelectClause<T> {
    this._payload.offset = count;
    return this;
  }

  payload(): SelectPayload {
    return this._payload;
  }
}
