import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Server-side database connection (Node.js only)
let db: ReturnType<typeof drizzle> | null = null;

export function getServerDB() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL!;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const client = postgres(connectionString, {
      ssl: 'require',
      max: 1,
    });

    db = drizzle(client, { schema });
  }

  return db;
}

export type ServerDatabase = ReturnType<typeof getServerDB>;
