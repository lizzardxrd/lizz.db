import fs from 'fs';
import path from 'path';


export class BackupManager {
 constructor(backupsDir, options = {}) {
  this.backupsDir = backupsDir;
  this.maxBackups = options.maxBackups || 5;

  
  const rootDir = path.dirname(backupsDir);
  this.dbPath = path.join(rootDir, 'data.json');
  this.metaPath = path.join(rootDir, 'meta.json');
}


 
  backupNow(data) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupsDir, `backup-${timestamp}.json`);
      
      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
      
      
      this.cleanOldBackups();
      
      
      this.updateBackupMeta();
      
      return {
        success: true,
        path: backupPath,
        timestamp
      };
    } catch (err) {
      console.error('Backup alınırken hata:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }

  
  autoBackup(getDataFn, interval = 300000) {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
    }

    this.autoBackupInterval = setInterval(() => {
    const data = getDataFn();
    this.backupNow(data);
  }, interval);

    return this.autoBackupInterval;
  }

 
  stopAutoBackup() {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
    }
  }

  
  cleanOldBackups() {
    try {
      if (!fs.existsSync(this.backupsDir)) return;

      const files = fs.readdirSync(this.backupsDir)
        .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length > this.maxBackups) {
        for (let i = this.maxBackups; i < files.length; i++) {
          const filePath = path.join(this.backupsDir, files[i]);
          fs.unlinkSync(filePath);
        }
      }
    } catch (err) {
      console.error('Eski backuplar silinirken hata:', err);
    }
  }

  
  listBackups() {
    try {
      if (!fs.existsSync(this.backupsDir)) return [];

      return fs.readdirSync(this.backupsDir)
        .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
        .sort()
        .reverse()
        .map(f => ({
          name: f,
          path: path.join(this.backupsDir, f),
          timestamp: f.replace('backup-', '').replace('.json', '')
        }));
    } catch (err) {
      console.error('Backuplar listelenirken hata:', err);
      return [];
    }
  }

  
  restoreFromBackup(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        return {
          success: false,
          error: 'Backup dosyası bulunamadı'
        };
      }

      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
      fs.writeFileSync(this.dbPath, JSON.stringify(backupData, null, 2));

      return {
        success: true,
        message: 'Backup başarıyla geri yüklendi'
      };
    } catch (err) {
      console.error('Backup geri yüklenirken hata:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }

  
  updateBackupMeta() {
    try {
      const meta = JSON.parse(fs.readFileSync(this.metaPath, 'utf-8'));
      meta.lastBackup = new Date().toISOString();
      meta.totalBackups = (meta.totalBackups || 0) + 1;
      fs.writeFileSync(this.metaPath, JSON.stringify(meta, null, 2));
    } catch (err) {
      console.error('Meta.json güncellenirken hata:', err);
    }
  }

  
  getBackupStats() {
    const backups = this.listBackups();
    return {
      totalBackups: backups.length,
      maxBackups: this.maxBackups,
      latestBackup: backups.length > 0 ? backups[0].timestamp : null,
      backups: backups
    };
  }
}

export default BackupManager;
