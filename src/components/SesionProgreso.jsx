import React, { useState } from "react";
import { List, Button, Card, notification } from "antd";
import PDFViewer from "./PDFViewer";

const SesionProgreso = ({
  organismo,
  sesionesEnProgreso,
  onFinalizarSesion,
}) => {
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

  const documentKey = selectedSesion?.actaDeSesionUrl;
  const googleDocsUrl = selectedSesion?.actaDeSesionGoogleDriveUrl;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "25px",
      }}
    >
      <div style={{ width: "30%" }}>
      <h2>Sesiones en Progreso</h2>
        <List
          dataSource={sesionesEnProgreso}
          renderItem={renderItem}
          locale={{ emptyText: "No hay sesiones en progreso" }}
        />
      </div>
      <div style={{ width: "35%", margin: "0px 20px" }}>
        {documentKey ? (
          <PDFViewer
            url={documentKey}
            organismo={organismo}
            documentKey={documentKey}
          />
        ) : (
          <p>No hay Acta de Sesión en PDF disponible para esta sesión.</p>
        )}
      </div>
      <div style={{ width: "35%" }}>
        {googleDocsUrl ? (
          <iframe
            src={googleDocsUrl}
            width="100%"
            height="600px"
            frameBorder="0"
            title="Acta de Sesión en Google Docs"
          />
        ) : (
          <p>
            No hay Acta de Sesión en Google Docs disponible para esta sesión.
          </p>
        )}
      </div>
    </div>
  );
};

export default SesionProgreso;
