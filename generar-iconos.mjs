/**
 * Generador de íconos PNG para la PWA.
 * Requiere: npm install sharp   (solo para generarlos una vez)
 * Uso: node generar-iconos.mjs
 *
 * Alternativa sin instalar nada: subir public/icons/icon.svg a
 * https://realfavicongenerator.net y descargar los PNG.
 */
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const svgBuffer = readFileSync(path.join(__dirname, 'public/icons/icon.svg'))

for (const size of [192, 512]) {
    await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, `public/icons/icon-${size}.png`))
    console.log(`✓ icon-${size}.png generado`)
}

console.log('Íconos PWA listos.')
