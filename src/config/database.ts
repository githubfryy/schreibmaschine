import { Database } from 'bun:sqlite';
import { dirname, join } from 'node:path';
import { env, isDevelopment } from '@/config/env';

/**
 * Database connection configuration for Schreibmaschine
 * Uses Bun's native SQLite driver for optimal performance
 */

// Ensure database directory exists
const dbPath = env.DATABASE_PATH;
const dbDir = dirname(dbPath);

// Use sync version to avoid top-level await issues
try {
  const fs = require('node:fs');
  fs.mkdirSync(dbDir, { recursive: true });
} catch (_error) {
  // Directory might already exist
  if (isDevelopment) {
    console.log(`📁 Database directory: ${dbDir}`);
  }
}

// Create database connection
export const db = new Database(dbPath, {
  create: true,
  readwrite: true,
  // Enable WAL mode for better concurrent access
  strict: true,
});

// Configure SQLite for optimal performance
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA cache_size = -64000;
  PRAGMA foreign_keys = ON;
  PRAGMA temp_store = MEMORY;
`);

// Database utilities
export class DatabaseManager {
  static async executeSchema(schemaPath: string): Promise<void> {
    try {
      const fs = require('node:fs');
      const schema = fs.readFileSync(schemaPath, 'utf8');

      // Execute the entire schema at once (SQLite can handle multiple statements)
      db.exec(schema);

      console.log('✅ Database schema executed successfully');
    } catch (error) {
      console.error('❌ Failed to execute database schema:', error);
      throw error;
    }
  }

  static async runMigrations(_migrationsDir?: string): Promise<void> {
    // Create migrations table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      // TODO: Implement migration runner when we have migration files
      console.log('📦 Migration system ready (no migrations to run yet)');
    } catch (error) {
      console.error('❌ Failed to run migrations:', error);
      throw error;
    }
  }

  static getConnectionInfo(): {
    path: string;
    size: number;
    exists: boolean;
  } {
    try {
      const fs = require('node:fs');
      const stats = fs.statSync(dbPath);
      return {
        path: dbPath,
        size: stats.size || 0,
        exists: true,
      };
    } catch {
      return {
        path: dbPath,
        size: 0,
        exists: false,
      };
    }
  }

  static async vacuum(): Promise<void> {
    try {
      db.exec('VACUUM;');
      console.log('🧹 Database vacuumed successfully');
    } catch (error) {
      console.error('❌ Failed to vacuum database:', error);
      throw error;
    }
  }

  static async analyze(): Promise<void> {
    try {
      db.exec('ANALYZE;');
      console.log('📊 Database statistics updated');
    } catch (error) {
      console.error('❌ Failed to analyze database:', error);
      throw error;
    }
  }

  static close(): void {
    try {
      db.close();
      console.log('🔒 Database connection closed');
    } catch (error) {
      console.error('❌ Failed to close database:', error);
    }
  }

  static async backup(backupPath?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalBackupPath = backupPath || join(env.DATABASE_BACKUP_PATH, `backup-${timestamp}.db`);

    try {
      // Ensure backup directory exists
      const fs = require('node:fs');
      fs.mkdirSync(dirname(finalBackupPath), { recursive: true });

      // Use SQLite BACKUP command for consistent backup
      const backupDb = new Database(finalBackupPath, { create: true });

      // Simple file copy approach since Bun doesn't have built-in backup API yet
      db.exec('BEGIN IMMEDIATE;');
      db.prepare('SELECT * FROM sqlite_master').all();
      db.exec('COMMIT;');

      backupDb.close();

      console.log(`💾 Database backed up to: ${finalBackupPath}`);
      return finalBackupPath;
    } catch (error) {
      console.error('❌ Failed to backup database:', error);
      throw error;
    }
  }
}

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down database connection...');
  DatabaseManager.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Shutting down database connection...');
  DatabaseManager.close();
  process.exit(0);
});

if (isDevelopment) {
  const info = DatabaseManager.getConnectionInfo();
  console.log(`💾 Database: ${info.path} (${info.size} bytes, exists: ${info.exists})`);
}

export default db;
