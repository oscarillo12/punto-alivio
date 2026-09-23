import { useState } from 'react'
import { EncabezadoMarca, Contenido, Tarjeta, Boton, Icono, AvisoCalza } from '../components/ui.jsx'
import { useStore } from '../lib/store.jsx'
import { ir } from '../lib/navegacion.js'
import { ruta, puntos, estadoRuta, infoPunto, ciudadCercana, puntoPorId, fmtHora, fmtDuracion, TIPO_PARADA } from '../lib/ruta.js'

export default function Inicio() {
  const { estado: s } = useStore()
  const e = estadoRuta(s.minutos)
  const conInfo = puntos.map((p) => ({ p, i: infoPunto(p, e) }))
  const aqui = conInfo.find((x) => x.i.aqui)
  const adelante = conInfo.filter((x) => !x.i.pasado && !x.i.aqui)
  const proximo = adelante[0]
  const mejor = proximo && !proximo.i.parada ? adelante.find((x) => x.i.parada) : null
  const sesiones = s.reservas.filter((r) => r.inicio + r.duracion > e.t).sort((a, b) => a.inicio - b.inicio)

  return (
    <>
      <EncabezadoMarca />
      <Contenido>
        <EstadoViaje e={e} />

        {sesiones.map((r) => (
          <SesionReservada key={r.id} r={r} />
        ))}

        {aqui && (
          <Tarjeta className="border-2 border-carbon bg-alivio">
            <p className="text-base font-bold tracking-wide uppercase">Estás en un Punto Alivio</p>
            <h2 className="mt-1 text-2xl font-extrabold">{aqui.p.nombre}</h2>
            <p className="mt-2 text-lg">
              Tu {TIPO_PARADA[e.parada.tipo]} termina a las <strong>{fmtHora(e.finParada)}</strong>. Te quedan {fmtDuracion(e.finParada - e.t)}.
            </p>
            <Boton variante="oscuro" icono="calendario" className="mt-4" onClick={() => ir(`/agendar/${aqui.p.id}`)}>
              Agendar ahora
            </Boton>
          </Tarjeta>
        )}

        {proximo ? (
          <ProximoPunto titulo="Próximo punto de alivio" x={proximo} />
        ) : (
          !aqui && (
            <Tarjeta>
              <h2 className="text-2xl font-bold">No quedan puntos en esta ruta</h2>
              <p className="mt-2 text-lg">Mientras tanto, puedes hacer una rutina corta de ejercicios.</p>
            </Tarjeta>
          )
        )}

        {mejor && <ProximoPunto titulo="Te conviene más" x={mejor} compacto />}

        <div className="grid gap-3">
          <Boton variante="secundario" icono="historial" onClick={() => ir('/registrar')}>
            Anotar cómo está mi cuerpo
          </Boton>
          <Boton variante="secundario" icono="ejercicios" onClick={() => ir('/ejercicios')}>
            Ejercicios sin punto cerca
          </Boton>
        </div>

        <ModoDemo />
      </Contenido>
    </>
  )
}

function EstadoViaje({ e }) {
  const ciudad = ciudadCercana(e.km)
  return (
    <section className="rounded-3xl bg-carbon p-5 text-white">
      <p className="text-2xl font-bold">Hola, {ruta.conductor}</p>
      <p className="mt-1 text-lg text-white/80">
        Ruta {ruta.origen} → {ruta.destino}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <Icono n="camion" className="size-7 text-alivio" />
          <p className="mt-1 text-xl font-bold">Km {Math.round(e.km)}</p>
          <p className="text-base text-white/80">{e.llegado ? 'Llegaste' : `cerca de ${ciudad.nombre}`}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <Icono n="reloj" className="size-7 text-alivio" />
          <p className="mt-1 text-xl font-bold">{fmtHora(e.t)}</p>
          <p className="text-base text-white/80">{e.parada ? `En ${TIPO_PARADA[e.parada.tipo]}` : 'Manejando'}</p>
        </div>
      </div>
    </section>
  )
}

