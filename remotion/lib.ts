import { staticFile } from "remotion";

export const resolverSrc = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));

export const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

export const AMARILLO = "#FFE14D";
export const ROJO = "#E8192C";
export const VERDE = "#1DB954";
export const NEGRO = "#111111";
export const FUENTE = "Montserrat, sans-serif";
