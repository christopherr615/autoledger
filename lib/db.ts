console.log("DATABASE_URL =", process.env.DATABASE_URL);

import { Pool, type QueryResultRow } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []) {
  return pool.query<T>(sql, params);
}
