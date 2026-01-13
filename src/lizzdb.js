import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import DatabaseInit from './core/init.js';
import BackupManager from './core/backup.js';
import EncryptionHelper from './helpers/encryption.js';
import SchemaValidator from './helpers/validation.js';
import CRUDOperations from './operations/crud.js';
import ArrayOperations from './operations/array.js';
import TTLManager from './operations/ttl.js';

export class LizzDB extends EventEmitter {
  constructor(_dbPathIgnored = './db.json', options = {}) {
    super();

    this.options = {
      encryption: options.encryption || false,
      encryptionKey: options.encryptionKey || null,
      autoBackup: options.autoBackup || false,
      backupInterval: options.backupInterval || 300000,
      schemaValidation: options.schemaValidation || false,
      debug: options.debug || false,
      maxBackups: options.maxBackups || 5,
      ...options
    };

    this.initialize();
  }

  initialize() {
    this.paths = DatabaseInit.initDatabase(null, this.options);

    this.encryptionHelper = new EncryptionHelper(this.options.encryptionKey);
    this.schemaValidator = new SchemaValidator();

    this.backupManager = new BackupManager(this.paths.backupsDir, this.options);
    this.meta = DatabaseInit.loadMeta(this.paths.metaPath);

    this.cache = new Map();
    this.ttlManager = new TTLManager(this.cache);

    this.crudOps = new CRUDOperations(
      this.cache,
      this.schemaValidator,
      this.backupManager
    );

    this.arrayOps = new ArrayOperations(this.cache, this.schemaValidator);

    this.loadData();

    if (this.options.autoBackup) {
      this.startAutoBackup(this.options.backupInterval);
    }

    if (this.options.debug) {
      console.log('[LizzDB] Initialized at lizzDB/');
    }

    this.emit('initialized', { path: this.paths.rootDir });
  }

  loadData() {
    const data = DatabaseInit.loadDatabase(this.paths.dataPath);

    let decryptedData = data;
    if (this.options.encryptionKey && typeof data === 'string') {
      decryptedData = this.encryptionHelper.decrypt(data);
    }

    this.cache.clear();
    for (const [key, value] of Object.entries(decryptedData)) {
      this.cache.set(key, value);
    }

    if (this.options.debug) {
      console.log(`[LizzDB] Data loaded: ${this.cache.size} keys`);
    }
  }

  saveData() {
    let dataToSave = this.crudOps.all();

    if (this.options.encryptionKey) {
      dataToSave = this.encryptionHelper.encrypt(dataToSave);
    }

    return DatabaseInit.saveDatabase(this.paths.dataPath, dataToSave);
  }

  
  set(key, value, schema = null) {
    const result = this.crudOps.set(key, value, schema);
    this.saveData();
    this.emit('set', { key, value });
    return result;
  }

 
  get(key, defaultValue = undefined) {
    return this.crudOps.get(key, defaultValue);
  }

  
  delete(key) {
    const result = this.crudOps.delete(key);
    this.saveData();
    this.emit('delete', { key });
    return result;
  }

  
  all() {
    return this.crudOps.all();
  }

  
  allArray() {
    return this.crudOps.allArray();
  }

  
  push(key, value, schema = null) {
    const result = this.arrayOps.push(key, value, schema);
    this.saveData();
    this.emit('push', { key, value });
    return result;
  }

  
  unpush(key, predicate) {
    const result = this.arrayOps.unpush(key, predicate);
    this.saveData();
    this.emit('unpush', { key });
    return result;
  }

  
  update(key, predicate, updateFn) {
    const result = this.arrayOps.update(key, predicate, updateFn);
    this.saveData();
    this.emit('update', { key });
    return result;
  }

  
  find(key, predicate) {
    return this.arrayOps.find(key, predicate);
  }

 
  validateSchema(data, schema) {
    return this.schemaValidator.validateSchema(data, schema);
  }

