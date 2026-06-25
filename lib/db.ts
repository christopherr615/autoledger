import { Pool, type QueryResultRow } from "pg";

// Determine which database connection to use
const dbChoice = process.env.USE_DATABASE || "local";
let connectionString: string | undefined;

switch (dbChoice) {
  case "shared":
    connectionString = process.env.NEON_SHARED_DATABASE_URL;
    break;
  case "branch":
    connectionString = process.env.NEON_BRANCH_DATABASE_URL;
    break;
  case "local":
  default:
    connectionString = process.env.DATABASE_URL;
    break;
}

if (!connectionString) {
  throw new Error(`No database URL configured for USE_DATABASE=${dbChoice}`);
}

const dbLabel =
  dbChoice === "shared" ? "Neon Cloud (Shared)" : dbChoice === "branch" ? "Neon Cloud (Your Branch)" : "Local Database";

console.log("Connecting to:", dbLabel, "(", connectionString?.split("@")[1] || "unknown", ")");

const pool = new Pool({
  connectionString,
});

export async function query<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []) {
  return pool.query<T>(sql, params);
}
