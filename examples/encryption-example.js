import { LizzDB } from '../index.js';

const db = new LizzDB('./secure-data.json', {
  encrypt: true,
  encryptionKey: 'your-secret-key-here'
});

console.log('=== Encryption Example ===');

const sensitiveData = {
  apiKey: 'sk-1234567890abcdef',
  token: 'auth-token-xyz',
  password: 'encrypted-password'
};

db.set('secrets', sensitiveData);
console.log('Sensitive data encrypted and stored');

const retrieved = db.get('secrets');
console.log('Retrieved (decrypted):', retrieved);

console.log('\nNote: The data.json file contains encrypted values');
console.log('Encryption provides security at rest');

console.log('\nEncryption example completed!');
