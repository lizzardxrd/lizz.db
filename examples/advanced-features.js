import { LizzDB } from '../index.js';

const db = new LizzDB('./data.json', {
  encrypt: false,
  autoBackup: true,
  backupInterval: 60000
});

console.log('=== Advanced Features ===');

console.log('\n--- Schema Validation ---');
const userSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name', 'email']
};

const validUser = { name: 'John', email: 'john@example.com', age: 30 };
const isValid = db.validateSchema(validUser, userSchema);
console.log('Is valid user:', isValid);

console.log('\n--- TTL ---');
db.set('temp', 'This will expire');
db.setTTL('temp', 5000);
console.log('Temp before expiry:', db.get('temp'));

console.log('\n--- Backup ---');
db.backupNow();
console.log('Manual backup created');

console.log('\n--- Complex Data ---');
db.set('config', {
  database: { host: 'localhost', port: 5432 },
  features: { auth: true, logging: true },
  metadata: { version: '1.0.0', updated: new Date() }
});

const config = db.get('config');
console.log('Complex config:', config);

console.log('\nAdvanced features example completed!');
