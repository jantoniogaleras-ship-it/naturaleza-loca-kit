import { Composition } from "remotion";
import ejemplo from "../data/ejemplo-pulpo.json";
import { montar } from "./montaje";
import { ALTO, ANCHO, FPS, type ShortProps } from "./schema";
import { Short } from "./Short";

export const RemotionRoot = () => (
  <Composition
    id="Short"
    component={Short}
    width={ANCHO}
    height={ALTO}
    fps={FPS}
    durationInFrames={FPS * 22}
    defaultProps={ejemplo as ShortProps}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.ceil(montar(props).duracion * FPS),
    })}
  />
);
