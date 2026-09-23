import { useState } from 'react'
import { Encabezado, Contenido, Tarjeta, Boton, Icono } from '../components/ui.jsx'
import { NoEncontrado } from './DetallePunto.jsx'
import { useStore } from '../lib/store.jsx'
import { ir, reemplazar } from '../lib/navegacion.js'
import { puntos, estadoRuta, infoPunto, puntoPorId, horariosDisponibles, fmtHora, TIPO_PARADA } from '../lib/ruta.js'

const DURACIONES = [
  { min: 15, titulo: '15 minutos', texto: 'Alivio localizado y estiramiento' },
  { min: 20, titulo: '20 minutos', texto: 'Recuperación más completa' },
]

export default function Agendar({ id }) {
  const { estado: s, dispatch, enLinea } = useStore()
  const [duracion, setDuracion] = useState(15)
  const [elegido, setElegido] = useState(null)
  const [verTodos, setVerTodos] = useState(false)
  const p = puntoPorId(id)
  if (!p) return <NoEncontrado />

  const e = estadoRuta(s.minutos)
  const i = infoPunto(p, e)
  const horarios = horariosDisponibles(p, duracion, e, s.reservas).filter((h) => !h.pasado)
  const calzan = horarios.filter((h) => h.calza)
  const otros = horarios.filter((h) => !h.calza)
  const sugeridos = i.parada ? calzan : otros.filter((h) => !h.ocupado).slice(0, 4)
  const resto = i.parada ? otros : otros.filter((h) => !sugeridos.includes(h))
  const alternativa = !i.parada && puntos.find((x) => x.id !== p.id && infoPunto(x, e).parada && !infoPunto(x, e).pasado)

  const cambiarDuracion = (min) => {
    setDuracion(min)
    setElegido(null)
  }

  const confirmar = () => {
    const reserva = {
      id: Date.now().toString(36),
      puntoId: p.id,
      inicio: elegido,
      duracion,
      paradaId: i.parada && calzan.some((h) => h.inicio === elegido) ? i.parada.id : null,
      estado: enLinea ? 'confirmada' : 'pendiente',
    }
    dispatch({ type: 'reservar', reserva })
    reemplazar(`/confirmacion/${reserva.id}`)
  }

  if (i.pasado) {
    return (
      <>
        <Encabezado titulo="Agendar sesión" />
        <Contenido>
          <p className="text-xl">Ya pasaste {p.nombre} en esta ruta.</p>
          <Boton onClick={() => ir('/mapa')}>Ver puntos que vienen</Boton>
        </Contenido>
      </>
    )
  }

  return (
    <>
      <Encabezado titulo="Agendar sesión" />
      <Contenido>
        <div>
          <p className="text-lg text-gray-600">Hoy en</p>
          <h2 className="text-3xl leading-tight font-extrabold">{p.nombre}</h2>
        </div>

        <section>
          <h3 className="mb-3 text-xl font-bold">1. ¿Cuánto rato?</h3>
          <div className="grid grid-cols-2 gap-3">
            {DURACIONES.map((d) => {
              const on = duracion === d.min
              return (
                <button
                  key={d.min}
                  onClick={() => cambiarDuracion(d.min)}
                  aria-pressed={on}
                  className={`relative rounded-2xl border-2 p-4 text-left ${on ? 'border-carbon bg-alivio-claro' : 'border-black/15 bg-white'}`}
                >
                  {on && (
                    <span className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-alivio">
                      <Icono n="check" className="size-5" />
                    </span>
                  )}
                  <Icono n="reloj" className="size-8" />
                  <span className="mt-2 block text-2xl font-extrabold">{d.titulo}</span>
                  <span className="block text-base text-gray-700">{d.texto}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold">2. Elige la hora</h3>
          {i.parada ? (
            <p className="mt-1 mb-3 text-lg text-gray-700">
              Estos horarios calzan con tu <strong>{TIPO_PARADA[i.parada.tipo]}</strong> ({fmtHora(i.ventana.inicio)} a {fmtHora(i.ventana.fin)}). No pierdes tiempo de ruta.
            </p>
          ) : (
            <p className="mt-1 mb-3 text-lg text-gray-700">Llegas aprox. a las {fmtHora(i.llegada)}. Estos son los horarios más cercanos a tu llegada.</p>
          )}

          <GrillaHorarios horarios={sugeridos} elegido={elegido} onElegir={setElegido} destacar={!!i.parada} />
          {sugeridos.length === 0 && (
            <p className="rounded-2xl bg-black/5 p-4 text-lg">
              {horarios.length ? 'No quedan cupos que calcen con tu parada.' : 'Este punto ya está cerrado a la hora que llegas.'}
            </p>
          )}

          {resto.length > 0 && (
            <div className="mt-4">
              <Boton variante="suave" className="text-lg" onClick={() => setVerTodos(!verTodos)}>
                {verTodos ? 'Ocultar otros horarios' : `Ver otros horarios del día (${resto.filter((h) => !h.ocupado).length})`}
              </Boton>
              {verTodos && (
                <div className="mt-3">
                  {i.parada && <p className="mb-2 text-base text-gray-600">Estos no calzan con tu parada.</p>}
                  <GrillaHorarios horarios={resto} elegido={elegido} onElegir={setElegido} />
                </div>
              )}
            </div>
          )}
        </section>

        {alternativa && (
          <Tarjeta className="bg-alivio-claro">
            <p className="text-lg">
              <strong>Consejo:</strong> en {alternativa.ciudad} la sesión calza con tu {TIPO_PARADA[infoPunto(alternativa, e).parada.tipo]}.
            </p>
            <Boton variante="secundario" className="mt-3 text-lg" onClick={() => reemplazar(`/agendar/${alternativa.id}`)}>
              Agendar en {alternativa.ciudad}
            </Boton>
          </Tarjeta>
        )}

        <div className="sticky bottom-24 pt-2">
          <Boton icono="check" disabled={elegido == null} onClick={confirmar} className="shadow-lg">
            {elegido == null ? 'Elige una hora' : `Confirmar a las ${fmtHora(elegido)}`}
          </Boton>
        </div>
      </Contenido>
    </>
  )
}

function GrillaHorarios({ horarios, elegido, onElegir, destacar = false }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {horarios.map((h) => {
        const on = elegido === h.inicio
        return (
          <button
            key={h.inicio}
            disabled={h.ocupado}
            onClick={() => onElegir(h.inicio)}
            aria-pressed={on}
            className={`relative flex min-h-18 flex-col items-center justify-center rounded-2xl border-2 text-2xl font-extrabold disabled:border-dashed disabled:bg-transparent disabled:text-gray-400 ${
              on ? 'border-carbon bg-alivio' : destacar ? 'border-alivio-oscuro bg-alivio-claro' : 'border-black/15 bg-white'
            }`}
          >
            {on && (
              <span className="absolute top-1.5 right-1.5">
                <Icono n="check" className="size-6" />
              </span>
            )}
            {fmtHora(h.inicio)}
            {h.ocupado && <span className="text-sm font-semibold">Ocupado</span>}
          </button>
        )
      })}
    </div>
  )
}
