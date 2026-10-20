import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { NEGRO, ROJO } from "../lib";

// Flecha roja del gancho: entra con rebote y luego "late" señalando. x e y en % de la pantalla.
export const Flecha = ({ x, y, rotacion }: { x: number; y: number; rotacion: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 9, stiffness: 180 } });
  const vaiven = Math.sin((frame / fps) * Math.PI * 4) * 22;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -100%) rotate(${rotacion}deg) translateY(${vaiven - (1 - entrada) * 300}px) scale(${entrada})`,
          filter: "drop-shadow(0 14px 10px rgba(0,0,0,0.45))",
        }}
      >
        <svg width={240} height={330} viewBox="0 0 240 330">
          <path
            d="M70 12 H170 V170 H226 L120 318 L14 170 H70 Z"
            fill={ROJO}
            stroke={NEGRO}
            strokeWidth={18}
            strokeLinejoin="round"
          />
          <rect x={92} y={34} width={20} height={120} rx={8} fill="white" opacity={0.45} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
