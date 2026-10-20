import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Contador } from "./components/Contador";
import { Etiqueta } from "./components/Etiqueta";
import { Flecha } from "./components/Flecha";
import { LikeInsert } from "./components/LikeInsert";
import { Planos } from "./components/Planos";
import { Reto } from "./components/Reto";
import { Subtitulos } from "./components/Subtitulos";
import { resolverSrc } from "./lib";
import { finDeOverlay, type Overlay, type ShortProps } from "./schema";

loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat-latin-900-normal.woff2"), weight: "900" });

const OverlayVisual = ({ o, props }: { o: Overlay; props: ShortProps }) => {
  switch (o.tipo) {
    case "flecha":
      return <Flecha x={o.x} y={o.y} rotacion={o.rotacion ?? 0} />;
    case "contador":
      return <Contador valor={o.valor} prefijo={o.prefijo} sufijo={o.sufijo} etiqueta={o.etiqueta} />;
    case "etiqueta":
      return <Etiqueta texto={o.texto} color={o.color} />;
    case "like":
      return <LikeInsert />;
    case "reto":
      return <Reto palabra={props.palabraReto} />;
  }
};

export const Short = (props: ShortProps) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const palabras = props.voz.palabras;

  // La música baja mientras habla la voz.
  const volumenMusica = (frame: number) => {
    const t = frame / fps;
    const base = props.musica?.volumen ?? 0.25;
    const hablando = palabras.some((w) => t >= w.inicio - 0.15 && t <= w.fin + 0.15);
    return hablando ? base * 0.35 : base;
  };

  // El like y el reto ocupan toda la pantalla: mientras están, no hay subtítulos.
  const tapan = props.overlays.filter((o) => o.tipo === "like" || o.tipo === "reto");
  const durante = (t: number) => tapan.some((o) => t >= o.inicio && t < finDeOverlay(o));

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Planos planos={props.planos} />

      <Subtitulos palabras={palabras} destacadas={props.destacadas ?? []} ocultarEn={durante} />

      {props.overlays.map((o, i) => (
        <Sequence key={i} from={f(o.inicio)} durationInFrames={Math.max(1, f(finDeOverlay(o)) - f(o.inicio))} layout="none">
          <OverlayVisual o={o} props={props} />
          {o.tipo !== "like" && <Audio src={staticFile("sfx/pop.wav")} volume={0.6} />}
        </Sequence>
      ))}

      {props.planos.slice(1).map((p, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, f(p.inicio) - 3)} durationInFrames={f(0.35)} layout="none">
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
        </Sequence>
      ))}

      {props.voz.src && <Audio src={resolverSrc(props.voz.src)} volume={props.voz.volumen ?? 1} />}
      {props.musica && <Audio src={resolverSrc(props.musica.src)} volume={volumenMusica} />}
    </AbsoluteFill>
  );
};
