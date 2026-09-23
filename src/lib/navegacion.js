import { useEffect, useState } from 'react'

// Navegación simple por hash (#/mapa, #/punto/chillan). Funciona sin servidor y sin señal.
let pasos = 0

export function useRutaActual() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const cambio = () => {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', cambio)
    return () => window.removeEventListener('hashchange', cambio)
  }, [])
  const [ruta, query = ''] = (hash.replace(/^#/, '') || '/').split('?')
  return { partes: ruta.split('/').filter(Boolean), query: new URLSearchParams(query) }
}

export function ir(ruta) {
  pasos++
  window.location.hash = ruta
}

export function reemplazar(ruta) {
  window.location.replace(`#${ruta}`)
}

export function volver() {
  if (pasos > 0) {
    pasos--
    window.history.back()
  } else {
    reemplazar('/')
  }
}