  // ===== EKSTRA METODLAR =====

 
  has(key) {
    return this.crudOps.has(key);
  }

  
  keys() {
    return this.crudOps.keys();
  }

  
  values() {
    return this.crudOps.values();
  }

  
  size() {
    return this.crudOps.size();
  }

  
  clear() {
    const result = this.crudOps.clear();
    this.saveData();
    this.emit('clear', {});
    return result;
  }

 
  filter(predicate) {
    return this.crudOps.filter(predicate);
  }

  
  map(callback) {
    return this.crudOps.map(callback);
  }

  
  findByPredicate(predicate) {
    return this.crudOps.findByPredicate(predicate);
  }

  
  findOne(predicate) {
    return this.crudOps.findOne(predicate);
  }

  
  batch(operations) {
    const result = this.crudOps.batch(operations);
    this.saveData();
    this.emit('batch', { operations: result });
    return result;
  }

  
  backupNow() {
    const data = this.crudOps.all();
    const result = this.backupManager.backupNow(data);
    if (result.success) {
      this.emit('backup', result);
    }
    return result;
  }

 
  listBackups() {
    return this.backupManager.listBackups();
  }

  
  restoreFromBackup(backupPath) {
    const result = this.backupManager.restoreFromBackup(backupPath);
    if (result.success) {
      this.loadData();
      this.emit('restore', result);
    }
    return result;
  }

  
  getBackupStats() {
    return this.backupManager.getBackupStats();
  }

  
  startAutoBackup(interval = this.options.backupInterval) {
    this.backupManager.autoBackup(() => this.crudOps.all(), interval);
    this.options.autoBackup = true;
    if (this.options.debug) {
      console.log(`[LizzDB] Auto backup started: ${interval}ms interval`);
    }
  }

  
  stopAutoBackup() {
    this.backupManager.stopAutoBackup();
    this.options.autoBackup = false;
    if (this.options.debug) {
      console.log('[LizzDB] Auto backup stopped');
    }
  }

  
  setWithTTL(key, value, ttl) {
    this.cache.set(key, value);
    const result = this.ttlManager.setWithTTL(key, value, ttl);
    this.saveData();
    this.emit('set-ttl', result);
    return result;
  }

  
  getTTL(key) {
    return this.ttlManager.getTTL(key);
  }

  
  getAllTTLs() {
    return this.ttlManager.getAllTTLs();
  }

  
  exportJSON() {
    return this.crudOps.exportJSON();
  }

  
  importJSON(jsonString) {
    const result = this.crudOps.importJSON(jsonString);
    this.saveData();
    this.emit('import', result);
    return result;
  }

  
  getMeta() {
     return DatabaseInit.loadMeta(this.paths.metaPath);
   }



  getInfo() {
    return {
      path: this.paths.dataPath,
      size: this.cache.size,
      keys: this.keys(),
      encryption: this.options.encryptionKey ? true : false,
      autoBackup: this.options.autoBackup,
      backupInterval: this.options.backupInterval,
      schemaValidation: this.options.schemaValidation,
      debug: this.options.debug,
      meta: this.getMeta()
    };
  }

  
  sync() {
    this.cache.clear();
    this.loadData();
    this.emit('synced', { size: this.cache.size });
    return { success: true, size: this.cache.size };
  }

  
  close() {
    this.saveData();
    this.stopAutoBackup();
    this.ttlManager.clear();
    this.removeAllListeners();
    if (this.options.debug) {
      console.log('[LizzDB] Database closed');
    }
    this.emit('closed', {});
  }

 
  destroy() {
    this.close();

    try {
      if (fs.existsSync(this.dbPath)) {
        fs.unlinkSync(this.dbPath);
      }
      const metaPath = path.join(path.dirname(this.dbPath), 'meta.json');
      if (fs.existsSync(metaPath)) {
        fs.unlinkSync(metaPath);
      }
      this.emit('destroyed', {});
      if (this.options.debug) {
        console.log('[LizzDB] Database destroyed');
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}


export const db = new LizzDB('./db.json');

export default LizzDB;
