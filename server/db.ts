import Database from "better-sqlite3";
import { resolve } from "path";

const dbPath = resolve(process.cwd(), "database.sqlite");
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Initialize database tables
export function initializeDatabase() {
  // Create customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Create help_requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS help_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      answer TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      resolved_at INTEGER,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Create knowledge_base table
  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT,
      learned_at INTEGER NOT NULL DEFAULT (unixepoch()),
      usage_count INTEGER NOT NULL DEFAULT 0
    )
  `);

  console.log("✅ Database initialized successfully");
}

// Check if database needs seeding
export function isDatabaseEmpty(): boolean {
  const result = db.prepare("SELECT COUNT(*) as count FROM customers").get() as { count: number };
  return result.count === 0;
}

// Initialize on import
initializeDatabase();
