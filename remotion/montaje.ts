// Montaje final del Short a partir de los tiempos originales de la voz de ElevenLabs.
// Sigue la guía de edición del canal: sin silencios largos, la voz manda y el like
// tiene su propio hueco (la voz se para mientras sale, en vez de seguir por debajo).
import { normalizar } from "./lib";
import type { Overlay, Palabra, Plano, ShortProps } from "./schema";

// Silencio máximo que se deja entre frases.
export const SILENCIO = 0.15;
// Aire antes y después de cada trozo de voz para no comerse el ataque ni la cola de las palabras.
const ANTES = 0.04;
const DESPUES = 0.08;
// El vídeo termina en cuanto acaba la última palabra (más este margen).
const COLA = 0.35;
// Hueco que se abre en la voz para el like. El inserto dura algo más, pero su final
// es solo imagen («¡Dale like!»), así que la voz vuelve antes y no queda un silencio.
const PAUSA_LIKE = 1.9;

export type TrozoVoz = { srcInicio: number; srcFin: number; inicio: number };

export type Montaje = {
  props: ShortProps;
  trozos: TrozoVoz[];
  duracion: number;
};

// Agrupa las palabras en trozos de voz separados por silencios de más de SILENCIO.
const agrupar = (palabras: Palabra[]) => {
  const grupos: Palabra[][] = [];
  palabras.forEach((w, i) => {
    const anterior = palabras[i - 1];
    if (!anterior || w.inicio - anterior.fin > SILENCIO) grupos.push([]);
    grupos[grupos.length - 1].push(w);
  });
  return grupos;
};

// Momento en que se empieza a decir una frase (o un número) dentro de un tramo, si se dice.
const buscar = (palabras: Palabra[], frase: string[], desde: number, hasta: number) => {
  const objetivo = frase.map(normalizar).filter(Boolean);
  if (!objetivo.length) return null;
  const i = palabras.findIndex(
    (w, k) =>
      w.inicio >= desde - 0.05 &&
      w.inicio < hasta &&
      objetivo.every((o, j) => palabras[k + j] && normalizar(palabras[k + j].texto) === o),
  );
  return i >= 0 ? palabras[i].inicio : null;
};

export const montar = (original: ShortProps): Montaje => {
  const palabras = original.voz.palabras;
  if (!palabras.length) {
    const fin = Math.max(1, ...original.planos.map((p) => p.fin));
    return { props: original, trozos: [], duracion: fin };
  }

  const like = original.overlays.find((o) => o.tipo === "like");
  let likePendiente = like ? like.inicio : null;
  let likeNuevo: number | null = null;

  // Coloca los trozos seguidos, con SILENCIO entre ellos y el hueco del like donde toque.
  const trozos: (TrozoVoz & { desfase: number })[] = [];
  let cursor = 0;
  agrupar(palabras).forEach((g, i) => {
    const srcInicio = Math.max(0, g[0].inicio - ANTES);
    const srcFin = g[g.length - 1].fin + DESPUES;
    if (i > 0) cursor += SILENCIO;
    if (likePendiente !== null && g[0].inicio >= likePendiente - 0.05) {
      likeNuevo = cursor;
      cursor += PAUSA_LIKE;
      likePendiente = null;
    }
    trozos.push({ srcInicio, srcFin, inicio: cursor, desfase: cursor - srcInicio });
    cursor += srcFin - srcInicio;
  });
  const duracion = cursor + COLA;

  // Lleva un instante del audio original a la línea de tiempo montada.
  const mapa = (t: number) => {
    if (t <= trozos[0].srcInicio) return Math.max(0, t + trozos[0].desfase);
    for (let i = 0; i < trozos.length; i++) {
      const tr = trozos[i];
      const sig = trozos[i + 1];
      if (t <= tr.srcFin) return t + tr.desfase;
      if (!sig || t < sig.srcInicio) {
        const finNuevo = tr.srcFin + tr.desfase;
        return Math.min(finNuevo + (t - tr.srcFin), sig ? sig.inicio : duracion);
      }
    }
    return duracion;
  };
  const r = (x: number) => Math.round(x * 1000) / 1000;

  const nuevasPalabras = palabras.map((w) => ({ ...w, inicio: r(mapa(w.inicio)), fin: r(mapa(w.fin)) }));

  // Los planos se reparten entre sus nuevos cortes; el último llega hasta el final.
  // Si al quitar un silencio un plano se queda en casi nada, se lo come el anterior.
  const planos: Plano[] = [];
  original.planos.forEach((p, i, todos) => {
    const inicio = i === 0 ? 0 : r(mapa(p.inicio));
    const fin = i === todos.length - 1 ? r(duracion) : r(mapa(todos[i + 1].inicio));
    const anterior = planos[planos.length - 1];
    if (fin - inicio < 0.3 && anterior) anterior.fin = fin;
    else planos.push({ ...p, inicio, fin });
  });

  const overlays: Overlay[] = original.overlays.map((o) => {
    if (o.tipo === "like") return { ...o, inicio: r(likeNuevo ?? mapa(o.inicio)) };
    // El contador y la etiqueta salen justo cuando se dice su número o su frase, no antes.
    const dicho =
      o.tipo === "contador" ? buscar(palabras, [String(o.valor)], o.inicio, o.fin) : o.tipo === "etiqueta" ? buscar(palabras, o.texto.split(/\s+/), o.inicio - 0.5, o.fin) : null;
    const inicio = r(mapa(dicho ?? o.inicio));
    const fin = o.tipo === "reto" ? r(duracion) : r(Math.max(inicio + 0.6, mapa(o.fin)));
    return { ...o, inicio, fin };
  });

  return {
    props: { ...original, voz: { ...original.voz, palabras: nuevasPalabras }, planos, overlays },
    trozos: trozos.map(({ srcInicio, srcFin, inicio }) => ({ srcInicio, srcFin, inicio })),
    duracion: r(duracion),
  };
};
