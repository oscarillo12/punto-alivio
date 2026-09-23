import { Encabezado, Contenido, Icono } from '../components/ui.jsx'
import { MapaRuta } from '../components/graficos.jsx'
import { useStore } from '../lib/store.jsx'
import { ir } from '../lib/navegacion.js'
import { puntos, estadoRuta, infoPunto, fmtHora, TIPO_PUNTO } from '../lib/ruta.js'

export default function Mapa() {
  const { estado: s } = useStore()
  const e = estadoRuta(s.minutos)
  const infos = Object.fromEntries(puntos.map((p) => [p.id, infoPunto(p, e)]))
  const enCamino = puntos.filter((p) => !infos[p.id].pasado)
  const pasados = puntos.filter((p) => infos[p.id].pasado)

  return (
    <>
      <Encabezado titulo="Mapa Ruta 5" atras={false} />
      <Contenido>
        <p className="flex items-center gap-2 text-base text-gray-700">
          <Icono n="descarga" className="size-5" /> Mapa guardado: funciona sin señal
        </p>
        <div className="overflow-hidden rounded-3xl border border-black/10 shadow-sm">
          <MapaRuta kmActual={e.km} infos={infos} onPunto={(id) => ir(`/punto/${id}`)} />
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-base">
          <li className="flex items-center gap-2">
            <span className="size-5 rounded-full border-2 border-carbon bg-alivio" /> Punto Alivio
          </li>
          <li className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-carbon text-white">
              <Icono n="camion" className="size-4" />
            </span>
            Tu camión
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-8 rounded bg-alivio ring-2 ring-carbon" /> Lo que te falta
          </li>
        </ul>

        <h2 className="pt-2 text-2xl font-bold">Puntos en tu camino</h2>
        <ul className="space-y-3">
          {enCamino.map((p) => (
            <FilaPunto key={p.id} p={p} i={infos[p.id]} />
          ))}
        </ul>

        {pasados.length > 0 && (
          <>
            <h2 className="pt-2 text-xl font-bold text-gray-600">Ya pasaste</h2>
            <ul className="space-y-3 opacity-70">
              {pasados.map((p) => (
                <FilaPunto key={p.id} p={p} i={infos[p.id]} />
              ))}
            </ul>
          </>
        )}
      </Contenido>
    </>
  )
}

function FilaPunto({ p, i }) {
  return (
    <li>
      <button
        onClick={() => ir(`/punto/${p.id}`)}
        className="flex w-full items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm active:bg-gray-50"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-alivio">
          <Icono n="pin" className="size-7" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xl font-bold">{p.ciudad}</span>
          <span className="block text-base text-gray-600">{TIPO_PUNTO[p.tipo]}</span>
          {!i.pasado && (
            <span className="mt-1 block text-lg font-semibold">
              {i.aqui ? 'Estás aquí' : `${Math.round(i.distancia)} km · llegas ${fmtHora(i.llegada)}`}
            </span>
          )}
          {i.parada && !i.pasado && <span className="mt-1 inline-block rounded-full bg-alivio-claro px-3 py-0.5 text-base font-semibold">✓ Calza con tu parada</span>}
        </span>
        <Icono n="adelante" className="size-7 shrink-0 text-gray-500" />
      </button>
    </li>
  )
}
