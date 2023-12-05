import React, { useState } from "react";
import { List, Button, Card, notification } from "antd";
import PDFViewer from "./PDFViewer";

const showAlert = (type, message) => {
  notification[type]({
    message,
  });
};

const SesionProgreso = ({organismo, sesionesEnProgreso, onFinalizarSesion }) => {
  const [selectedSesionId, setSelectedSesionId] = useState(null);

  const renderItem = (sesion) => (
    <List.Item onClick={() => setSelectedSesionId(sesion.idSesion)}>
      <Card>
        <p>Tipo de Sesión: {sesion.tipoSesion}</p>
        <p>Número de Sesión: {sesion.numeroSesion}</p>
        <p>Fecha: {sesion.fecha}</p>
        <p>Hora de Inicio: {sesion.horaInicio}</p>
        <Button type="primary" onClick={() => onFinalizarSesion(sesion)}>
          Finalizar Sesión
        </Button>
      </Card>
    </List.Item>
  );

  const selectedSesion = sesionesEnProgreso.find(
    (sesion) => sesion.idSesion === selectedSesionId
  );

  // Suponiendo que tienes estos valores en tu objeto de sesión
  const bucket = selectedSesion?.organismo; // o el bucket correspondiente
  const documentKey = selectedSesion?.actaDeSesionUrl; // o la key correspondiente
  console.log("bucket SESION", bucket )

  console.log("organismo exportado", organismo)

  let lastTwoSegments = '';

  try {
    if (documentKey) {
      const urlObject = new URL(documentKey);
      const path = urlObject.pathname;
      const segments = path.split('/');
  
      // Verificar si hay al menos dos segmentos antes de intentar acceder a ellos
      if (segments.length >= 2) {
        const lastTwoDecodedSegments = segments.slice(-2).map(decodeURIComponent);
        lastTwoSegments = lastTwoDecodedSegments.join('/');
      }
    }
  } catch (error) {
    console.error("Error al procesar la URL:", error);
  }
  
  console.log("Últimos dos segmentos de la URL:", lastTwoSegments);
  

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ width: "40%" }}>
        <h2>Sesiones en Progreso</h2>
        <List
          dataSource={sesionesEnProgreso}
          renderItem={renderItem}
          locale={{ emptyText: "No hay sesiones en progreso" }}
        />
      </div>
      <div style={{ width: "60%" }}>
        {documentKey ? (
          <PDFViewer url={documentKey} organismo={organismo} documentKey={lastTwoSegments} />
        ) : (
          <p>No hay Acta de Sesión disponible para esta sesión.</p>
        )}
      </div>
    </div>
  );
};

export default SesionProgreso;
