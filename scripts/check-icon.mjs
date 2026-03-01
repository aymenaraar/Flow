import sharp from 'sharp';

const files = ['resources/icon-16.png', 'resources/tray-icon.png', 'resources/icon.png', 'resources/icon-32.png'];
for (const f of files) {
  try {
    const m = await sharp(f).metadata();
    console.log(`${f}: ${m.width}x${m.height}, format=${m.format}, channels=${m.channels}, hasAlpha=${m.hasAlpha}`);
  } catch(e) {
    console.log(`${f}: ERROR - ${e.message}`);
  }
}
