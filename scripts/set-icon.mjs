import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const rcedit = require('rcedit');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exePath = path.resolve(__dirname, '..', 'dist', 'win-unpacked', 'Flow.exe');
const icoPath = path.resolve(__dirname, '..', 'resources', 'icon.ico');

console.log('Setting icon on:', exePath);
console.log('Using icon:', icoPath);

try {
  await rcedit(exePath, {
    icon: icoPath,
    'version-string': {
      ProductName: 'Flow',
      FileDescription: 'Flow - Voice to Text',
      CompanyName: 'Flow',
      InternalName: 'Flow',
      OriginalFilename: 'Flow.exe'
    }
  });
  console.log('Icon set successfully!');
} catch (err) {
  console.error('Failed to set icon:', err);
}
