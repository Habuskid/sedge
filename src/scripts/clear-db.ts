import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function clearDB() {
  try {
    console.log('Connecting to DB and clearing recurring_schedules and notifications...');
    await sql`TRUNCATE TABLE recurring_schedules CASCADE;`;
    await sql`TRUNCATE TABLE notifications CASCADE;`;
    console.log('Database successfully cleared!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to clear database:', error);
    process.exit(1);
  }
}

clearDB();
