require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const migrationsDir = path.join(__dirname, 'migrations');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL is not set.');
  console.error('Set DATABASE_URL in backend/.env or as an environment variable.');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

async function runMigrations() {
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found.');
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`Running migration: ${file}`);
    await pool.query(sql);
    console.log(`Migration applied: ${file}`);
  }

  console.log('All migrations applied successfully.');
}

runMigrations()
  .catch((error) => {
    console.error('Migration failed:', error.message || error);
    process.exit(1);
  })
  .finally(() => pool.end());
