import { LizzDB } from '../index.js';

const db = new LizzDB('./data.json');

console.log('=== CRUD Operations ===');

db.set('user:1', { name: 'John', email: 'john@example.com' });
db.set('user:2', { name: 'Jane', email: 'jane@example.com' });

const user = db.get('user:1');
console.log('Get user:1:', user);

const allUsers = db.all();
console.log('All data:', allUsers);

db.delete('user:2');
console.log('After delete user:2');

console.log('\n=== Events ===');
db.on('set', (key, value) => {
  console.log(`Event - Set: ${key}`, value);
});

db.set('message', 'Hello World');

console.log('\nBasic usage example completed!');
