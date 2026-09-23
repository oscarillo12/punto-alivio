# Punto Alivio — App beta

Prototipo navegable de la red Punto Alivio (taller de Design Thinking).
React + Vite + Tailwind, sin backend: los datos son JSON locales en `src/data/`.

## Cómo correrla

```bash
npm install
npm run dev        # desarrollo, abre http://localhost:5173
npm run build      # genera dist/ (con service worker para uso sin señal)
npm run preview    # sirve dist/ en http://localhost:4173
```

Para verla en el celular: `npm run dev` y abre la URL "Network" que muestra la consola
(el teléfono debe estar en la misma red Wi-Fi). El modo sin señal real (service worker)
solo funciona en `localhost` o publicada con HTTPS (Netlify, Vercel, GitHub Pages: sube la carpeta `dist/`).

## Pantallas

| Ruta | Pantalla | Función |
|---|---|---|
| `#/` | Inicio | Próximo punto, distancia, hora de llegada, si calza con una parada |
| `#/mapa` | Mapa Ruta 5 | Mapa esquemático (SVG, sin señal) + lista de puntos |
| `#/punto/:id` | Detalle | Servicios, horario, profesional, estacionamiento, costo |
| `#/agendar/:id` | Agendar | Duración 15/20 min y horarios que calzan con la parada |
| `#/confirmacion/:id` | Confirmación | Resumen e indicaciones al llegar |
| `#/historial` | Mi cuerpo | Mapa corporal por zonas + evolución en el tiempo |
| `#/registrar` | Registrar | Anotar el dolor de hoy (Nada / Poco / Harto / Mucho) |
| `#/ejercicios` | Ejercicios | Rutinas breves guardadas sin señal |
| `#/ejercicio/:id` | Rutina | Paso a paso con temporizador y lectura en voz alta |

## Datos de prueba

- `ruta.json`: viaje de Segundo Santiago → Puerto Montt, con sus paradas obligatorias
  (pesaje, descanso, descarga). La app calcula qué horarios de sesión calzan con ellas.
- `puntos.json`: 8 puntos de la red en la Ruta 5.
- `historial.json`: registros de dolor de abril a septiembre.
- `ejercicios.json`: 5 rutinas.

Las reservas y registros nuevos quedan en el `localStorage` del navegador.

## Modo demostración

Al final de Inicio: **Avanzar 30 min** (mueve el camión por la ruta), **Simular sin señal**
(muestra el aviso y deja reservas "pendientes" que se confirman al volver la señal) y
**Reiniciar demostración**.
