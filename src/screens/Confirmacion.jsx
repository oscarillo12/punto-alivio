import { Encabezado, Contenido, Tarjeta, Boton, Icono } from '../components/ui.jsx'
import { NoEncontrado } from './DetallePunto.jsx'
import { useStore } from '../lib/store.jsx'
import { ir, reemplazar } from '../lib/navegacion.js'
import { ruta, puntoPorId, paradaPorId, fmtHora, TIPO_PARADA } from '../lib/ruta.js'

export default function Confirmacion({ id }) {
  const { estado: s } = useStore()
  const r = s.reservas.find((x) => x.id === id)
  if (!r) return <NoEncontrado />
  const p = puntoPorId(r.puntoId)
  const parada = r.paradaId && paradaPorId(r.paradaId)
  const pendiente = r.estado === 'pendiente'

  return (
    <>
      <Encabezado titulo="Reserva" atras={false} />
      <Contenido>
        <div className="py-4 text-center">
          <span className="mx-auto grid size-24 place-items-center rounded-full bg-alivio">
            <Icono n={pendiente ? 'sinSenal' : 'check'} className="size-14" />
          </span>
          <h2 className="mt-4 text-3xl font-extrabold">{pendiente ? 'Reserva guardada' : '¡Listo, sesión reservada!'}</h2>
          {pendiente && <p className="mt-2 text-lg">Estás sin señal. La guardamos en tu teléfono y se confirma sola apenas tengas señal.</p>}
        </div>

        <Tarjeta>
          <p className="text-4xl font-extrabold">Hoy, {fmtHora(r.inicio)}</p>
          <p className="mt-1 text-xl font-semibold">{p.nombre}</p>
          <p className="text-lg text-gray-600">{p.lugar}</p>
          <ul className="mt-4 space-y-2 text-lg">
            <li className="flex gap-2">
              <Icono n="reloj" className="size-6 shrink-0" /> Sesión de {r.duracion} minutos con {p.profesional}
            </li>
            {parada && (
              <li className="flex gap-2">
                <Icono n="check" className="size-6 shrink-0" /> Durante tu {TIPO_PARADA[parada.tipo]}: no pierdes tiempo de ruta
              </li>
            )}
            <li className="flex gap-2">
              <Icono n="plata" className="size-6 shrink-0" /> Sin costo para ti
            </li>
          </ul>
        </Tarjeta>

        <Tarjeta className="bg-alivio-claro">
          <h3 className="text-xl font-bold">Cuando llegues</h3>
          <p className="mt-1 text-lg">{p.indicaciones}</p>
          <p className="mt-2 text-lg">{p.estacionamiento}.</p>
        </Tarjeta>

        <p className="text-base text-gray-600">{ruta.financiamiento}.</p>

        <Boton onClick={() => reemplazar('/')} icono="inicio">
          Volver al inicio
        </Boton>
        <Boton variante="secundario" onClick={() => ir('/ejercicios')}>
          Ver ejercicios para el camino
        </Boton>
      </Contenido>
    </>
  )
}
