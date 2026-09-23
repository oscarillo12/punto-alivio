import { ruta, puntos } from '../lib/ruta.js'
import { ZONAS, nivel, fmtFecha } from '../lib/cuerpo.js'

// ---------- Mapa esquemático de la Ruta 5 (SVG: no necesita señal) ----------

const ALTO = 760
const ARRIBA = 34
const esc = (ALTO - ARRIBA * 2) / ruta.destinoKm
const y = (km) => ARRIBA + km * esc
const x = (km) => 150 + 16 * Math.sin(km / 110)

function trazo(k0, k1) {
  const pts = []
  for (let k = k0; k < k1; k += 10) pts.push(k)
  pts.push(k1)
  return pts.map((k, i) => `${i ? 'L' : 'M'}${x(k).toFixed(1)},${y(k).toFixed(1)}`).join(' ')
}

const TIPO_CORTO = { servicentro: 'Servicentro', pesaje: 'Pesaje', casino: 'Casino', carga: 'Carga y descarga' }

export function MapaRuta({ kmActual, infos, onPunto }) {
  const kmConPunto = new Set(puntos.map((p) => p.km))
  return (
    <svg viewBox={`0 0 360 ${ALTO}`} className="block w-full" role="img" aria-label="Mapa de la Ruta 5 con los puntos de alivio">
      <rect width="360" height={ALTO} fill="#EEF0E6" />
      <rect width="26" height={ALTO} fill="#CFE0EA" />
      <text x="16" y={ALTO / 2} transform={`rotate(-90 16 ${ALTO / 2})`} textAnchor="middle" fontSize="12" fill="#6A8799" letterSpacing="3">
        OCÉANO PACÍFICO
      </text>

      {/* Camino: gris lo recorrido, amarillo lo que falta */}
      <path d={trazo(0, ruta.destinoKm)} stroke="#333" strokeWidth="13" fill="none" strokeLinecap="round" />
      <path d={trazo(0, kmActual)} stroke="#9A9A9A" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d={trazo(kmActual, ruta.destinoKm)} stroke="#F5D547" strokeWidth="7" fill="none" strokeLinecap="round" />

      {ruta.ciudades.map((c) => (
        <g key={c.nombre}>
          <circle cx={x(c.km)} cy={y(c.km)} r="4" fill="#fff" stroke="#333" strokeWidth="2" />
          <text
            x={x(c.km) - 16}
            y={y(c.km) + 5}
            textAnchor="end"
            fontSize={kmConPunto.has(c.km) ? 15 : 13}
            fontWeight={kmConPunto.has(c.km) ? 700 : 400}
            fill={kmConPunto.has(c.km) ? '#333' : '#777'}
          >
            {c.nombre}
          </text>
        </g>
      ))}

      {puntos.map((p) => {
        const i = infos[p.id]
        const px = x(p.km)
        const py = y(p.km)
        return (
          <g key={p.id} onClick={() => onPunto(p.id)} className="cursor-pointer" opacity={i.pasado ? 0.45 : 1}>
            <rect x={px - 20} y={py - 24} width={360 - px + 20} height="48" fill="transparent" />
            <path d={`M${px} ${py} l-9 -13 a12 12 0 1 1 18 0 z`} fill="#F5D547" stroke="#333" strokeWidth="2.5" transform={`translate(0 -2)`} />
            <circle cx={px} cy={py - 22} r="4" fill="#333" />
            <text x={px + 20} y={py - 6} fontSize="14" fontWeight="700" fill="#333">
              {TIPO_CORTO[p.tipo]}
            </text>
            <text x={px + 20} y={py + 12} fontSize="12.5" fill={i.parada ? '#6B5A00' : '#666'} fontWeight={i.parada ? 700 : 400}>
              {i.pasado ? 'Ya pasaste' : i.aqui ? 'Estás aquí' : i.parada ? '✓ Calza con tu parada' : `${Math.round(i.distancia)} km`}
            </text>
          </g>
        )
      })}

      {/* Camión */}
      <g transform={`translate(${x(kmActual)} ${y(kmActual)})`}>
        <circle r="17" fill="#333" stroke="#F5D547" strokeWidth="3" />
        <g transform="translate(-10 -10) scale(0.85)" stroke="#fff" strokeWidth="2" fill="none" strokeLinejoin="round">
          <path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z" />
          <circle cx="6" cy="17.5" r="1.8" />
          <circle cx="17" cy="17.5" r="1.8" />
        </g>
      </g>
    </svg>
  )
}

