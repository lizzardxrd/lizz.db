/**
 * ArrayOperations: Dizi işlemleri (push, unpush, update)
 */
export class ArrayOperations {
  constructor(cache, validator) {
    this.cache = cache;
    this.validator = validator;
  }

  /**
   * Dizi öğesi ekle (push)
   */
  push(key, value, schema = null) {
    let array = this.cache.get(key);

    if (!Array.isArray(array)) {
      array = [];
    }

    if (schema) {
      const validation = this.validator.validateSchema(value, schema);
      if (!validation.valid) {
        throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
      }
    }

    array.push(value);
    this.cache.set(key, array);

    return {
      success: true,
      key,
      value,
      length: array.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Dizi öğesi sil (unpush) - koşula göre
   */
  unpush(key, predicate) {
    let array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return {
        success: false,
        error: 'Değer dizi değil',
        key
      };
    }

    const initialLength = array.length;
    const filtered = array.filter((item, index) => {
      try {
        return !predicate(item, index);
      } catch (err) {
        return true;
      }
    });

    const removed = initialLength - filtered.length;

    if (removed > 0) {
      this.cache.set(key, filtered);
    }

    return {
      success: true,
      key,
      removed,
      length: filtered.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Dizi öğelerini güncelle (update)
   */
  update(key, predicate, updateFn) {
    let array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return {
        success: false,
        error: 'Değer dizi değil',
        key
      };
    }

    let updated = 0;
    const newArray = array.map((item, index) => {
      try {
        if (predicate(item, index)) {
          updated++;
          return updateFn(item, index);
        }
      } catch (err) {
      }
      return item;
    });

    if (updated > 0) {
      this.cache.set(key, newArray);
    }

    return {
      success: true,
      key,
      updated,
      length: newArray.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Dizi içinde elemanı bul
   */
  find(key, predicate) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return null;
    }

    for (let i = 0; i < array.length; i++) {
      try {
        if (predicate(array[i], i)) {
          return {
            index: i,
            value: array[i]
          };
        }
      } catch (err) {

      }
    }

    return null;
  }

  /**
   * Dizi içinde tüm eşleşenleri bul
   */
  findAll(key, predicate) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return [];
    }

    const results = [];
    for (let i = 0; i < array.length; i++) {
      try {
        if (predicate(array[i], i)) {
          results.push({
            index: i,
            value: array[i]
          });
        }
      } catch (err) {
      }
    }

    return results;
  }

  /**
   * Dizi içinde index ile öğeyi bul
   */
  at(key, index) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return undefined;
    }

    if (index < 0) {
      index = array.length + index;
    }

    return array[index];
  }

  /**
   * Dizi içindeki bir öğeyi sil (index ile)
   */
  removeAt(key, index) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return {
        success: false,
        error: 'Değer dizi değil',
        key
      };
    }

    if (index < 0 || index >= array.length) {
      return {
        success: false,
        error: 'Index aralık dışında',
        key
      };
    }

    const removed = array.splice(index, 1)[0];
    this.cache.set(key, array);

    return {
      success: true,
      key,
      removed,
      length: array.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Dizi uzunluğu
   */
  length(key) {
    const array = this.cache.get(key);
    return Array.isArray(array) ? array.length : 0;
  }

  /**
   * Dizi içinde bir değer var mı
   */
  includes(key, value) {
    const array = this.cache.get(key);
    return Array.isArray(array) && array.includes(value);
  }

  /**
   * Diziyi sırala
   */
  sort(key, compareFunction) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return {
        success: false,
        error: 'Değer dizi değil',
        key
      };
    }

    const sorted = [...array].sort(compareFunction);
    this.cache.set(key, sorted);

    return {
      success: true,
      key,
      length: sorted.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Diziyi ters çevir
   */
  reverse(key) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return {
        success: false,
        error: 'Değer dizi değil',
        key
      };
    }

    const reversed = [...array].reverse();
    this.cache.set(key, reversed);

    return {
      success: true,
      key,
      length: reversed.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Dizi elemanlarını birleştir
   */
  join(key, separator = ',') {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return {
        success: false,
        error: 'Değer dizi değil',
        key
      };
    }

    return {
      success: true,
      result: array.join(separator),
      key
    };
  }

  /**
   * Diziyi dilimle
   */
  slice(key, start = 0, end) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return {
        success: false,
        error: 'Değer dizi değil',
        key
      };
    }

    const sliced = array.slice(start, end);
    return {
      success: true,
      result: sliced,
      key
    };
  }

  /**
   * Dizi içindeki değerin index'ini bul
   */
  indexOf(key, value) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return -1;
    }

    return array.indexOf(value);
  }

  /**
   * Dizi içindeki son eşleşen değerin index'ini bul
   */
  lastIndexOf(key, value) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return -1;
    }

    return array.lastIndexOf(value);
  }

  /**
   * Dizi değerlerini eşleştir
   */
  every(key, predicate) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return false;
    }

    for (let i = 0; i < array.length; i++) {
      try {
        if (!predicate(array[i], i)) {
          return false;
        }
      } catch (err) {
        return false;
      }
    }

    return true;
  }

  /**
   * Dizi değerlerinden bazıları eşleşir
   */
  some(key, predicate) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return false;
    }

    for (let i = 0; i < array.length; i++) {
      try {
        if (predicate(array[i], i)) {
          return true;
        }
      } catch (err) {
      }
    }

    return false;
  }

  /**
   * Dizi öğelerini dolaş
   */
  forEach(key, callback) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return {
        success: false,
        error: 'Değer dizi değil',
        key
      };
    }

    for (let i = 0; i < array.length; i++) {
      try {
        callback(array[i], i, array);
      } catch (err) {
      }
    }

    return {
      success: true,
      key,
      iterated: array.length
    };
  }

  /**
   * Dizi öğelerini dönüştür
   */
  mapArray(key, callback) {
    const array = this.cache.get(key);

    if (!Array.isArray(array)) {
      return {
        success: false,
        error: 'Değer dizi değil',
        key
      };
    }

    const mapped = [];
    for (let i = 0; i < array.length; i++) {
      try {
        mapped.push(callback(array[i], i, array));
      } catch (err) {
      }
    }

    return {
      success: true,
      result: mapped,
      key
    };
  }
}

export default ArrayOperations;
