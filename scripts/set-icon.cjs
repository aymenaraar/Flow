const { rcedit } = require('rcedit');
const path = require('path');
const fs = require('fs');

const distDir = path.resolve(__dirname, '..', 'dist', 'win-unpacked');
const exePath = path.join(distDir, 'Flow.exe');
const tempPath = path.join(distDir, 'Flow_temp.exe');
const icoPath = path.resolve(__dirname, '..', 'resources', 'icon.ico');

console.log('Copying exe to temp...');
fs.copyFileSync(exePath, tempPath);

console.log('Setting icon on temp copy...');
rcedit(tempPath, {
  icon: icoPath,
  'version-string': {
    ProductName: 'Flow',
    FileDescription: 'Flow - Voice to Text',
    CompanyName: 'Flow',
    InternalName: 'Flow',
    OriginalFilename: 'Flow.exe'
  }
}).then(() => {
  console.log('Replacing original with patched exe...');
  fs.unlinkSync(exePath);
  fs.renameSync(tempPath, exePath);
  console.log('Done! Icon set successfully.');
}).catch((err) => {
  console.error('Failed:', err.message);
  try { fs.unlinkSync(tempPath); } catch(e) {}
  process.exit(1);
});
