import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Contador } from "./components/Contador";
import { Etiqueta } from "./components/Etiqueta";
import { Flecha } from "./components/Flecha";
import { LikeInsert } from "./components/LikeInsert";
import { Planos, transicionDe } from "./components/Planos";
import { Portada } from "./components/Portada";
import { Reto } from "./components/Reto";
import { Subtitulos } from "./components/Subtitulos";
import { resolverSrc } from "./lib";
import { montar } from "./montaje";
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

// Volúmenes según la guía: la voz manda, los efectos por debajo y la música aún más baja.
const VOLUMEN_EFECTOS = 0.35;
const VOLUMEN_MUSICA = 0.1;

// Sonido de cada rótulo al aparecer (el like trae el suyo y además lleva un «ding»).
const sonidoDe = (o: Overlay) => (o.tipo === "like" ? "sfx/ding.wav" : o.tipo === "etiqueta" ? "sfx/golpe.wav" : "sfx/pop.wav");

export const Short = (original: ShortProps) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const { props, trozos, duracion } = montar(original);
  const palabras = props.voz.palabras;

  // La música baja mientras habla la voz.
  const volumenMusica = (frame: number) => {
    const t = frame / fps;
    const base = props.musica?.volumen ?? VOLUMEN_MUSICA;
    const hablando = palabras.some((w) => t >= w.inicio - 0.15 && t <= w.fin + 0.15);
    return hablando ? base * 0.5 : base;
  };

  // La portada dura lo que la pregunta del gancho (entre 1,5 y 3 s).
  const pregunta = palabras.find((w) => /\?$/.test(w.texto));
  const finPortada = Math.min(3, Math.max(1.5, (pregunta?.fin ?? 2) + 0.2));

  // El like y el reto ocupan toda la pantalla: mientras están, no hay subtítulos. Tampoco con la portada:
  // al principio solo un texto, el dato fuerte en grande, para que no compita con los subtítulos.
  const tapan = props.overlays.filter((o) => o.tipo === "like" || o.tipo === "reto");
  const durante = (t: number) => (Boolean(props.portada) && t < finPortada) || tapan.some((o) => t >= o.inicio && t < finDeOverlay(o));

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Planos planos={props.planos} />

      {props.portada && (
        <Sequence durationInFrames={f(finPortada)} layout="none">
          <Portada texto={props.portada} duracion={f(finPortada)} />
        </Sequence>
      )}

      <Subtitulos palabras={palabras} destacadas={props.destacadas ?? []} ocultarEn={durante} />

      {props.overlays.map((o, i) => (
        <Sequence key={i} from={f(o.inicio)} durationInFrames={Math.max(1, f(finDeOverlay(o)) - f(o.inicio))} layout="none">
          <OverlayVisual o={o} props={props} />
          <Sequence from={o.tipo === "like" ? f(0.4) : 0} layout="none">
            <Audio src={staticFile(sonidoDe(o))} volume={VOLUMEN_EFECTOS} />
          </Sequence>
        </Sequence>
      ))}

      {/* Whoosh solo en los cortes con transición, no en cada cambio de plano. */}
      {props.planos.map((p, i) =>
        transicionDe(i) === "corte" ? null : (
          <Sequence key={`w${i}`} from={Math.max(0, f(p.inicio) - 4)} durationInFrames={f(0.45)} layout="none">
            <Audio src={staticFile("sfx/whoosh.wav")} volume={VOLUMEN_EFECTOS * 0.7} />
          </Sequence>
        ),
      )}

      {/* La voz va en trozos, ya sin los silencios largos. */}
      {props.voz.src &&
        trozos.map((tr, i) => (
          <Sequence key={`v${i}`} from={f(tr.inicio)} durationInFrames={Math.max(1, f(tr.srcFin) - f(tr.srcInicio))} layout="none">
            <Audio
              src={resolverSrc(props.voz.src as string)}
              trimBefore={f(tr.srcInicio)}
              trimAfter={f(tr.srcFin)}
              volume={props.voz.volumen ?? 1}
            />
          </Sequence>
        ))}

      {props.musica && (
        <Sequence durationInFrames={f(duracion)} layout="none">
          <Audio src={resolverSrc(props.musica.src)} volume={volumenMusica} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
