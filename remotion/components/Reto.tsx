import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AMARILLO, FUENTE, NEGRO, ROJO } from "../lib";

// Bocadillo amarillo del reto final: "¿CUÁNTAS VECES DIJE «X»?", con entrada elástica y sacudida.
export const Reto = ({ palabra }: { palabra: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 7, stiffness: 200 } });
  const sacudida = Math.sin(frame * 1.9) * 2.2 * (frame > 8 ? 1 : 0);
  const tamPalabra = palabra.length > 9 ? 100 : 130;

  return (
    <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          transform: `scale(${entrada}) rotate(${-4 + sacudida}deg)`,
          filter: "drop-shadow(0 20px 12px rgba(0,0,0,0.5))",
        }}
      >
        <div
          style={{
            backgroundColor: AMARILLO,
            border: `14px solid ${NEGRO}`,
            borderRadius: 60,
            padding: "36px 40px 42px",
            width: 860,
            textAlign: "center",
            fontFamily: FUENTE,
            fontWeight: 900,
            textTransform: "uppercase",
            lineHeight: 1.05,
          }}
        >
          <div style={{ fontSize: 64, color: NEGRO, whiteSpace: "nowrap" }}>¿Cuántas veces dije</div>
          <div style={{ fontSize: tamPalabra, color: ROJO, marginTop: 8 }}>
            «{palabra}»<span style={{ color: NEGRO }}>?</span>
          </div>
        </div>
        {/* Cola del bocadillo */}
        <svg width={170} height={150} viewBox="0 0 170 150" style={{ position: "absolute", left: 90, bottom: -122 }}>
          <path d="M14 0 L150 0 L20 140 Z" fill={AMARILLO} stroke={NEGRO} strokeWidth={14} strokeLinejoin="round" />
          <rect x={0} y={0} width={170} height={16} fill={AMARILLO} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
