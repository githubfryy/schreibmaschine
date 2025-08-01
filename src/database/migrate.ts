#!/usr/bin/env bun

import { DatabaseManager } from '@/config/database';
import { join } from 'path';
import { env } from '@/config/env';

/**
 * Database Migration Runner
 * 
 * Executes the main schema and sets up the database for Schreibmaschine
 */

async function runMigrations(): Promise<void> {
  console.log('🚀 Starting database migration...');
  
  try {
    // Get current database info
    const info = DatabaseManager.getConnectionInfo();
    console.log(`📍 Database: ${info.path}`);
    console.log(`📊 Current size: ${info.size} bytes`);
    console.log(`📋 Exists: ${info.exists}`);
    
    // Execute main schema
    const schemaPath = join(import.meta.dir, 'schema.sql');
    console.log(`📄 Loading schema from: ${schemaPath}`);
    
    await DatabaseManager.executeSchema(schemaPath);
    
    // Run any additional migrations
    const migrationsDir = join(import.meta.dir, 'migrations');
    await DatabaseManager.runMigrations(migrationsDir);
    
    // Update database statistics
    await DatabaseManager.analyze();
    
    // Get final database info
    const finalInfo = DatabaseManager.getConnectionInfo();
    console.log(`✅ Migration completed successfully`);
    console.log(`📊 Final size: ${finalInfo.size} bytes`);
    
    // Seed database if in development and flag is set
    if (env.DEV_SEED_DATABASE) {
      console.log('🌱 Seeding development data...');
      const { runSeeding } = await import('./seed');
      await runSeeding();
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (import.meta.main) {
  await runMigrations();
  console.log('✨ Database migration complete');
  process.exit(0);
}

export { runMigrations };