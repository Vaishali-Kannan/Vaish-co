const { default: EmbeddedPostgres } = require('embedded-postgres');
const path = require('path');

const pg = new EmbeddedPostgres({
  databaseDir: path.resolve(__dirname, '../.postgres-data'),
  port: 5432,
  user: 'postgres',
  password: 'password',
  persistent: true
});

async function run() {
  try {
    await pg.start();
    console.log('✅ PostgreSQL is running on localhost:5432 (database: vaish_and_co)');
    
    // Keep alive
    process.on('SIGINT', async () => {
      console.log('Shutting down PostgreSQL...');
      await pg.stop();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      console.log('Shutting down PostgreSQL...');
      await pg.stop();
      process.exit(0);
    });
  } catch (err) {
    if (err.message && err.message.includes('already running')) {
      console.log('PostgreSQL is already running.');
    } else {
      console.error('Failed to start PostgreSQL:', err);
    }
  }
}

run();
