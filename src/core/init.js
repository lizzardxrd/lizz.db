import fs from 'fs';
import path from 'path';

/**
 * DatabaseInit: Veritabanı başlatma işlemleri
 * Tüm dosyalar lizzDB/ klasörü altında tutulur
 */
export class DatabaseInit {
  constructor() {}

  static initDatabase(dbPath, options = {}) {
    const rootDir = path.join(process.cwd(), 'lizzDB');

    
    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir, { recursive: true });
    }

    
    const dataPath = path.join(rootDir, 'data.json');
    const metaPath = path.join(rootDir, 'meta.json');
    const backupsDir = path.join(rootDir, 'backups');

    
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify({}, null, 2));
    }

    
    if (!fs.existsSync(metaPath)) {
      const metaData = {
        collections: [],
        lastBackup: null,
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        encryption: !!options.encryptionKey,
        totalBackups: 0
      };
      fs.writeFileSync(metaPath, JSON.stringify(metaData, null, 2));
    }

    return {
      rootDir,
      dataPath,
      metaPath,
      backupsDir
    };
  }

  static loadMeta(metaPath) {
    try {
      if (fs.existsSync(metaPath)) {
        return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      }
    } catch (err) {
      console.error('[LizzDB] Meta load error:', err);
    }

    return {
      collections: [],
      lastBackup: null,
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      encryption: false,
      totalBackups: 0
    };
  }

  static saveMeta(metaPath, metadata) {
    try {
      fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
      return true;
    } catch (err) {
      console.error('[LizzDB] Meta save error:', err);
      return false;
    }
  }

  static loadDatabase(dataPath) {
    try {
      if (fs.existsSync(dataPath)) {
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      }
    } catch (err) {
      console.error('[LizzDB] DB load error:', err);
    }
    return {};
  }

  static saveDatabase(dataPath, data) {
    try {
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return true;
    } catch (err) {
      console.error('[LizzDB] DB save error:', err);
      return false;
    }
  }
}

export default DatabaseInit;
