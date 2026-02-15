import type { Payload, JsonValue } from "../payload";
import { request } from "../request";

export abstract class Clause<T = JsonValue> {
  protected _relationName: string;

  constructor(relationName: string) {
    this._relationName = relationName;
  }

  abstract payload(): Payload<T>;

  execute(): Promise<T> {
    return request(this._relationName, this.payload());
  }
}
