// Junta dist/ en un solo HTML que se abre con doble clic (sin servidor).
import { readFileSync, writeFileSync } from 'node:fs'

const dist = new URL('./dist/', import.meta.url)
let html = readFileSync(new URL('index.html', dist), 'utf8')

html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/, (_, f) => `<style>${readFileSync(new URL(f, dist), 'utf8')}</style>`)
html = html.replace(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"[^>]*><\/script>/, (_, f) => {
  const js = readFileSync(new URL(f, dist), 'utf8').replace(/<\/script/gi, '<\\/script')
  return `<script type="module">${js}</script>`
})
const icono = `data:image/svg+xml,${encodeURIComponent(readFileSync(new URL('icon.svg', dist), 'utf8'))}`
html = html.replace(/<link rel="manifest"[^>]*>\s*/, '').replace(/href="\.\/icon\.svg"/g, `href="${icono}"`)

const destino = new URL('../Punto-Alivio.html', import.meta.url)
writeFileSync(destino, html)
console.log('Listo:', decodeURIComponent(destino.pathname))
