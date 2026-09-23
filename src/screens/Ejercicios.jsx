import { Encabezado, Contenido, Icono } from '../components/ui.jsx'
import { useGuardadoOffline } from '../lib/store.jsx'
import { ir } from '../lib/navegacion.js'
import { nombreZona } from '../lib/cuerpo.js'
import ejercicios from '../data/ejercicios.json'

export default function Ejercicios() {
  const guardado = useGuardadoOffline()
  return (
    <>
      <Encabezado titulo="Ejercicios" atras={false} />
      <Contenido>
        <p className="text-xl">Rutinas cortas para cuando no hay un Punto Alivio cerca.</p>
        <p className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-lg font-semibold ${guardado ? 'bg-green-100 text-green-900' : 'bg-alivio-claro'}`}>
          <Icono n={guardado ? 'check' : 'descarga'} className="size-6 shrink-0" />
          {guardado ? 'Guardadas en tu teléfono: funcionan sin señal' : 'Se guardan en tu teléfono al abrir la app'}
        </p>

        <ul className="space-y-3">
          {ejercicios.map((r) => (
            <li key={r.id}>
              <button onClick={() => ir(`/ejercicio/${r.id}`)} className="flex w-full items-center gap-4 rounded-3xl border border-black/5 bg-white p-4 text-left shadow-sm active:bg-gray-50">
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-alivio">
                  <span className="text-center leading-none">
                    <span className="block text-2xl font-extrabold">{r.minutos}</span>
                    <span className="text-sm font-semibold">min</span>
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xl leading-tight font-bold">{r.titulo}</span>
                  <span className="mt-1 block text-base text-gray-600">{r.lugar}</span>
                  <span className="mt-1 block text-base font-semibold">{r.zonas.map(nombreZona).join(' · ')}</span>
                </span>
                <Icono n="adelante" className="size-7 shrink-0 text-gray-500" />
              </button>
            </li>
          ))}
        </ul>

        <p className="flex gap-2 rounded-2xl bg-black/5 p-4 text-base">
          <Icono n="info" className="size-6 shrink-0" />
          Nunca hagas ejercicios mientras manejas. Si algo te duele fuerte, detente y coméntalo en tu próxima sesión.
        </p>
      </Contenido>
    </>
  )
}
