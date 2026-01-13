import { LizzDB } from '../index.js';

const db = new LizzDB('./data.json');

console.log('=== Array Operations ===');

db.set('items', []);

db.push('items', { id: 1, name: 'Item 1' });
db.push('items', { id: 2, name: 'Item 2' });
db.push('items', { id: 3, name: 'Item 3' });

console.log('Items after push:', db.get('items'));

const found = db.find('items', item => item.id === 2);
console.log('Found item with id=2:', found);

db.update('items', item => item.id === 2, item => ({
  ...item,
  name: 'Updated Item 2'
}));

console.log('Items after update:', db.get('items'));

db.unpush('items', item => item.id === 3);
console.log('Items after unpush:', db.get('items'));

console.log('\nArray operations example completed!');
