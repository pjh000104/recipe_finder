import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { recipes } from './schema';


const client = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_DB_AUTH_TOKEN!,
});

const db = drizzle(client);

export { db, recipes };