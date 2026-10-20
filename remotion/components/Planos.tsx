import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { resolverSrc } from "../lib";
import type { Plano } from "../schema";

// Cada plano se mueve siempre (keyframes de escala y posición, como en la guía),
// y el movimiento va cambiando de un plano a otro para que no se vea venir.
const MOVIMIENTOS = [
  { escala: [1.0, 1.14], x: [0, 0] }, // acercarse
  { escala: [1.16, 1.04], x: [0, 0] }, // alejarse
  { escala: [1.12, 1.12], x: [3, -3] }, // barrido a la izquierda
  { escala: [1.06, 1.18], x: [-2, 2] }, // acercarse hacia la derecha
];

// Transiciones cortas que se alternan; la mitad de los cortes son cortes secos.
export type Transicion = "corte" | "deslizar" | "zoom" | "deslizar-inv";
export const transicionDe = (i: number): Transicion =>
  i === 0 ? "corte" : (["deslizar", "corte", "zoom", "corte", "deslizar-inv", "corte"] as const)[(i - 1) % 6];
const FRAMES_TRANSICION = 6;

const UnPlano = ({ plano, indice, duracion }: { plano: Plano; indice: number; duracion: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = MOVIMIENTOS[indice % MOVIMIENTOS.length];
  const escala = interpolate(frame, [0, duracion], m.escala);
  const x = interpolate(frame, [0, duracion], m.x);

  const tipo = transicionDe(indice);
  const t = interpolate(frame, [0, FRAMES_TRANSICION], [0, 1], { extrapolateRight: "clamp" });
  const entradaX = tipo === "deslizar" ? (1 - t) * 100 : tipo === "deslizar-inv" ? (t - 1) * 100 : 0;
  const entradaZoom = tipo === "zoom" ? 1 + (1 - t) * 0.35 : 1;
  const desenfoque = tipo === "corte" ? 0 : (1 - t) * 14;

  const estilo = {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    transform: `translateX(${entradaX + x}%) scale(${escala * entradaZoom})`,
    filter: desenfoque > 0.5 ? `blur(${desenfoque}px)` : undefined,
  };
  const src = resolverSrc(plano.src);
  return (
    <AbsoluteFill>
      {plano.tipo === "video" ? (
        <OffthreadVideo src={src} muted style={estilo} trimBefore={Math.round((plano.desdeSegundo ?? 0) * fps)} />
      ) : (
        <Img src={src} style={estilo} />
      )}
    </AbsoluteFill>
  );
};

export const Planos = ({ planos }: { planos: Plano[] }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {planos.map((p, i) => {
        const desde = Math.round(p.inicio * fps);
        const duracion = Math.max(1, Math.round(p.fin * fps) - desde);
        // En las transiciones el plano anterior sigue debajo mientras entra el nuevo.
        const solape = i < planos.length - 1 && transicionDe(i + 1) !== "corte" ? FRAMES_TRANSICION : 0;
        return (
          <Sequence key={i} from={desde} durationInFrames={duracion + solape}>
            <UnPlano plano={p} indice={i} duracion={duracion} />
          </Sequence>
        );
      })}
    </>
  );
};
