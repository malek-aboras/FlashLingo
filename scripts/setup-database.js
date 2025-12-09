#!/usr/bin/env node

/**
 * Database Setup Script for FlashLingo
 *
 * This script sets up the Neon PostgreSQL database tables using the connection
 * string from environment variables.
 *
 * Usage:
 *   node scripts/setup-database.js
 *
 * Requirements:
 *   - POSTGRES_URL environment variable must be set
 *   - pg package must be installed (npm install pg)
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  // Check if POSTGRES_URL is set
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Error: POSTGRES_URL environment variable is not set');
    console.error('Please set it in your .env file or export it in your shell');
    process.exit(1);
  }

  console.log('🔗 Connecting to Neon database...');

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read the schema.sql file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    console.log(`📄 Reading schema from ${schemaPath}...`);

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    console.log('🚀 Creating tables and indexes...');
    await client.query(schemaSql);

    console.log('✅ Database setup completed successfully!');
    console.log('\n📊 Created tables:');
    console.log('  - vocabulary');
    console.log('  - user_progress');
    console.log('  - review_schedule');
    console.log('\n📈 Created indexes:');
    console.log('  - idx_vocabulary_type');
    console.log('  - idx_user_progress_vocabulary');
    console.log('  - idx_review_schedule_date');
    console.log('  - idx_review_schedule_vocabulary');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n✅ Verified tables in database:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the setup
setupDatabase();
