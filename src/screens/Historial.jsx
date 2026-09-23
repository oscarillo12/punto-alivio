import { useState } from 'react'
import { Encabezado, Contenido, Tarjeta, Boton, Icono } from '../components/ui.jsx'
import { MapaCorporal, LeyendaDolor, GraficoEvolucion } from '../components/graficos.jsx'
import { useStore } from '../lib/store.jsx'
import { ir } from '../lib/navegacion.js'
import { ZONAS, nivel, nombreZona, fmtFecha } from '../lib/cuerpo.js'

export default function Historial({ guardado }) {
  const { estado: s } = useStore()
  const [vista, setVista] = useState('cuerpo')
  const [zona, setZona] = useState('lumbar')
  const registros = [...s.registros].sort((a, b) => a.fecha.localeCompare(b.fecha))
  const ultimo = registros.at(-1)

  const verEvolucion = (z) => {
    setZona(z)
    setVista('evolucion')
  }

  return (
    <>
      <Encabezado titulo="Mi cuerpo" atras={false} />
      <Contenido>
        {guardado && (
          <p role="status" className="flex items-center gap-2 rounded-2xl bg-green-100 px-4 py-3 text-lg font-semibold text-green-900">
            <Icono n="check" className="size-6" /> Registro guardado
          </p>
        )}

        <Boton icono="historial" onClick={() => ir('/registrar')}>
          Anotar cómo me siento hoy
        </Boton>

        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-black/5 p-1" role="tablist">
          {[
            ['cuerpo', 'Zonas de dolor'],
            ['evolucion', 'Evolución'],
          ].map(([id, texto]) => (
            <button
              key={id}
              role="tab"
              aria-selected={vista === id}
              onClick={() => setVista(id)}
              className={`min-h-14 rounded-xl text-lg font-bold ${vista === id ? 'bg-alivio shadow-sm' : 'text-gray-700'}`}
            >
              {texto}
            </button>
          ))}
        </div>

        {!ultimo ? (
          <p className="text-lg">Todavía no tienes registros.</p>
        ) : vista === 'cuerpo' ? (
          <VistaCuerpo ultimo={ultimo} onZona={verEvolucion} />
        ) : (
          <VistaEvolucion registros={registros} zona={zona} setZona={setZona} />
        )}
      </Contenido>
    </>
  )
}

function VistaCuerpo({ ultimo, onZona }) {
  const ordenadas = [...ZONAS].sort((a, b) => (ultimo.zonas[b.id] ?? 0) - (ultimo.zonas[a.id] ?? 0))
  return (
    <>
      <Tarjeta>
        <h2 className="text-xl font-bold">Tu último registro</h2>
        <p className="text-lg text-gray-600">
          {fmtFecha(ultimo.fecha)}
          {ultimo.sesion ? ` · ${ultimo.sesion}` : ''}
        </p>
        <div className="mt-3 flex items-center gap-4">
          <MapaCorporal valores={ultimo.zonas} onZona={onZona} className="h-80 w-auto shrink-0" />
          <LeyendaDolor />
        </div>
        <p className="mt-2 text-center text-base text-gray-500">Vista de espalda · toca una zona para ver cómo ha cambiado</p>
      </Tarjeta>

      <ul className="space-y-2">
        {ordenadas.map((z) => {
          const v = ultimo.zonas[z.id] ?? 0
          const n = nivel(v)
          return (
            <li key={z.id}>
              <button onClick={() => onZona(z.id)} className="flex min-h-16 w-full items-center gap-3 rounded-2xl bg-white px-4 text-left shadow-sm active:bg-gray-50">
                <span className="size-6 shrink-0 rounded-full border border-black/15" style={{ background: n.color }} />
                <span className="flex-1 text-lg font-semibold">{z.nombre}</span>
                <span className="text-lg text-gray-700">
                  {v}/10 · {n.texto}
                </span>
                <Icono n="adelante" className="size-6 text-gray-400" />
              </button>
            </li>
          )
        })}
      </ul>
      <p className="flex gap-2 rounded-2xl bg-black/5 p-4 text-base">
        <Icono n="info" className="size-6 shrink-0" />
        Tu kinesiólogo ve este historial antes de cada sesión, así sabe dónde trabajar sin partir de cero.
      </p>
    </>
  )
}

function VistaEvolucion({ registros, zona, setZona }) {
  const datos = registros.map((r) => ({ fecha: r.fecha, valor: r.zonas[zona] ?? 0 }))
  const primero = datos[0]
  const ultimo = datos.at(-1)
  const diferencia = ultimo.valor - primero.valor

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {ZONAS.map((z) => (
          <button
            key={z.id}
            onClick={() => setZona(z.id)}
            aria-pressed={zona === z.id}
            className={`min-h-12 rounded-full border-2 px-4 text-base font-semibold ${zona === z.id ? 'border-carbon bg-alivio' : 'border-black/15 bg-white'}`}
          >
            {z.nombre}
          </button>
        ))}
      </div>

      <Tarjeta>
        <h2 className="text-xl font-bold">{nombreZona(zona)}</h2>
        <p className="text-base text-gray-600">Dolor de 0 (nada) a 10 (mucho)</p>
        <div className="mt-2">
          <GraficoEvolucion datos={datos} />
        </div>
        <p className="mt-3 rounded-2xl bg-alivio-claro p-4 text-lg">
          {datos.length < 2
            ? 'Con más registros vas a ver cómo cambia tu dolor.'
            : diferencia < 0
              ? `Bajó de ${primero.valor} a ${ultimo.valor} desde el ${fmtFecha(primero.fecha)}. ¡Vas bien!`
              : diferencia > 0
                ? `Subió de ${primero.valor} a ${ultimo.valor} desde el ${fmtFecha(primero.fecha)}. Coméntalo en tu próxima sesión.`
                : `Se ha mantenido en ${ultimo.valor} desde el ${fmtFecha(primero.fecha)}.`}
        </p>
      </Tarjeta>

      <h3 className="pt-2 text-xl font-bold">Registros</h3>
      <ul className="space-y-2">
        {[...registros].reverse().map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
            <span>
              <span className="block text-lg font-semibold">{fmtFecha(r.fecha)}</span>
              <span className="block text-base text-gray-600">{r.sesion ?? 'Sin sesión'}</span>
            </span>
            <span className="text-xl font-bold">{r.zonas[zona] ?? 0}/10</span>
          </li>
        ))}
      </ul>
    </>
  )
}
