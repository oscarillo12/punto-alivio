import { createContext, useContext, useEffect, useReducer, useState } from 'react'
import historialInicial from '../data/historial.json'

const CLAVE = 'punto-alivio-beta-v1'
const Contexto = createContext(null)

const inicial = () => ({ minutos: 0, sinSenalSimulada: false, reservas: [], registros: historialInicial })

function cargar() {
  try {
    const raw = localStorage.getItem(CLAVE)
    if (raw) return { ...inicial(), ...JSON.parse(raw) }
  } catch {
    // Sin almacenamiento disponible: se parte de cero.
  }
  return inicial()
}

function reducer(s, a) {
  switch (a.type) {
    case 'avanzar':
      return { ...s, minutos: s.minutos + a.minutos }
    case 'reservar':
      return { ...s, reservas: [...s.reservas, a.reserva] }
    case 'cancelar':
      return { ...s, reservas: s.reservas.filter((r) => r.id !== a.id) }
    case 'sincronizar':
      return { ...s, reservas: s.reservas.map((r) => (r.estado === 'pendiente' ? { ...r, estado: 'confirmada' } : r)) }
    case 'registrar':
      return { ...s, registros: [...s.registros, a.registro] }
    case 'senal':
      return { ...s, sinSenalSimulada: !s.sinSenalSimulada }
    case 'reiniciar':
      return inicial()
    default:
      return s
  }
}

function useConexion() {
  const [enLinea, setEnLinea] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setEnLinea(true)
    const off = () => setEnLinea(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return enLinea
}

export function StoreProvider({ children }) {
  const [estado, dispatch] = useReducer(reducer, undefined, cargar)
  const enLinea = useConexion() && !estado.sinSenalSimulada
  const hayPendientes = estado.reservas.some((r) => r.estado === 'pendiente')

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      // Si no se puede guardar, la app sigue funcionando en memoria.
    }
  }, [estado])

  // Las reservas hechas sin señal se envían apenas vuelve la conexión.
  useEffect(() => {
    if (!enLinea || !hayPendientes) return
    const t = setTimeout(() => dispatch({ type: 'sincronizar' }), 1500)
    return () => clearTimeout(t)
  }, [enLinea, hayPendientes])

  return <Contexto.Provider value={{ estado, dispatch, enLinea }}>{children}</Contexto.Provider>
}

export const useStore = () => useContext(Contexto)

export function useGuardadoOffline() {
  const [listo, setListo] = useState(false)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.getRegistration().then((r) => r?.active && setListo(true))
    navigator.serviceWorker.ready.then(() => setListo(true))
  }, [])
  return listo
}
