import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Create database connection
const sqlite = new Database('./zen-mind-mate.db', { verbose: console.log });

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Export database instance
export default db;
