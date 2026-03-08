import type {
  SelectPayload,
  WhereClause,
  WhereOperators,
} from "../sdk/db/payload";

const OP_MAP = {
  eq: "=",
  neq: "!=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  like: "LIKE",
};

function refOp(op: string) {
  if (op in OP_MAP) return OP_MAP[op as keyof typeof OP_MAP];

  throw new Error(`Unknown operator: ${op}`);
}

function refJsonCol(col: string) {
  return `data->>'${col}'`;
}

function espaceIfString(value: unknown) {
  return typeof value === "string" ? `'${value}'` : value;
}

export function buildBaseQuery(
  selectJsonColumns: string[],
  relation: string,
  siteId: number,
) {
  // Columns are selected from the data JSON column. Hence we need the ->> syntax.
  const selectExpr = selectJsonColumns
    .map((col) => `${refJsonCol(col)} AS ${col}`)
    .join(", ");

  // Example:
  // SELECT data->>'name' AS name FROM relations WHERE relation_name = 'channels' AND site_id = 1
  return `SELECT ${selectExpr} FROM relations WHERE relation_name = '${relation}' AND site_id = ${siteId}`;
}

export function buildWhereClause(where: WhereClause): string {
  const conditions: string[] = [];

  for (const [key, value] of Object.entries(where)) {
    if (key === "and" && Array.isArray(value)) {
      const inner = value.map((w) => buildWhereClause(w)).filter(Boolean);
      if (inner.length) conditions.push(`(${inner.join(" AND ")})`);
    } else if (key === "or" && Array.isArray(value)) {
      const inner = value.map((w) => buildWhereClause(w)).filter(Boolean);
      if (inner.length) conditions.push(`(${inner.join(" OR ")})`);
    } else if (key === "not" && typeof value === "object" && value !== null) {
      const inner = buildWhereClause(value as WhereClause);
      if (inner) conditions.push(`NOT (${inner})`);
    } else if (typeof value === "object" && value !== null) {
      conditions.push(buildOperatorCondition(key, value as WhereOperators));
    } else {
      conditions.push(`${refJsonCol(key)} = ${espaceIfString(value)}`);
    }
  }

  return conditions.join(" AND ");
}

function buildOperatorCondition(
  column: string,
  operators: WhereOperators,
): string {
  const parts = Object.entries(operators).map(([op, value]) => {
    const colExpr =
      typeof value === "number"
        ? `(${refJsonCol(column)})::numeric`
        : refJsonCol(column);
    return `${colExpr} ${refOp(op)} ${espaceIfString(value)}`;
  });

  return `(${parts.join(" AND ")})`;
}

export function buildSelectQuery(
  relation: string,
  siteId: number,
  payload: SelectPayload,
) {
  const isWildcard = payload.select.length === 1 && payload.select[0] === "*";
  const selectExpr = isWildcard
    ? "data, id"
    : payload.select.map((col) => `data->>'${col}' AS "${col}"`).join(", ") +
      ", id ";

  let query = `SELECT ${selectExpr} FROM relations WHERE relation_name = '${relation.replace(/'/g, "''")}' AND site_id = ${siteId}`;

  if (payload.where) {
    const whereStr = buildWhereClause(payload.where);
    if (whereStr) query += ` AND ${whereStr}`;
  }

  if (payload.order_by && payload.order_by.length > 0) {
    const orderParts = payload.order_by.map(
      (o) =>
        `data->>'${o.column}' ${o.order.toUpperCase() === "DESC" ? "DESC" : "ASC"}`,
    );
    query += ` ORDER BY ${orderParts.join(", ")}`;
  }

  if (payload.limit !== undefined) {
    query += ` LIMIT ${Number(payload.limit)}`;
  }

  if (payload.offset !== undefined) {
    query += ` OFFSET ${Number(payload.offset)}`;
  }

  return query + ";";
}