// ---------- Mapa corporal (vista de espalda) ----------

export function MapaCorporal({ valores = {}, seleccion, onZona, className = '' }) {
  return (
    <svg viewBox="0 0 200 400" className={className} role="img" aria-label="Mapa del cuerpo, vista de espalda">
      <g fill="#DADAD6" stroke="#B9B9B4" strokeWidth="2" strokeLinejoin="round">
        <circle cx="100" cy="36" r="24" />
        <rect x="89" y="56" width="22" height="20" rx="6" />
        <path d="M56 80 Q100 70 144 80 L152 100 L140 202 Q100 214 60 202 L48 100 Z" />
        <path d="M48 86 Q34 92 32 112 L24 212 Q24 224 33 224 L40 222 L52 124 Z" />
        <path d="M152 86 Q166 92 168 112 L176 212 Q176 224 167 224 L160 222 L148 124 Z" />
        <path d="M62 198 L98 206 L95 382 Q85 390 73 382 Z" />
        <path d="M138 198 L102 206 L105 382 Q115 390 127 382 Z" />
      </g>
      <path d="M100 80 V200" stroke="#C4C4BF" strokeWidth="2" strokeDasharray="4 5" />
      {ZONAS.map((z) => {
        const v = valores[z.id] ?? 0
        const n = nivel(v)
        const sel = seleccion === z.id
        return (
          <g
            key={z.id}
            onClick={onZona ? () => onZona(z.id) : undefined}
            className={onZona ? 'cursor-pointer' : ''}
            role={onZona ? 'button' : undefined}
            aria-label={onZona ? `${z.nombre}: ${n.texto}` : undefined}
          >
            {z.puntos.map(([cx, cy], k) => (
              <g key={k}>
                <circle cx={cx} cy={cy} r="24" fill="transparent" />
                <circle
                  cx={cx}
                  cy={cy}
                  r={v ? 11 + v * 0.6 : 11}
                  fill={n.color}
                  fillOpacity={v ? 0.9 : 0.6}
                  stroke={sel ? '#333' : v ? '#fff' : '#9A9A95'}
                  strokeWidth={sel ? 4 : 2}
                  strokeDasharray={v || sel ? undefined : '3 3'}
                />
              </g>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

export function LeyendaDolor() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-base">
      {[
        ['Alta (7 a 10)', '#E0483E'],
        ['Media (4 a 6)', '#F29A2E'],
        ['Baja (1 a 3)', '#F5D547'],
      ].map(([t, c]) => (
        <li key={t} className="flex items-center gap-2">
          <span className="size-5 rounded-full border border-black/10" style={{ background: c }} />
          {t}
        </li>
      ))}
    </ul>
  )
}

// ---------- Evolución del dolor (0 a 10) ----------

export function GraficoEvolucion({ datos }) {
  const W = 340
  const H = 230
  const m = { izq: 30, der: 14, arr: 14, abj: 34 }
  const ancho = W - m.izq - m.der
  const alto = H - m.arr - m.abj
  const px = (i) => m.izq + (datos.length === 1 ? ancho / 2 : (i * ancho) / (datos.length - 1))
  const py = (v) => m.arr + alto - (v / 10) * alto
  const linea = datos.map((d, i) => `${i ? 'L' : 'M'}${px(i)},${py(d.valor)}`).join(' ')
  const area = `${linea} L${px(datos.length - 1)},${py(0)} L${px(0)},${py(0)} Z`
  const cada = datos.length > 6 ? 2 : 1

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Gráfico de evolución del dolor">
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <g key={v}>
          <line x1={m.izq} x2={W - m.der} y1={py(v)} y2={py(v)} stroke="#E6E6E2" />
          <text x={m.izq - 8} y={py(v) + 5} textAnchor="end" fontSize="13" fill="#666">
            {v}
          </text>
        </g>
      ))}
      <path d={area} fill="#F5D547" fillOpacity="0.25" />
      <path d={linea} fill="none" stroke="#D9B400" strokeWidth="3.5" strokeLinejoin="round" />
      {datos.map((d, i) => (
        <g key={d.fecha + i}>
          <circle cx={px(i)} cy={py(d.valor)} r="6" fill="#F5D547" stroke="#333" strokeWidth="2" />
          {(i % cada === 0 || i === datos.length - 1) && (
            <text x={px(i)} y={H - 10} textAnchor="middle" fontSize="12.5" fill="#555">
              {fmtFecha(d.fecha, { day: 'numeric', month: 'short' }).replace('.', '')}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
