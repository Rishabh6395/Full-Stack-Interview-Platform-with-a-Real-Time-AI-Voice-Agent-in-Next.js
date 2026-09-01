import { Pool } from "pg";
import type { QueryResult, QueryResultRow } from "pg";
import { config } from "dotenv";

config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT
          ? Number(process.env.PGPORT)
          : undefined,
      }
);

const db = {
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> => {
    return pool.query<T>(text, params);
  },
};

export default db;
