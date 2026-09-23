import { BarraInferior } from './components/ui.jsx'
import { useRutaActual } from './lib/navegacion.js'
import Inicio from './screens/Inicio.jsx'
import Mapa from './screens/Mapa.jsx'
import DetallePunto from './screens/DetallePunto.jsx'
import Agendar from './screens/Agendar.jsx'
import Confirmacion from './screens/Confirmacion.jsx'
import Historial from './screens/Historial.jsx'
import Registrar from './screens/Registrar.jsx'
import Ejercicios from './screens/Ejercicios.jsx'
import Rutina from './screens/Rutina.jsx'

function pantalla([seccion, id], query) {
  switch (seccion) {
    case 'mapa':
      return [<Mapa />, 'mapa']
    case 'punto':
      return [<DetallePunto key={id} id={id} />, 'mapa']
    case 'agendar':
      return [<Agendar key={id} id={id} />, 'mapa']
    case 'confirmacion':
      return [<Confirmacion id={id} />, 'inicio']
    case 'historial':
      return [<Historial guardado={query.has('guardado')} />, 'historial']
    case 'registrar':
      return [<Registrar />, 'historial']
    case 'ejercicios':
      return [<Ejercicios />, 'ejercicios']
    case 'ejercicio':
      return [<Rutina key={id} id={id} />, 'ejercicios']
    default:
      return [<Inicio />, 'inicio']
  }
}

export default function App() {
  const { partes, query } = useRutaActual()
  const [contenido, pestana] = pantalla(partes, query)
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-fondo shadow-xl">
      {contenido}
      <BarraInferior activa={pestana} />
    </div>
  )
}
