# API Reference

## Main Class: LizzDB

### Constructor
```javascript
new LizzDB(filePath, options)
```

**Options:**
- `encrypt` (boolean) - Enable AES-256 encryption
- `autoBackup` (boolean) - Enable automatic backups
- `backupInterval` (number) - Backup interval in ms (default: 3600000)
- `encryptionKey` (string) - Custom encryption key

### Methods

#### CRUD Operations
- `set(key, value)` - Set a value
- `get(key, defaultValue)` - Get a value
- `delete(key)` - Delete a key
- `all()` - Get all data as object
- `allArray()` - Get all data as array

#### Array Operations
- `push(key, item)` - Add item to array
- `unpush(key, predicate)` - Remove item from array
- `find(key, predicate)` - Find item in array
- `update(key, predicate, updateFn)` - Update array items

#### Validation
- `validateSchema(data, schema)` - Validate data against schema

#### Backup
- `backupNow()` - Create manual backup
- `restore(backupName)` - Restore from backup

#### TTL
- `setTTL(key, milliseconds)` - Set expiration time

#### Events
- `on('set', callback)` - Listen to set events
- `on('delete', callback)` - Listen to delete events
- `on('push', callback)` - Listen to push events

## Helper Classes

### EncryptionHelper
- `encrypt(data, key)` - Encrypt data
- `decrypt(data, key)` - Decrypt data

### SchemaValidator
- `validate(data, schema)` - Validate JSON schema

### BackupManager
- `createBackup()` - Create backup
- `listBackups()` - List all backups
- `getBackup(name)` - Get specific backup

See [examples](./examples/) for more usage patterns.
