import fs from 'fs';
const buf = fs.readFileSync('resources/icon.ico');
console.log('Size:', buf.length, 'bytes');
console.log('Header (hex):', buf.slice(0, 6).toString('hex'));
// ICO header: 00 00 01 00 XX 00 (reserved=0, type=1=ICO, count=XX)
const reserved = buf.readUInt16LE(0);
const type = buf.readUInt16LE(2);
const count = buf.readUInt16LE(4);
console.log('Reserved:', reserved, '(should be 0)');
console.log('Type:', type, '(should be 1 for ICO)');
console.log('Image count:', count);
