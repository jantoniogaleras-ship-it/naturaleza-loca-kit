export default function Page() {
  return (
    <main>
      <h1>Naturaleza Loca · motor de render</h1>
      <p>
        Servicio interno. n8n envía los datos de un Short a <code>POST /api/render</code> y consulta{" "}
        <code>GET /api/progress</code> hasta recibir la URL del vídeo.
      </p>
    </main>
  );
}
