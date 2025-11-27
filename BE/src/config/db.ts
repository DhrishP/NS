import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config(); // Load .env

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ens_graph';
const client = postgres(connectionString, { ssl: 'require' });
export const db = drizzle(client);

