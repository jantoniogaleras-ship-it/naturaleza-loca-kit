import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FUENTE, NEGRO } from "../lib";

// Etiqueta de color del dato sorprendente: entra de golpe con un ligero giro.
export const Etiqueta = ({ texto, color }: { texto: string; color?: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const golpe = spring({ frame, fps, config: { damping: 8, stiffness: 260 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", top: "18%" }}>
      <div
        style={{
          transform: `rotate(${4 - golpe * 7}deg) scale(${0.3 + golpe * 0.7})`,
          backgroundColor: color ?? "#18C964",
          color: "white",
          border: `10px solid ${NEGRO}`,
          borderRadius: 28,
          padding: "18px 44px",
          boxShadow: `0 14px 0 ${NEGRO}`,
          fontFamily: FUENTE,
          fontWeight: 900,
          fontSize: 84,
          textTransform: "uppercase",
          WebkitTextStroke: `8px ${NEGRO}`,
          paintOrder: "stroke fill",
          maxWidth: 920,
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};