function ProximoPunto({ titulo, x: { p, i }, compacto = false }) {
  return (
    <Tarjeta className={compacto ? '' : 'border-2 border-alivio'}>
      <p className="text-base font-bold tracking-wide text-gray-600 uppercase">{titulo}</p>
      <h2 className="mt-1 text-2xl leading-tight font-extrabold">{p.nombre}</h2>
      <p className="text-lg text-gray-600">{p.lugar}</p>

      <div className="my-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-4xl font-extrabold">{Math.round(i.distancia)} km</p>
          <p className="text-base text-gray-600">de distancia</p>
        </div>
        <div>
          <p className="text-4xl font-extrabold">{fmtDuracion(i.minutosHasta)}</p>
          <p className="text-base text-gray-600">llegas a las {fmtHora(i.llegada)}</p>
        </div>
      </div>

      <AvisoCalza info={i} />

      <div className="mt-4 grid gap-3">
        <Boton icono="calendario" onClick={() => ir(`/agendar/${p.id}`)}>
          Agendar aquí
        </Boton>
        {!compacto && (
          <Boton variante="suave" onClick={() => ir(`/punto/${p.id}`)}>
            Ver detalle del punto
          </Boton>
        )}
      </div>
    </Tarjeta>
  )
}

function SesionReservada({ r }) {
  const { dispatch } = useStore()
  const [confirmando, setConfirmando] = useState(false)
  const p = puntoPorId(r.puntoId)
  return (
    <Tarjeta className="border-2 border-carbon">
      <p className="flex items-center gap-2 text-base font-bold tracking-wide uppercase">
        <Icono n="calendario" className="size-5" /> Tu próxima sesión
      </p>
      <p className="mt-2 text-3xl font-extrabold">Hoy, {fmtHora(r.inicio)}</p>
      <p className="text-xl font-semibold">{p.nombre}</p>
      <p className="text-lg text-gray-600">Sesión de {r.duracion} minutos</p>
      <p className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-base font-semibold ${r.estado === 'pendiente' ? 'bg-alivio-claro' : 'bg-green-100 text-green-900'}`}>
        <Icono n={r.estado === 'pendiente' ? 'sinSenal' : 'check'} className="size-5" />
        {r.estado === 'pendiente' ? 'Se confirma cuando tengas señal' : 'Confirmada'}
      </p>
      {confirmando ? (
        <div className="mt-4 rounded-2xl bg-black/5 p-3">
          <p className="mb-3 text-lg font-semibold">¿Seguro que quieres cancelar esta sesión?</p>
          <div className="grid grid-cols-2 gap-3">
            <Boton variante="oscuro" onClick={() => dispatch({ type: 'cancelar', id: r.id })}>
              Sí, cancelar
            </Boton>
            <Boton variante="secundario" onClick={() => setConfirmando(false)}>
              No
            </Boton>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Boton variante="suave" onClick={() => ir(`/punto/${p.id}`)}>
            Ver punto
          </Boton>
          <Boton variante="suave" onClick={() => setConfirmando(true)}>
            Cancelar
          </Boton>
        </div>
      )}
    </Tarjeta>
  )
}

function ModoDemo() {
  const { estado: s, dispatch } = useStore()
  return (
    <section className="mt-6 rounded-3xl border-2 border-dashed border-black/20 p-4">
      <p className="text-base font-bold tracking-wide text-gray-600 uppercase">Modo demostración (beta)</p>
      <p className="mt-1 text-base text-gray-600">Para probar el prototipo: avanza el viaje o simula un tramo sin señal.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Boton variante="suave" className="text-lg" onClick={() => dispatch({ type: 'avanzar', minutos: 30 })}>
          Avanzar 30 min
        </Boton>
        <Boton variante="suave" className="text-lg" onClick={() => dispatch({ type: 'senal' })}>
          {s.sinSenalSimulada ? 'Volver a señal' : 'Simular sin señal'}
        </Boton>
      </div>
      <Boton variante="suave" icono="repetir" className="mt-3 text-lg" onClick={() => dispatch({ type: 'reiniciar' })}>
        Reiniciar demostración
      </Boton>
    </section>
  )
}
