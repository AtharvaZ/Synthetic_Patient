import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Default to a dummy connection string if not set, to allow app to start without DB
// since we are using MemStorage for now as per user request.
const connectionString = process.env.DATABASE_URL || "postgres://user:password@localhost:5432/db";

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
