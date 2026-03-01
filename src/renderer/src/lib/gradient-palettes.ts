/**
 * Random gradient palettes used across visual animations.
 * ALL colors are light pastels — every channel is 160+ (hex A0+)
 * to guarantee soft, airy tones with no dark colors.
 *
 * Each palette loops: the last color matches the first so that
 * moving/cycling gradients wrap seamlessly without "explosions".
 */

export interface GradientPalette {
  name: string
  colors: string[] // 4-5 pastel color stops; last = first for seamless looping
}

const palettes: GradientPalette[] = [
  // Pinks & Roses
  { name: 'rosewater', colors: ['#FFD1DC', '#FFC4D6', '#FFB7CE', '#FFACE4', '#FFD1DC'] },
  { name: 'blush', colors: ['#FFE0EC', '#FFC8DD', '#FFB3D0', '#FFCCE0', '#FFE0EC'] },
  { name: 'petalsoft', colors: ['#FFDDE6', '#FFCAD4', '#FFB8C6', '#FFD0DA', '#FFDDE6'] },
  { name: 'bubblegum', colors: ['#FFC6D9', '#FFB0CC', '#FFA3C2', '#FFBBCF', '#FFC6D9'] },

  // Lavenders & Purples
  { name: 'lavender', colors: ['#E8D5F5', '#DCC8F0', '#D0BBEB', '#DDCAF2', '#E8D5F5'] },
  { name: 'wisteria', colors: ['#E5D0F0', '#D8C0E8', '#CBB0E0', '#D5BDE5', '#E5D0F0'] },
  { name: 'lilac', colors: ['#F0E0FF', '#E5D0F8', '#DAC0F0', '#E2CDF5', '#F0E0FF'] },
  { name: 'orchid', colors: ['#F3D5F7', '#ECC5F0', '#E4B5E8', '#ECCDF2', '#F3D5F7'] },

  // Blues & Sky
  { name: 'skyblue', colors: ['#D0E8FF', '#C0DEFF', '#B0D4FF', '#C4DFFF', '#D0E8FF'] },
  { name: 'babyblue', colors: ['#CCE5FF', '#BBDDFF', '#AAD4FF', '#BFDEFF', '#CCE5FF'] },
  { name: 'cloudmist', colors: ['#D6EAFF', '#C8E0FF', '#BAD6FF', '#C8E0FF', '#D6EAFF'] },
  { name: 'iceberg', colors: ['#D5F0FF', '#C5EAFF', '#B5E4FF', '#C8ECFF', '#D5F0FF'] },

  // Mints & Greens
  { name: 'mintcream', colors: ['#C8F7DC', '#B8F0D0', '#A8E8C4', '#B8F0D0', '#C8F7DC'] },
  { name: 'seafoam', colors: ['#D0F5E0', '#C0EDD4', '#B0E5C8', '#C0EDD4', '#D0F5E0'] },
  { name: 'pistachio', colors: ['#D4F0C8', '#C8E8BC', '#BCE0B0', '#C8E8BC', '#D4F0C8'] },
  { name: 'springdew', colors: ['#CCF5D5', '#BCEDD0', '#ACE5C5', '#BCEDD0', '#CCF5D5'] },

  // Peaches & Oranges
  { name: 'peach', colors: ['#FFE0CC', '#FFD4BB', '#FFC8AA', '#FFD4BB', '#FFE0CC'] },
  { name: 'apricot', colors: ['#FFDDC5', '#FFD0B5', '#FFC3A5', '#FFD0B5', '#FFDDC5'] },
  { name: 'cantaloupe', colors: ['#FFE5D0', '#FFDAC0', '#FFCFB0', '#FFDAC0', '#FFE5D0'] },
  { name: 'creamsicle', colors: ['#FFE8D6', '#FFDEC8', '#FFD4BA', '#FFDEC8', '#FFE8D6'] },

  // Yellows & Golds
  { name: 'buttercup', colors: ['#FFF5CC', '#FFEEBB', '#FFE7AA', '#FFEEBB', '#FFF5CC'] },
  { name: 'lemon', colors: ['#FFF8D6', '#FFF2C4', '#FFECB2', '#FFF2C4', '#FFF8D6'] },
  { name: 'honeydew', colors: ['#FFFADC', '#FFF4CA', '#FFEEB8', '#FFF4CA', '#FFFADC'] },
  { name: 'sunshine', colors: ['#FFF3C8', '#FFEDB8', '#FFE7A8', '#FFEDB8', '#FFF3C8'] },

  // Multi-color combos (all pastel)
  { name: 'rainbow-soft', colors: ['#FFD1DC', '#E8D5F5', '#D0E8FF', '#C8F7DC', '#FFD1DC'] },
  { name: 'cotton-candy', colors: ['#FFC8DD', '#D0BBEB', '#B0D4FF', '#FFC8DD'] },
  { name: 'unicorn', colors: ['#F0E0FF', '#D0E8FF', '#C8F7DC', '#FFE0CC', '#F0E0FF'] },
  { name: 'fairy-dust', colors: ['#FFE0EC', '#E5D0F0', '#CCE5FF', '#D0F5E0', '#FFE0EC'] },
  { name: 'marshmallow', colors: ['#FFDDE6', '#F3D5F7', '#D6EAFF', '#C8F7DC', '#FFDDE6'] },
  { name: 'sherbet', colors: ['#FFE5D0', '#FFDDE6', '#E8D5F5', '#D0E8FF', '#FFE5D0'] },
  { name: 'dreamscape', colors: ['#F0E0FF', '#FFD1DC', '#FFF5CC', '#C8F7DC', '#F0E0FF'] },
  { name: 'stardust', colors: ['#D5F0FF', '#E5D0F0', '#FFE0EC', '#D0F5E0', '#D5F0FF'] },
  { name: 'sorbet', colors: ['#FFC6D9', '#FFE0CC', '#FFF5CC', '#C8F7DC', '#FFC6D9'] },
  { name: 'seashell', colors: ['#FFE8D6', '#FFDDE6', '#E5D0F0', '#D6EAFF', '#FFE8D6'] },
  { name: 'aurora-pastel', colors: ['#D0E8FF', '#C8F7DC', '#FFF8D6', '#FFD1DC', '#D0E8FF'] },
  { name: 'twilight-soft', colors: ['#E8D5F5', '#D0E8FF', '#C8F7DC', '#E8D5F5'] },
  { name: 'blossom', colors: ['#FFD1DC', '#FFC8DD', '#E5D0F0', '#FFD1DC'] },
  { name: 'cloud-nine', colors: ['#D6EAFF', '#D5F0FF', '#E8D5F5', '#D6EAFF'] },
  { name: 'rose-gold', colors: ['#FFE0EC', '#FFE5D0', '#FFF5CC', '#FFE0EC'] },
  { name: 'pastel-sunset', colors: ['#FFD1DC', '#FFE0CC', '#FFF5CC', '#FFD1DC'] },
  { name: 'ocean-breeze', colors: ['#D0E8FF', '#C8F7DC', '#D5F0FF', '#D0E8FF'] },
  { name: 'sakura', colors: ['#FFD1DC', '#FFDDE6', '#F0E0FF', '#FFDDE6', '#FFD1DC'] },
  { name: 'candy-floss', colors: ['#FFB8C6', '#E5D0F0', '#B0D4FF', '#FFB8C6'] },
  { name: 'morning-mist', colors: ['#D6EAFF', '#D0F5E0', '#FFF8D6', '#FFE0EC', '#D6EAFF'] },
  { name: 'frosting', colors: ['#FFC8DD', '#D5F0FF', '#D4F0C8', '#FFC8DD'] },
  { name: 'petal-rain', colors: ['#FFACE4', '#E5D0F0', '#D0E8FF', '#C8F7DC', '#FFACE4'] },
]

