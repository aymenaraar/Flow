import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

async function main() {
  const svgBuffer = readFileSync(join(rootDir, 'resources', 'icon.svg'))

  // Generate PNGs at various sizes
  const sizes = [16, 32, 48, 64, 128, 256]
  const pngBuffers = {}

  for (const size of sizes) {
    const png = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer()
    pngBuffers[size] = png
    writeFileSync(join(rootDir, 'resources', `icon-${size}.png`), png)
    console.log(`Generated icon-${size}.png`)
  }

  // Main icon.png at 256
  writeFileSync(join(rootDir, 'resources', 'icon.png'), pngBuffers[256])
  console.log('Generated icon.png (256x256)')

  // Generate ICO (Windows) from multiple sizes
  const icoSizes = [16, 32, 48, 64, 128, 256].map(s => pngBuffers[s])
  const ico = await pngToIco(icoSizes)
  writeFileSync(join(rootDir, 'resources', 'icon.ico'), ico)
  console.log('Generated icon.ico')

  // Tray icon — 16x16 PNG
  writeFileSync(join(rootDir, 'resources', 'tray-icon.png'), pngBuffers[16])
  console.log('Generated tray-icon.png (16x16)')

  console.log('Done!')
}

main().catch(console.error)
