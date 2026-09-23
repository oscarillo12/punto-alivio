// Modelo de la ruta del día: dónde va el camión, cuándo llega a cada punto
// y qué horarios de sesión calzan con sus paradas obligatorias.
import ruta from '../data/ruta.json'
import puntos from '../data/puntos.json'

export { ruta, puntos }

export const toMin = (h) => {
  const [a, b] = h.split(':').map(Number)
  return a * 60 + b
}

export const fmtHora = (m) => {
  const r = Math.round(m)
  return `${String(Math.floor(r / 60) % 24).padStart(2, '0')}:${String(r % 60).padStart(2, '0')}`
}

export const fmtDuracion = (min) => {
  const r = Math.max(0, Math.round(min))
  if (r < 60) return `${r} min`
  const h = Math.floor(r / 60)
  const m = r % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

export const TIPO_PARADA = {
  pesaje: 'pesaje',
  descanso: 'descanso obligatorio',
  carga: 'carga',
  descarga: 'descarga',
}

export const TIPO_PUNTO = {
  servicentro: 'Servicentro',
  pesaje: 'Plaza de pesaje',
  casino: 'Casino de camioneros',
  carga: 'Centro de carga y descarga',
}

const V = ruta.velocidad
const T0 = toMin(ruta.inicio.hora)
const paradas = [...ruta.paradas].sort((a, b) => a.km - b.km)

// Línea de tiempo del viaje: tramos manejando y tramos detenido.
const tramos = []
{
  let t = T0
  let k = ruta.inicio.km
  for (const p of paradas) {
    if (p.km <= k) continue
    const llega = t + ((p.km - k) / V) * 60
    tramos.push({ tipo: 'maneja', t0: t, t1: llega, k0: k, k1: p.km })
    const inicio = Math.max(llega, toMin(p.hora))
    tramos.push({ tipo: 'parada', t0: llega, t1: inicio + p.duracion, km: p.km, parada: p, inicio })
    t = inicio + p.duracion
    k = p.km
  }
  tramos.push({ tipo: 'maneja', t0: t, t1: t + ((ruta.destinoKm - k) / V) * 60, k0: k, k1: ruta.destinoKm })
}

export function estadoRuta(minutosSimulados) {
  const t = T0 + minutosSimulados
  for (const s of tramos) {
    if (t <= s.t1) {
      if (s.tipo === 'maneja') return { t, km: s.k0 + ((Math.max(t, s.t0) - s.t0) * V) / 60, parada: null }
      return { t, km: s.km, parada: s.parada, finParada: s.t1 }
    }
  }
  return { t, km: ruta.destinoKm, parada: null, llegado: true }
}

function llegadaA(km) {
  const s = tramos.find((s) => s.tipo === 'maneja' && km >= s.k0 && km <= s.k1)
  return s ? s.t0 + ((km - s.k0) / V) * 60 : null
}

const paradaEn = (km) => paradas.find((p) => Math.abs(p.km - km) <= 5) || null

function ventana(parada) {
  const s = tramos.find((s) => s.tipo === 'parada' && s.parada.id === parada.id)
  return { inicio: s.inicio, fin: s.t1 }
}

export const puntoPorId = (id) => puntos.find((p) => p.id === id)
export const paradaPorId = (id) => paradas.find((p) => p.id === id)

export const ciudadCercana = (km) =>
  ruta.ciudades.reduce((a, c) => (Math.abs(c.km - km) < Math.abs(a.km - km) ? c : a))

// Todo lo que la app necesita saber de un punto según dónde va el camión ahora.
export function infoPunto(punto, e) {
  const parada = paradaEn(punto.km)
  const vent = parada ? ventana(parada) : null
  const paradaVigente = parada && vent.fin > e.t ? parada : null
  const aqui = !!(e.parada && Math.abs(e.parada.km - punto.km) <= 5)
  const pasado = !aqui && punto.km < e.km - 1
  const llegada = aqui ? e.t : llegadaA(punto.km)
  return {
    parada: paradaVigente,
    ventana: paradaVigente ? vent : null,
    aqui,
    pasado,
    distancia: Math.max(0, punto.km - e.km),
    llegada,
    minutosHasta: llegada != null ? llegada - e.t : null,
  }
}

const hash = (s) => {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0
  return Math.abs(h)
}

// Horarios del punto para hoy. Los que caen dentro de una parada obligatoria
// se marcan como "calza": la sesión no le quita tiempo de manejo.
export function horariosDisponibles(punto, duracion, e, reservas) {
  const info = infoPunto(punto, e)
  const abre = toMin(punto.horario.abre)
  const cierra = toMin(punto.horario.cierra)
  const minimo = Math.max(e.t, info.llegada ?? e.t)
  const slots = new Map()

  if (info.ventana) {
    const desde = Math.max(info.ventana.inicio + 5, Math.ceil((e.t + 5) / 5) * 5)
    for (let m = desde, i = 0; m + duracion <= info.ventana.fin - 5; m += duracion + 5, i++) {
      if (m < abre || m + duracion > cierra) continue
      // El primer cupo de cada parada queda reservado para conductores en ruta.
      slots.set(m, { inicio: m, calza: true, ocupado: i > 0 && hash(punto.id + m) % 3 === 0 })
    }
  }
  for (let m = abre; m + duracion <= cierra; m += 20) {
    if (info.ventana && m + duracion > info.ventana.inicio && m < info.ventana.fin) continue
    if (!slots.has(m)) slots.set(m, { inicio: m, calza: false, ocupado: hash(punto.id + m) % 3 === 0 })
  }

  return [...slots.values()]
    .map((s) => ({
      ...s,
      ocupado: s.ocupado || reservas.some((r) => r.puntoId === punto.id && r.inicio === s.inicio),
      pasado: s.inicio < minimo,
    }))
    .sort((a, b) => a.inicio - b.inicio)
}
