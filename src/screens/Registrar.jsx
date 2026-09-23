import { useState } from 'react'
import { Encabezado, Contenido, Tarjeta, Boton } from '../components/ui.jsx'
import { MapaCorporal } from '../components/graficos.jsx'
import { useStore } from '../lib/store.jsx'
import { reemplazar } from '../lib/navegacion.js'
import { ZONAS, NIVELES_REGISTRO, nivel, hoyISO } from '../lib/cuerpo.js'

export default function Registrar() {
  const { dispatch } = useStore()
  const [valores, setValores] = useState({})
  const [zona, setZona] = useState(null)

  const elegir = (id, v) => setValores({ ...valores, [id]: v })

  const guardar = () => {
    const zonas = Object.fromEntries(ZONAS.map((z) => [z.id, valores[z.id] ?? 0]))
    dispatch({ type: 'registrar', registro: { id: `r${Date.now().toString(36)}`, fecha: hoyISO(), sesion: null, zonas } })
    reemplazar('/historial?guardado')
  }

  return (
    <>
      <Encabezado titulo="¿Cómo estás hoy?" />
      <Contenido>
        <p className="text-xl">Toca cada zona y marca cuánto te duele. Lo que no marques queda como “nada”.</p>

        <Tarjeta className="flex justify-center">
          <MapaCorporal
            valores={valores}
            seleccion={zona}
            onZona={(id) => {
              setZona(id)
              document.getElementById(`zona-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
            className="h-72 w-auto"
          />
        </Tarjeta>

        <ul className="space-y-3">
          {ZONAS.map((z) => {
            const actual = valores[z.id]
            return (
              <li key={z.id} id={`zona-${z.id}`} className={`rounded-2xl bg-white p-4 shadow-sm ${zona === z.id ? 'ring-4 ring-alivio' : ''}`}>
                <p className="mb-3 text-xl font-bold">{z.nombre}</p>
                <div className="grid grid-cols-4 gap-2">
                  {NIVELES_REGISTRO.map((n) => {
                    const on = actual === n.valor
                    return (
                      <button
                        key={n.valor}
                        onClick={() => {
                          setZona(z.id)
                          elegir(z.id, n.valor)
                        }}
                        aria-pressed={on}
                        className={`min-h-14 rounded-xl border-2 text-lg font-bold ${on ? 'border-carbon' : 'border-black/10 bg-gray-50'}`}
                        style={on ? { background: n.valor ? nivel(n.valor).color : '#fff' } : undefined}
                      >
                        {n.texto}
                      </button>
                    )
                  })}
                </div>
              </li>
            )
          })}
        </ul>

        <div className="sticky bottom-24 pt-2">
          <Boton icono="check" onClick={guardar} className="shadow-lg">
            Guardar registro
          </Boton>
        </div>
      </Contenido>
    </>
  )
}
