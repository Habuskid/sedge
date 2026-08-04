import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

// Export the Drizzle client connected to Vercel Postgres
export const db = drizzle(sql, { schema });
