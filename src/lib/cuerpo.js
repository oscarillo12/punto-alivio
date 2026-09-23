export const ZONAS = [
  { id: 'cuello', nombre: 'Cuello', puntos: [[100, 66]] },
  { id: 'hombros', nombre: 'Hombros', puntos: [[64, 90], [136, 90]] },
  { id: 'espalda_alta', nombre: 'Espalda alta', puntos: [[100, 120]] },
  { id: 'lumbar', nombre: 'Espalda baja (lumbar)', puntos: [[100, 176]] },
  { id: 'caderas', nombre: 'Caderas', puntos: [[76, 210], [124, 210]] },
  { id: 'rodillas', nombre: 'Rodillas', puntos: [[80, 294], [120, 294]] },
]

export const nombreZona = (id) => ZONAS.find((z) => z.id === id)?.nombre ?? id

export const NIVELES_REGISTRO = [
  { valor: 0, texto: 'Nada' },
  { valor: 3, texto: 'Poco' },
  { valor: 6, texto: 'Harto' },
  { valor: 9, texto: 'Mucho' },
]

export function nivel(v) {
  if (!v) return { texto: 'Sin dolor', color: '#FFFFFF' }
  if (v <= 3) return { texto: 'Baja', color: '#F5D547' }
  if (v <= 6) return { texto: 'Media', color: '#F29A2E' }
  return { texto: 'Alta', color: '#E0483E' }
}

export function fmtFecha(iso, opciones = { day: 'numeric', month: 'long' }) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-CL', opciones)
}

export function hoyISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
