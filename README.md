# LizzDB - Node.js Modular Database Module Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)


## 🌟 Özellikler

- **set(key, value)** - Değer ayarla
- **get(key)** - Değer al
- **delete(key)** - Değeri sil
- **all()** - Tüm verileri al
- **allArray()** - Tüm verileri dizi olarak al
- **push(key, value)** - Dizi öğesi ekle
- **find(key, predicate)** - Dizi içinde elemanı bul
- 🔐 **AES-256 Encryption** - Otomatik veri şifreleme
- ✅ **JSON Schema Validation** - Veri yapısı doğrulama
- 💾 **Auto-Backup** - Belirli aralıklarla otomatik yedekleme
- ⚡ **Memory Cache** - Map tabanlı performans
- 📡 **Event Emitter** - set, delete, push olayları
- ⏱️ **TTL Support** - Otomatik key silme

## 🚀 Quick Start

```javascript
import { LizzDB } from 'lizz-db';

const db = new LizzDB('./data.json');
db.set('user', { name: 'John' });
const user = db.get('user');
```

## 📦 Installation

```bash
npm install lizz-db
```

## 📖 Documentation

- [API Reference](./API_REFERENCE.md)
- [Quick Start](./QUICKSTART.md)
- [Contributing](./CONTRIBUTING.md)
- [Examples](./examples/)

##  Github İstatistikleri

![Alt](https://repobeats.axiom.co/api/embed/feb257fdf3140379c1657987304fadade89db262.svg "Repobeats analytics image")

## 📄 License

MIT © 2025 lizzardxrd


