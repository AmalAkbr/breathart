// scripts/migrate.js
// Node.js script to run Supabase migration using the CLI
// Usage: node scripts/migrate.js

const { execSync } = require('child_process');

try {
  execSync('supabase db push', { stdio: 'inherit' });
  console.log('Migration applied successfully!');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
}