/** Pick a random palette */
export function randomPalette(): GradientPalette {
  return palettes[Math.floor(Math.random() * palettes.length)]
}

/**
 * Given a palette and a normalized position (0→1), return an interpolated CSS rgba color.
 * Position wraps seamlessly because palettes loop (first color = last color).
 */
export function samplePalette(palette: GradientPalette, position: number, alpha: number): string {
  const colors = palette.colors
  // Wrap position to 0-1
  let t = position % 1
  if (t < 0) t += 1

  const idx = t * (colors.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.min(lo + 1, colors.length - 1)
  const frac = idx - lo

  const c1 = hexToRgb(colors[lo])
  const c2 = hexToRgb(colors[hi])

  const r = Math.round(c1.r + (c2.r - c1.r) * frac)
  const g = Math.round(c1.g + (c2.g - c1.g) * frac)
  const b = Math.round(c1.b + (c2.b - c1.b) * frac)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Like samplePalette but returns individual r,g,b values.
 */
export function samplePaletteRgb(
  palette: GradientPalette,
  position: number
): { r: number; g: number; b: number } {
  const colors = palette.colors
  let t = position % 1
  if (t < 0) t += 1

  const idx = t * (colors.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.min(lo + 1, colors.length - 1)
  const frac = idx - lo

  const c1 = hexToRgb(colors[lo])
  const c2 = hexToRgb(colors[hi])

  return {
    r: Math.round(c1.r + (c2.r - c1.r) * frac),
    g: Math.round(c1.g + (c2.g - c1.g) * frac),
    b: Math.round(c1.b + (c2.b - c1.b) * frac)
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16)
  }
}
