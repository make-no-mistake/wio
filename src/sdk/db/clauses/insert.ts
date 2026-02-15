import type { InsertPayload, JsonValue } from "../payload";
import { Clause } from "./base";

export class InsertClause<T = JsonValue> extends Clause<T> {
  private _payload: InsertPayload<T>;

  constructor(relationName: string, data: Partial<T> | Partial<T>[]) {
    super(relationName);
    this._payload = { data: Array.isArray(data) ? data : [data] };
  }

  payload(): InsertPayload<T> {
    return this._payload;
  }
}
