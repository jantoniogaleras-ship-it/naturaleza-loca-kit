# naturaleza-loca-kit

Motor de render de los Shorts de Naturaleza Loca: plantillas animadas en [Remotion](https://www.remotion.dev) y una pequeña API en Vercel que renderiza cada vídeo en una Vercel Sandbox.

## Cómo funciona

1. n8n genera los datos de un Short (guion, tiempos de cada palabra, planos y animaciones) con la forma de `remotion/schema.ts`.
2. n8n llama a `POST /api/render` con esos datos y la cabecera `Authorization: Bearer <RENDER_SECRET>`. Responde `{ sandboxId, cmdId }`.
3. n8n consulta `GET /api/progress?sandboxId=…&cmdId=…` cada 15–20 s hasta recibir `{ stage: "done", url }`. La URL es el MP4 en Vercel Blob, listo para subir a YouTube.

## Plantilla (unos 22 s)

| Tramo | Qué pasa | Componente |
| --- | --- | --- |
| 0–2 s | Gancho en forma de pregunta | `Flecha` (overlay `flecha`) |
| 2–6 s | Primer dato con su número | `Contador` (overlay `contador`) |
| 6–8 s | Inserto de like | `LikeInsert` (overlay `like`, 1,8 s) |
| 8–14 s | Giro sorprendente | `Etiqueta` (overlay `etiqueta`) |
| 14–18 s | Remate | palabra resaltada en `destacadas` |
| 18–22 s | Reto «¿cuántas veces dije X?» | `Reto` (overlay `reto`) |

Además, en todo el vídeo: subtítulos palabra a palabra con los tiempos de ElevenLabs, zoom y destello en cada corte, whoosh en los cortes, pop al entrar cada animación y música que baja sola mientras habla la voz.

Los tiempos de cada tramo no están fijos: salen de los datos, así que la plantilla se adapta a lo que dure la voz.

## Datos de entrada

Ejemplo completo en [`data/ejemplo-pulpo.json`](data/ejemplo-pulpo.json). Los `src` pueden ser URLs públicas (Pexels, Pixabay, ElevenLabs subido a Blob…) o rutas dentro de `public/`.

## Comandos

```bash
npm install
npm run studio          # editor visual de Remotion con el ejemplo
npm run render:ejemplo  # renderiza data/ejemplo-pulpo.json en out/
npm run build           # bundle de Remotion + app de Next.js (lo que hace Vercel)
```

## Variables de entorno en Vercel

- `RENDER_SECRET`: clave compartida con n8n para llamar a la API.
- `BLOB_READ_WRITE_TOKEN`: la crea Vercel al conectar un Blob store al proyecto.

La autenticación con Vercel Sandbox es automática dentro del proyecto desplegado.

## Recursos

- `assets/`: el kit original (PNG y MP4) que sirvió de referencia.
- `public/kit/like_insert.mp4`: el inserto de like, reutilizado tal cual.
- `public/sfx/`: whoosh y pop provisionales, generados; conviene cambiarlos por efectos con licencia libre.
- `public/ejemplo/`: planos de prueba (degradados con texto) solo para el ejemplo.
