# Quick Start Guide

## Installation

```bash
npm install lizz-db
```

## Basic Usage

```javascript
import { LizzDB } from 'lizz-db';

// Create database instance
const db = new LizzDB('./data.json');

// Set a value
db.set('user:1', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Get a value
const user = db.get('user:1');
console.log(user); // { name: 'John Doe', email: 'john@example.com' }

// Update a value
db.set('user:1', { ...user, age: 30 });

// Delete a value
db.delete('user:1');

// Get all data
const allData = db.all();
console.log(allData);
```

## With Encryption

```javascript
const db = new LizzDB('./secure-data.json', {
  encrypt: true,
  encryptionKey: 'your-secret-key'
});

db.set('secret', 'sensitive data');
```

## With Auto-Backup

```javascript
const db = new LizzDB('./data.json', {
  autoBackup: true,
  backupInterval: 3600000 // 1 hour
});
```

## Array Operations

```javascript
// Push item to array
db.push('users', { id: 1, name: 'Alice' });
db.push('users', { id: 2, name: 'Bob' });

// Find item
const user = db.find('users', u => u.id === 1);

// Update items
db.update('users', u => u.id === 1, u => ({ ...u, name: 'Alice Updated' }));

// Remove item
db.unpush('users', u => u.id === 1);
```

## Schema Validation

```javascript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name']
};

const data = { name: 'John', age: 30 };
db.validateSchema(data, schema); // true
```

## Events

```javascript
db.on('set', (key, value) => {
  console.log(`Set: ${key}`, value);
});

db.on('delete', (key) => {
  console.log(`Deleted: ${key}`);
});

db.on('push', (key, item) => {
  console.log(`Pushed to ${key}`, item);
});
```

For more examples, see the [examples](./examples/) directory.

