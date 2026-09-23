import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

// Genera sw.js con la lista de archivos del build, para que la app,
// el mapa y los ejercicios queden guardados y funcionen sin señal.
function serviceWorker() {
  return {
    name: 'punto-alivio-sw',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const archivos = Object.keys(bundle).filter((f) => !f.endsWith('.map') && f !== 'sw.js')
      const precache = [...new Set(['./', 'index.html', 'manifest.webmanifest', 'icon.svg', ...archivos])]
      const fuente = readFileSync(new URL('./sw-template.js', import.meta.url), 'utf8')
        .replace('[/*PRECACHE*/]', JSON.stringify(precache))
        .replace('__VERSION__', Date.now().toString(36))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: fuente })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), serviceWorker()],
})
