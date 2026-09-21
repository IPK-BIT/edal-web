import Database from 'better-sqlite3';

if (!process.env.SCORPION_TOKEN) throw new Error('SCORPION_TOKEN is not set');

const db = new Database(process.env.DATABASE_URL);
db.prepare('DELETE FROM scorpion').run();
db.prepare('INSERT INTO scorpion (token) VALUES (?)').run(process.env.SCORPION_TOKEN);
console.log('scorpion token stored');
