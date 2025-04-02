// src/app/lib/db.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { recipes } from './schema';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to local SQLite file
const client = createClient({
  url: `file:${path.join(__dirname, 'recipes.db')}`, // Update filename
});

const db = drizzle(client);

export { db, recipes };

