import { useStore } from '../lib/store.jsx'
import { ir, volver } from '../lib/navegacion.js'
import { TIPO_PARADA, fmtHora } from '../lib/ruta.js'

const TRAZOS = {
  inicio: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>,
  mapa: <><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></>,
  historial: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M8 13h2l1.5-3 2 5 1.5-2h1" /></>,
  ejercicios: <><circle cx="12" cy="4.5" r="2" /><path d="M4 9l8 1 8-1" /><path d="M12 10v5l-3 6M12 15l3 6" /></>,
  atras: <path d="M15 5l-7 7 7 7" />,
  adelante: <path d="M9 5l7 7-7 7" />,
  pin: <><path d="M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  reloj: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  camion: <><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z" /><circle cx="6" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>,
  sinSenal: <><path d="M3 3l18 18" /><path d="M8.5 16.5a5 5 0 017 0M5 13a10 10 0 015-2.8M19 13a10 10 0 00-2-1.5M2 8.8a15 15 0 014.3-2.6M22 8.8A15 15 0 0011 5" /><circle cx="12" cy="20" r=".8" /></>,
  calendario: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  play: <path d="M7 4l13 8-13 8z" fill="currentColor" />,
  pausa: <path d="M7 4h3v16H7zM14 4h3v16h-3z" fill="currentColor" />,
  parlante: <><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" /></>,
  descarga: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></>,
  persona: <><circle cx="12" cy="7" r="4" /><path d="M4 21c1-4.5 4-7 8-7s7 2.5 8 7" /></>,
  auto: <><path d="M5 17h14M6 17l1.5-6h9L18 17" /><circle cx="8" cy="17.5" r="1.5" /><circle cx="16" cy="17.5" r="1.5" /></>,
  plata: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></>,
  repetir: <><path d="M4 12a8 8 0 0114-5l2 2M20 12a8 8 0 01-14 5l-2-2" /><path d="M20 4v5h-5M4 20v-5h5" /></>,
}

export function Icono({ n, className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {TRAZOS[n]}
    </svg>
  )
}

export function Logo({ className = 'size-11' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="21" cy="11" r="5.5" fill="#fff" />
      <path d="M8 18c2 12 7 21 15 25-2-10-5-18-15-25z" fill="#fff" />
      <path d="M41 13c-12 4-17 15-15 30 10-5 17-17 15-30z" fill="#F5D547" />
    </svg>
  )
}

function AvisoSinSenal() {
  const { enLinea } = useStore()
  if (enLinea) return null
  return (
    <div role="status" className="flex items-center gap-2 bg-alivio px-4 py-2 text-base font-semibold text-carbon">
      <Icono n="sinSenal" className="size-5 shrink-0" />
      Sin señal · usando lo guardado en tu teléfono
    </div>
  )
}

export function Encabezado({ titulo, atras = true }) {
  return (
    <header className="sticky top-0 z-30">
      <AvisoSinSenal />
      <div className="flex min-h-16 items-center gap-1 bg-carbon px-3 py-2 text-white">
        {atras && (
          <button onClick={volver} className="flex h-12 shrink-0 items-center rounded-xl pr-3 text-lg font-semibold text-alivio active:bg-white/10">
            <Icono n="atras" className="size-7" />
            Volver
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold">{titulo}</h1>
      </div>
    </header>
  )
}

export function EncabezadoMarca() {
  return (
    <header className="sticky top-0 z-30">
      <AvisoSinSenal />
      <div className="flex items-center gap-3 bg-carbon px-4 py-3 text-white">
        <Logo />
        <div>
          <p className="text-2xl leading-none font-extrabold tracking-tight">
            PUNTO <span className="text-alivio">ALIVIO</span>
          </p>
          <p className="mt-1 text-xs tracking-wider text-white/70 uppercase">Recuperación para camioneros</p>
        </div>
      </div>
    </header>
  )
}

const PESTANAS = [
  { id: 'inicio', ruta: '/', texto: 'Inicio', icono: 'inicio' },
  { id: 'mapa', ruta: '/mapa', texto: 'Mapa', icono: 'mapa' },
  { id: 'historial', ruta: '/historial', texto: 'Mi cuerpo', icono: 'historial' },
  { id: 'ejercicios', ruta: '/ejercicios', texto: 'Ejercicios', icono: 'ejercicios' },
]

export function BarraInferior({ activa }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md bg-carbon pb-[env(safe-area-inset-bottom)]" aria-label="Secciones">
      <ul className="grid grid-cols-4">
        {PESTANAS.map((p) => {
          const on = p.id === activa
          return (
            <li key={p.id}>
              <button
                onClick={() => ir(p.ruta)}
                aria-current={on ? 'page' : undefined}
                className={`relative flex h-20 w-full flex-col items-center justify-center gap-1 text-base font-semibold active:bg-white/10 ${on ? 'text-alivio' : 'text-white/85'}`}
              >
                {on && <span className="absolute inset-x-4 top-0 h-1.5 rounded-b bg-alivio" />}
                <Icono n={p.icono} className="size-7" />
                {p.texto}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

const VARIANTES = {
  primario: 'bg-alivio text-carbon active:bg-alivio-oscuro shadow-sm',
  secundario: 'bg-white text-carbon border-2 border-carbon active:bg-gray-100',
  oscuro: 'bg-carbon text-white active:bg-black',
  suave: 'bg-black/5 text-carbon active:bg-black/10',
}

export function Boton({ variante = 'primario', icono, className = '', children, ...props }) {
  return (
    <button
      className={`flex min-h-15 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xl font-bold disabled:opacity-40 ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {icono && <Icono n={icono} className="size-6 shrink-0" />}
      {children}
    </button>
  )
}

export function Tarjeta({ className = '', children }) {
  return <section className={`rounded-3xl border border-black/5 bg-white p-5 shadow-sm ${className}`}>{children}</section>
}

export function Contenido({ children, className = '' }) {
  return <main className={`flex-1 space-y-4 px-4 pt-4 pb-32 ${className}`}>{children}</main>
}

export function AvisoCalza({ info }) {
  if (info.parada) {
    return (
      <p className="flex items-start gap-2 rounded-2xl bg-alivio-claro px-4 py-3 text-lg font-semibold">
        <Icono n="check" className="mt-0.5 size-6 shrink-0" />
        <span>
          Calza con tu {TIPO_PARADA[info.parada.tipo]} de las {fmtHora(info.ventana.inicio)} ({info.parada.duracion} min)
        </span>
      </p>
    )
  }
  return (
    <p className="flex items-start gap-2 rounded-2xl bg-black/5 px-4 py-3 text-lg">
      <Icono n="info" className="mt-0.5 size-6 shrink-0" />
      <span>No tienes una parada planificada aquí.</span>
    </p>
  )
}
