import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { resolverSrc } from "../lib";
import type { Plano } from "../schema";

const UnPlano = ({ plano, duracion }: { plano: Plano; duracion: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Entrada con "punch" (zoom que se asienta) y deriva lenta para que el plano nunca esté quieto.
  const punch = interpolate(frame, [0, 6], [1.18, 1.04], { extrapolateRight: "clamp" });
  const deriva = interpolate(frame, [0, duracion], [0, 0.06]);
  const estilo = {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    transform: `scale(${punch + deriva})`,
  };
  const src = resolverSrc(plano.src);
  return (
    <AbsoluteFill>
      {plano.tipo === "video" ? (
        <OffthreadVideo src={src} muted style={estilo} startFrom={Math.round((plano.desdeSegundo ?? 0) * fps)} />
      ) : (
        <Img src={src} style={estilo} />
      )}
    </AbsoluteFill>
  );
};

// Destello blanco breve en cada corte.
const Destello = () => {
  const frame = useCurrentFrame();
  const opacidad = interpolate(frame, [0, 4], [0.7, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "white", opacity: opacidad }} />;
};

export const Planos = ({ planos }: { planos: Plano[] }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {planos.map((p, i) => {
        const desde = Math.round(p.inicio * fps);
        const duracion = Math.max(1, Math.round(p.fin * fps) - desde);
        return (
          <Sequence key={i} from={desde} durationInFrames={duracion}>
            <UnPlano plano={p} duracion={duracion} />
            {i > 0 && <Destello />}
          </Sequence>
        );
      })}
    </>
  );
};
