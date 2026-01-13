import { EventEmitter } from 'events';

/**
 * TTLManager: Time-To-Live işlemleri
 */
export class TTLManager extends EventEmitter {
  constructor(cache) {
    super();
    this.cache = cache;
    this.ttlMap = new Map();
  }

  
  setWithTTL(key, value, ttl) {
    this.cache.set(key, value);

    
    if (this.ttlMap.has(key)) {
      clearTimeout(this.ttlMap.get(key).timeout);
    }

    
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.ttlMap.delete(key);
      this.emit('ttl-expired', { key });
    }, ttl);

    this.ttlMap.set(key, {
      timeout,
      expiresAt: new Date(Date.now() + ttl)
    });

    return {
      success: true,
      key,
      ttl,
      expiresAt: this.ttlMap.get(key).expiresAt
    };
  }

  
  getTTL(key) {
    if (!this.ttlMap.has(key)) {
      return null;
    }

    const ttlInfo = this.ttlMap.get(key);
    const remaining = ttlInfo.expiresAt - new Date();

    return {
      key,
      expiresAt: ttlInfo.expiresAt,
      remainingMs: Math.max(0, remaining)
    };
  }

  getAllTTLs() {
    const result = [];
    for (const [key, ttlInfo] of this.ttlMap.entries()) {
      const remaining = ttlInfo.expiresAt - new Date();
      result.push({
        key,
        expiresAt: ttlInfo.expiresAt,
        remainingMs: Math.max(0, remaining)
      });
    }
    return result;
  }

  
  removeTTL(key) {
    if (this.ttlMap.has(key)) {
      const ttlInfo = this.ttlMap.get(key);
      clearTimeout(ttlInfo.timeout);
      this.ttlMap.delete(key);
      return true;
    }
    return false;
  }

  
  clear() {
    for (const [key, ttlInfo] of this.ttlMap.entries()) {
      clearTimeout(ttlInfo.timeout);
    }
    this.ttlMap.clear();
  }
}

export default TTLManager;
