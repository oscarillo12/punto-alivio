import { useEffect, useState } from 'react'
import { Encabezado, Contenido, Tarjeta, Boton, Icono } from '../components/ui.jsx'
import { NoEncontrado } from './DetallePunto.jsx'
import { ir } from '../lib/navegacion.js'
import ejercicios from '../data/ejercicios.json'

const puedeHablar = typeof window !== 'undefined' && 'speechSynthesis' in window

function leer(texto) {
  if (!puedeHablar) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(texto)
  u.lang = 'es-CL'
  u.rate = 0.9
  window.speechSynthesis.speak(u)
}

export default function Rutina({ id }) {
  const rutina = ejercicios.find((r) => r.id === id)
  const [paso, setPaso] = useState(0)
  const [restante, setRestante] = useState(rutina?.pasos[0].segundos ?? 0)
  const [corriendo, setCorriendo] = useState(false)

  useEffect(() => {
    if (!corriendo) return
    const t = setInterval(() => setRestante((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(t)
  }, [corriendo])

  useEffect(() => {
    if (restante === 0 && corriendo) {
      setCorriendo(false)
      navigator.vibrate?.([300, 150, 300])
    }
  }, [restante, corriendo])

  useEffect(() => () => puedeHablar && window.speechSynthesis.cancel(), [])

  if (!rutina) return <NoEncontrado />
  const terminado = paso >= rutina.pasos.length
  const actual = rutina.pasos[paso]

  const irAPaso = (n) => {
    setPaso(n)
    setCorriendo(false)
    setRestante(rutina.pasos[n]?.segundos ?? 0)
    if (puedeHablar) window.speechSynthesis.cancel()
  }

  if (terminado) {
    return (
      <>
        <Encabezado titulo={rutina.titulo} />
        <Contenido>
          <div className="py-6 text-center">
            <span className="mx-auto grid size-24 place-items-center rounded-full bg-alivio">
              <Icono n="check" className="size-14" />
            </span>
            <h2 className="mt-4 text-3xl font-extrabold">¡Bien hecho!</h2>
            <p className="mt-2 text-xl">Terminaste la rutina. Tu cuerpo te lo va a agradecer en el camino.</p>
          </div>
          <Boton icono="historial" onClick={() => ir('/registrar')}>
            Anotar cómo me siento
          </Boton>
          <Boton variante="secundario" onClick={() => irAPaso(0)}>
            Repetir rutina
          </Boton>
        </Contenido>
      </>
    )
  }

  const total = actual.segundos
  const progreso = 1 - restante / total

  return (
    <>
      <Encabezado titulo={rutina.titulo} />
      <Contenido>
        <p className="text-lg text-gray-600">{rutina.lugar}</p>

        <div className="flex gap-1.5" aria-label={`Paso ${paso + 1} de ${rutina.pasos.length}`}>
          {rutina.pasos.map((_, k) => (
            <span key={k} className={`h-2.5 flex-1 rounded-full ${k < paso ? 'bg-carbon' : k === paso ? 'bg-alivio-oscuro' : 'bg-black/10'}`} />
          ))}
        </div>

        <Tarjeta>
          <p className="text-lg font-semibold text-gray-600">
            Paso {paso + 1} de {rutina.pasos.length}
          </p>
          <h2 className="mt-1 text-3xl leading-tight font-extrabold">{actual.titulo}</h2>
          <p className="mt-3 text-xl leading-relaxed">{actual.texto}</p>
          {puedeHablar && (
            <Boton variante="suave" icono="parlante" className="mt-4 text-lg" onClick={() => leer(`${actual.titulo}. ${actual.texto}`)}>
              Leer en voz alta
            </Boton>
          )}
        </Tarjeta>

        <div className="flex flex-col items-center py-2">
          <div className="relative grid size-44 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#E6E6E2" strokeWidth="10" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="#F5D547" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${progreso * 276.5} 276.5`} />
            </svg>
            <span className="text-5xl font-extrabold tabular-nums" aria-live="polite">
              {Math.floor(restante / 60)}:{String(restante % 60).padStart(2, '0')}
            </span>
          </div>
        </div>

        {restante === 0 ? (
          <Boton icono="flecha" onClick={() => irAPaso(paso + 1)}>
            {paso + 1 < rutina.pasos.length ? 'Siguiente paso' : 'Terminar'}
          </Boton>
        ) : (
          <Boton
            variante={corriendo ? 'oscuro' : 'primario'}
            icono={corriendo ? 'pausa' : 'play'}
            onClick={() => {
              if (!corriendo && restante === total) leer(`${actual.titulo}. ${actual.texto}`)
              setCorriendo(!corriendo)
            }}
          >
            {corriendo ? 'Pausar' : restante === total ? 'Empezar' : 'Seguir'}
          </Boton>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Boton variante="suave" className="text-lg" disabled={paso === 0} onClick={() => irAPaso(paso - 1)}>
            Anterior
          </Boton>
          <Boton variante="suave" className="text-lg" onClick={() => irAPaso(paso + 1)}>
            Saltar paso
          </Boton>
        </div>
      </Contenido>
    </>
  )
}
