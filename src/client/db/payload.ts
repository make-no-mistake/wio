export type Payload<T> =
  | SelectPayload
  | InsertPayload<T>
  | UpdatePayload<T>
  | DeletePayload;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface SelectPayload {
  select: string[];
  where?: WhereClause;
  order_by?: OrderByEntry[];
  limit?: number;
  offset?: number;
}

export interface WhereOperators {
  eq?: number | string | boolean | null;
  neq?: number | string | boolean | null;
  gt?: number | string;
  gte?: number | string;
  lt?: number | string;
  lte?: number | string;
  like?: string;
}

export type WhereCondition<T> = {
  [K in keyof T]?: WhereOperators | T[K];
};

export type WhereClause<T = JsonValue> = WhereCondition<T> & {
  and?: WhereClause<T>[];
  or?: WhereClause<T>[];
  not?: WhereClause<T>;
};

export interface OrderByEntry {
  column: string;
  order: "asc" | "desc";
}

export interface InsertPayload<T> {
  data: Partial<T>[];
}

export interface UpdatePayload<T> {
  id: number[];
  data: Partial<T>[];
}

export interface DeletePayload {
  ids: number[];
}
