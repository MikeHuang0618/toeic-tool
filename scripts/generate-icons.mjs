import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

// Full-bleed variant of public/favicon.svg; launchers apply their own mask.
const icon = (cornerRadius) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4da3ff"/>
      <stop offset="1" stop-color="#0a5ad4"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="${cornerRadius}" fill="url(#g)"/>
  <rect x="212" y="292" width="600" height="440" rx="48" fill="#ffffff"/>
  <path d="M352 512l110 110 210-220" stroke="#34c759" stroke-width="64" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const outDir = new URL('../public/icons/', import.meta.url).pathname
await mkdir(outDir, { recursive: true })

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-512-maskable.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
]

for (const { file, size } of targets) {
  await sharp(Buffer.from(icon(0))).resize(size, size).png().toFile(outDir + file)
  console.log('generated', file)
}
