import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AMARILLO, FUENTE, NEGRO, ROJO } from "../lib";

// Tarjeta del primer dato: el número sube desde 0 hasta el valor.
export const Contador = ({
  valor,
  prefijo,
  sufijo,
  etiqueta,
}: {
  valor: number;
  prefijo?: string;
  sufijo?: string;
  etiqueta: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 12, stiffness: 160 } });
  const progreso = interpolate(frame, [3, fps * 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const decimales = Number.isInteger(valor) ? 0 : 1;
  const numero = (valor * progreso).toLocaleString("es-ES", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
  const latido = progreso >= 1 ? 1 + 0.04 * Math.sin((frame / fps) * Math.PI * 3) : 1;

  return (
    <AbsoluteFill style={{ alignItems: "center", top: "14%" }}>
      <div
        style={{
          transform: `translateY(${(1 - entrada) * -400}px) rotate(-3deg) scale(${latido})`,
          backgroundColor: "white",
          border: `10px solid ${NEGRO}`,
          borderRadius: 36,
          padding: "20px 56px 26px",
          boxShadow: `0 16px 0 ${NEGRO}`,
          textAlign: "center",
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        <div style={{ fontFamily: FUENTE, fontWeight: 900, fontSize: 150, lineHeight: 1, color: ROJO }}>
          {prefijo}
          {numero}
          {sufijo}
        </div>
        <div
          style={{
            marginTop: 10,
            fontWeight: 800,
            fontSize: 46,
            textTransform: "uppercase",
            color: NEGRO,
            backgroundColor: AMARILLO,
            borderRadius: 14,
            padding: "4px 18px",
          }}
        >
          {etiqueta}
        </div>
      </div>
    </AbsoluteFill>
  );
};
