/**
 * CRUDOperations: Create, Read, Update, Delete işlemleri
 */
export class CRUDOperations {
  constructor(cache, validator, backup) {
    this.cache = cache;
    this.validator = validator;
    this.backup = backup;
  }

 
  set(key, value, schema = null) {
  
    if (schema) {
      const validation = this.validator.validateSchema(value, schema);
      if (!validation.valid) {
        throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
      }
    }

    
    this.cache.set(key, value);
    
    return {
      success: true,
      key,
      value,
      timestamp: new Date().toISOString()
    };
  }

  
  get(key, defaultValue = undefined) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    return defaultValue;
  }

 
  has(key) {
    return this.cache.has(key);
  }

  
  delete(key) {
    const existed = this.cache.has(key);
    
    if (existed) {
      this.cache.delete(key);
    }

    return {
      success: existed,
      key,
      deleted: existed,
      timestamp: new Date().toISOString()
    };
  }

  
  all() {
    const result = {};
    for (const [key, value] of this.cache.entries()) {
      result[key] = value;
    }
    return result;
  }

  
  allArray() {
    const result = [];
    for (const [key, value] of this.cache.entries()) {
      result.push({
        key,
        value
      });
    }
    return result;
  }

 
  keys() {
    return Array.from(this.cache.keys());
  }

  
  values() {
    return Array.from(this.cache.values());
  }

  
  size() {
    return this.cache.size;
  }

  
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    return {
      success: true,
      cleared: size,
      timestamp: new Date().toISOString()
    };
  }

 
  findByPredicate(predicate) {
    const results = [];
    
    for (const [key, value] of this.cache.entries()) {
      try {
        if (predicate(value, key)) {
          results.push({
            key,
            value
          });
        }
      } catch (err) {
      }
    }

    return results;
  }

 
  findOne(predicate) {
    for (const [key, value] of this.cache.entries()) {
      try {
        if (predicate(value, key)) {
          return {
            key,
            value
          };
        }
      } catch (err) {
        
      }
    }

    return null;
  }

 
  filter(predicate) {
    return this.findByPredicate(predicate);
  }

  
  map(callback) {
    const results = [];
    
    for (const [key, value] of this.cache.entries()) {
      try {
        results.push(callback(value, key));
      } catch (err) {
      }
    }

    return results;
  }

  
  batch(operations) {
    const results = [];
    const errors = [];

    for (const op of operations) {
      try {
        let result;

        switch (op.type) {
          case 'set':
            result = this.set(op.key, op.value, op.schema);
            break;
          case 'delete':
            result = this.delete(op.key);
            break;
          case 'get':
            result = {
              key: op.key,
              value: this.get(op.key),
              type: 'get'
            };
            break;
          default:
            throw new Error(`Unknown operation type: ${op.type}`);
        }

        results.push(result);
      } catch (err) {
        errors.push({
          operation: op,
          error: err.message
        });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  
  exportJSON() {
    return JSON.stringify(this.all(), null, 2);
  }

  
  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      for (const [key, value] of Object.entries(data)) {
        this.set(key, value);
      }

      return {
        success: true,
        imported: Object.keys(data).length,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }
}

export default CRUDOperations;
