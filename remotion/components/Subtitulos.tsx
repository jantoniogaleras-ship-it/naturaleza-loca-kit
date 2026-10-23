import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AMARILLO, FUENTE, NEGRO, normalizar, VERDE } from "../lib";
import type { Palabra } from "../schema";

const MAX_POR_PAGINA = 3;
const PAUSA_CORTE = 0.35;

// Agrupa las palabras en páginas cortas: corta tras puntuación, pausas o cada 3 palabras.
export const paginar = (palabras: Palabra[]) => {
  const paginas: Palabra[][] = [];
  let actual: Palabra[] = [];
  palabras.forEach((w, i) => {
    actual.push(w);
    const siguiente = palabras[i + 1];
    const corta =
      actual.length >= MAX_POR_PAGINA ||
      /[.,;:!?¿¡…]$/.test(w.texto) ||
      (siguiente && siguiente.inicio - w.fin > PAUSA_CORTE);
    if (corta || !siguiente) {
      paginas.push(actual);
      actual = [];
    }
  });
  return paginas;
};

export const Subtitulos = ({
  palabras,
  destacadas,
  ocultarEn,
}: {
  palabras: Palabra[];
  destacadas: string[];
  ocultarEn: (t: number) => boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (ocultarEn(t)) return null;

  const paginas = paginar(palabras);
  const pagina = paginas.find((p, i) => {
    const fin = paginas[i + 1]?.[0].inicio ?? p[p.length - 1].fin + 0.3;
    return t >= p[0].inicio && t < fin;
  });
  if (!pagina) return null;

  const clave = new Set(destacadas.map(normalizar));

  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", top: "58%" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 22px",
          width: "88%",
          fontFamily: FUENTE,
          fontWeight: 900,
          fontSize: 92,
          lineHeight: 1.1,
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        {pagina.map((w, i) => {
          const activa = t >= w.inicio && t < w.fin + 0.05;
          const dicha = t >= w.inicio;
          const esClave = clave.has(normalizar(w.texto));
          const pop = spring({ frame: frame - Math.round(w.inicio * fps), fps, config: { damping: 12, stiffness: 300 }, durationInFrames: 6 });
          const escala = dicha ? 1 + 0.12 * (activa ? 1 - pop * 0.5 : 0) : 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: esClave ? "white" : activa ? AMARILLO : "white",
                backgroundColor: esClave && dicha ? VERDE : "transparent",
                padding: esClave ? "0 14px" : 0,
                borderRadius: 14,
                opacity: dicha ? 1 : 0.55,
                transform: `scale(${escala})`,
                WebkitTextStroke: `10px ${NEGRO}`,
                paintOrder: "stroke fill",
                textShadow: "0 8px 0 rgba(0,0,0,0.45)",
              }}
            >
              {w.texto.replace(/[.,;:…]+$/, "")}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
