import crypto from 'crypto';

/**
 * EncryptionHelper: AES-256 şifreleme işlemleri
 */
export class EncryptionHelper {
  constructor(encryptionKey) {
    this.encryptionKey = encryptionKey;
  }

  
  deriveKey(key) {
    return crypto
      .createHash('sha256')
      .update(key)
      .digest();
  }

  
  encrypt(data) {
    if (!this.encryptionKey) {
      return data;
    }

    try {
      const key = this.deriveKey(this.encryptionKey);
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      const jsonString = JSON.stringify(data);
      
      let encrypted = cipher.update(jsonString, 'utf-8', 'hex');
      encrypted += cipher.final('hex');
      
     
      const result = iv.toString('hex') + ':' + encrypted;
      return result;
    } catch (err) {
      console.error('Şifreleme hatası:', err);
      return data;
    }
  }

  
  decrypt(encryptedData) {
    if (!this.encryptionKey) {
      return typeof encryptedData === 'string' 
        ? JSON.parse(encryptedData) 
        : encryptedData;
    }

    try {
      if (typeof encryptedData !== 'string') {
        return encryptedData;
      }

      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        return encryptedData;
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const key = this.deriveKey(this.encryptionKey);

      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
      decrypted += decipher.final('utf-8');

      return JSON.parse(decrypted);
    } catch (err) {
      console.error('Şifre çözme hatası:', err);
      return encryptedData;
    }
  }

  isEncrypted(data) {
    if (typeof data !== 'string') return false;
    return data.includes(':') && /^[a-f0-9]{32}:/.test(data);
  }

  hash(data) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }
}

export default EncryptionHelper;
