import { Encabezado, Contenido, Tarjeta, Boton, Icono, AvisoCalza } from '../components/ui.jsx'
import { useStore } from '../lib/store.jsx'
import { ir } from '../lib/navegacion.js'
import { ruta, estadoRuta, infoPunto, puntoPorId, fmtHora, fmtDuracion, TIPO_PUNTO } from '../lib/ruta.js'

export default function DetallePunto({ id }) {
  const { estado: s } = useStore()
  const p = puntoPorId(id)
  if (!p) return <NoEncontrado />
  const i = infoPunto(p, estadoRuta(s.minutos))

  return (
    <>
      <Encabezado titulo={p.ciudad} />
      <Contenido>
        <div>
          <span className="inline-block rounded-full bg-alivio px-3 py-1 text-base font-bold">{TIPO_PUNTO[p.tipo]}</span>
          <h2 className="mt-2 text-3xl leading-tight font-extrabold">{p.nombre}</h2>
          <p className="mt-1 text-lg text-gray-600">{p.lugar}</p>
        </div>

        <Tarjeta>
          {i.pasado ? (
            <p className="text-xl font-semibold">Ya pasaste este punto en esta ruta.</p>
          ) : i.aqui ? (
            <p className="text-xl font-semibold">Estás aquí ahora.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-3xl font-extrabold">{Math.round(i.distancia)} km</p>
                <p className="text-base text-gray-600">de distancia</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold">{fmtHora(i.llegada)}</p>
                <p className="text-base text-gray-600">llegas en {fmtDuracion(i.minutosHasta)}</p>
              </div>
            </div>
          )}
          {!i.pasado && (
            <div className="mt-4">
              <AvisoCalza info={i} />
            </div>
          )}
        </Tarjeta>

        {!i.pasado && (
          <Boton icono="calendario" onClick={() => ir(`/agendar/${p.id}`)}>
            Agendar sesión aquí
          </Boton>
        )}

        <Tarjeta>
          <dl className="space-y-4">
            <Dato icono="reloj" titulo="Horario">
              {p.horario.abre} a {p.horario.cierra === '24:00' ? 'medianoche' : p.horario.cierra} · {p.dias}
            </Dato>
            <Dato icono="calendario" titulo="Duración de la sesión">
              15 o 20 minutos, tú eliges
            </Dato>
            <Dato icono="persona" titulo="Te atiende">
              {p.profesional}
            </Dato>
            <Dato icono="camion" titulo="Dónde dejar el camión">
              {p.estacionamiento}
            </Dato>
            <Dato icono="plata" titulo="Costo">
              Sin costo para ti. {ruta.financiamiento}.
            </Dato>
          </dl>
        </Tarjeta>

        <Tarjeta>
          <h3 className="text-xl font-bold">Servicios</h3>
          <ul className="mt-3 space-y-2">
            {p.servicios.map((sv) => (
              <li key={sv} className="flex items-center gap-3 text-lg">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-alivio-claro">
                  <Icono n="check" className="size-5" />
                </span>
                {sv}
              </li>
            ))}
          </ul>
        </Tarjeta>
      </Contenido>
    </>
  )
}

function Dato({ icono, titulo, children }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-alivio-claro">
        <Icono n={icono} className="size-6" />
      </span>
      <div>
        <dt className="text-base font-semibold text-gray-600">{titulo}</dt>
        <dd className="text-lg">{children}</dd>
      </div>
    </div>
  )
}

export function NoEncontrado() {
  return (
    <>
      <Encabezado titulo="No encontrado" />
      <Contenido>
        <p className="text-xl">No encontramos lo que buscabas.</p>
        <Boton onClick={() => ir('/')}>Ir al inicio</Boton>
      </Contenido>
    </>
  )
}
