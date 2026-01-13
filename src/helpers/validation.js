/**
 * SchemaValidator: JSON Schema Validation
 */
export class SchemaValidator {
  constructor() {}

 
  validateSchema(data, schema) {
    if (!schema) {
      return { valid: true, errors: [] };
    }

    const errors = [];

    
    if (schema.type) {
      if (!this.checkType(data, schema.type)) {
        errors.push(`Tür uyuşmuyor. Beklenen: ${schema.type}, Alınan: ${typeof data}`);
      }
    }

   
    if (schema.required && typeof data === 'object' && !Array.isArray(data)) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Gerekli alan eksik: ${field}`);
        }
      }
    }

   
    if (schema.properties && typeof data === 'object' && !Array.isArray(data)) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in data) {
          const propErrors = this.validateSchema(data[key], propSchema);
          if (!propErrors.valid) {
            errors.push(`${key} alanında: ${propErrors.errors.join(', ')}`);
          }
        }
      }
    }

    
    if (schema.items && Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const itemErrors = this.validateSchema(data[i], schema.items);
        if (!itemErrors.valid) {
          errors.push(`Dizi öğesi [${i}]: ${itemErrors.errors.join(', ')}`);
        }
      }
    }

   
    if (schema.minLength && typeof data === 'string' && data.length < schema.minLength) {
      errors.push(`Minimum uzunluk: ${schema.minLength}`);
    }

    if (schema.maxLength && typeof data === 'string' && data.length > schema.maxLength) {
      errors.push(`Maksimum uzunluk: ${schema.maxLength}`);
    }

    
    if (schema.minimum !== undefined && typeof data === 'number' && data < schema.minimum) {
      errors.push(`Minimum değer: ${schema.minimum}`);
    }

    if (schema.maximum !== undefined && typeof data === 'number' && data > schema.maximum) {
      errors.push(`Maksimum değer: ${schema.maximum}`);
    }

   
    if (schema.enum && !schema.enum.includes(data)) {
      errors.push(`Değer şu seçeneklerden biri olmalı: ${schema.enum.join(', ')}`);
    }

    
    if (schema.pattern && typeof data === 'string') {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(data)) {
        errors.push(`Değer pattern'e uymuyor: ${schema.pattern}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

 
  checkType(data, type) {
    if (type === 'null') return data === null;
    if (type === 'boolean') return typeof data === 'boolean';
    if (type === 'number') return typeof data === 'number';
    if (type === 'string') return typeof data === 'string';
    if (type === 'array') return Array.isArray(data);
    if (type === 'object') return typeof data === 'object' && !Array.isArray(data);
    if (Array.isArray(type)) {
      return type.some(t => this.checkType(data, t));
    }
    return true;
  }

  
  validateBatch(dataArray, schema) {
    return dataArray.map((data, index) => ({
      index,
      ...this.validateSchema(data, schema)
    }));
  }
}

export default SchemaValidator;
