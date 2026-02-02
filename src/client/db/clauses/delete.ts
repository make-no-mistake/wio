import type { DeletePayload } from "../payload";
import { Clause } from "./base";

export class DeleteClause extends Clause<unknown> {
  private _payload: DeletePayload;

  constructor(relationName: string, ids: number | number[]) {
    super(relationName);
    this._payload = { ids: Array.isArray(ids) ? ids : [ids] };
  }

  payload(): DeletePayload {
    return this._payload;
  }
}
