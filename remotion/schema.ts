// Datos de entrada de un Short. Los tiempos van en segundos desde el inicio del vídeo.
// Los genera el flujo de n8n (guion de Claude + tiempos de ElevenLabs + metraje).

export type Palabra = {
  texto: string;
  inicio: number;
  fin: number;
};

export type Plano = {
  // URL pública o ruta dentro de public/ (por ejemplo "ejemplo/plano1.mp4").
  src: string;
  tipo: "video" | "imagen";
  inicio: number;
  fin: number;
  // Segundo del clip original desde el que empieza a reproducirse.
  desdeSegundo?: number;
};

export type Overlay =
  | { tipo: "flecha"; inicio: number; fin: number; x: number; y: number; rotacion?: number }
  | {
      tipo: "contador";
      inicio: number;
      fin: number;
      valor: number;
      prefijo?: string;
      sufijo?: string;
      etiqueta: string;
    }
  | { tipo: "etiqueta"; inicio: number; fin: number; texto: string; color?: string }
  | { tipo: "like"; inicio: number }
  | { tipo: "reto"; inicio: number; fin: number };

export type ShortProps = {
  animal: string;
  palabraReto: string;
  voz: { src: string | null; volumen?: number; palabras: Palabra[] };
  musica?: { src: string; volumen?: number } | null;
  planos: Plano[];
  overlays: Overlay[];
  // Palabras que se resaltan en los subtítulos (la palabra clave del dato).
  destacadas?: string[];
  // Texto grande del gancho al principio; ese fotograma es la portada del Short.
  portada?: string;
};

// El inserto de like dura 1,8 s; se pone a 0,75x para que dé tiempo a verlo.
export const DURACION_LIKE_ORIGINAL = 1.8;
export const DURACION_LIKE = 2.4;
export const FPS = 30;
export const ANCHO = 1080;
export const ALTO = 1920;

export const finDeOverlay = (o: Overlay) => (o.tipo === "like" ? o.inicio + DURACION_LIKE : o.fin);
