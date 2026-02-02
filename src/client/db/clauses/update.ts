import type { UpdatePayload, JsonValue } from "../payload";
import { Clause } from "./base";

export class UpdateClause<T = JsonValue> extends Clause<T> {
  private _payload: UpdatePayload<T>;

  constructor(
    relationName: string,
    id: number | number[],
    data: Partial<T> | Partial<T>[],
  ) {
    super(relationName);
    this._payload = {
      id: Array.isArray(id) ? id : [id],
      data: Array.isArray(data) ? data : [data],
    };
  }

  payload(): UpdatePayload<T> {
    return this._payload;
  }
}
