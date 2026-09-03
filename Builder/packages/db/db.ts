import { Pool } from 'pg';
import type { QueryResult, QueryResultRow } from 'pg';
import { config } from 'dotenv';
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const db = {
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> => pool.query<T>(text, params),
};

export default db;