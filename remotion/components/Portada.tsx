import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AMARILLO, FUENTE, NEGRO } from "../lib";

// Texto grande del gancho arriba del todo. Se ve ya en el primer fotograma (solo crece un poco al entrar),
// así cualquier fotograma del primer segundo sirve de portada al subir el Short desde el móvil.
export const Portada = ({ texto, duracion }: { texto: string; duracion: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const salida = interpolate(frame, [duracion - 5, duracion], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", top: "9%", opacity: salida }}>
      <div
        style={{
          transform: `scale(${0.9 + entrada * 0.1})`,
          backgroundColor: AMARILLO,
          color: NEGRO,
          border: `10px solid ${NEGRO}`,
          borderRadius: 28,
          padding: "20px 40px",
          boxShadow: `0 14px 0 ${NEGRO}`,
          fontFamily: FUENTE,
          fontWeight: 900,
          fontSize: 82,
          textTransform: "uppercase",
          maxWidth: 940,
          textAlign: "center",
          lineHeight: 1.04,
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};
