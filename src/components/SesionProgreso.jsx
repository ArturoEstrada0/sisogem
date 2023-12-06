import React, { useState } from "react";
import { List, Button, Card, notification, Switch } from "antd";
import PDFViewer from "./PDFViewer";

const SesionProgreso = ({
  organismo,
  sesionesEnProgreso,
  onFinalizarSesion,
  exportarYSubirPDF,
}) => {
  const [selectedSesionId, setSelectedSesionId] = useState(null);
  const [isEditing, setisEditing] = useState(false);

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

  let lastTwoSegments = '';
  if (documentKey) {
    try {
      const urlObject = new URL(documentKey);
      const path = urlObject.pathname;
      const segments = path.split('/');
      if (segments.length >= 2) {
        const lastTwoDecodedSegments = segments.slice(-2).map(decodeURIComponent);
        lastTwoSegments = lastTwoDecodedSegments.join('/');
      }
    } catch (error) {
      console.error("Error al procesar la URL:", error);
    }
  }

  const handleExportarPDF = async () => {
    if (selectedSesionId) {
      const s3Path = `${lastTwoSegments}`;
      await exportarYSubirPDF(googleDocsUrl, s3Path);
    }
  };

  const handleSwitchChange = async (isChecked) => {
    if (!isChecked && selectedSesionId) {
      await handleExportarPDF();
    }
    setisEditing(isChecked);
  };

  return (
    <div style={{ display: "flex", marginTop: "25px" }}>
      <div style={{ width: "30%" }}>
      <h2>Sesiones en Progreso</h2>
        <List
          dataSource={sesionesEnProgreso}
          renderItem={renderItem}
          locale={{ emptyText: "No hay sesiones en progreso" }}
        />
      </div>
      <Switch onChange={handleSwitchChange} />
      {!isEditing && (
        <div>
          {documentKey ? (
            <PDFViewer url={documentKey} organismo={organismo} documentKey={lastTwoSegments} />
          ) : (
            <p>No hay Acta de Sesión en PDF disponible para esta sesión.</p>
          )}
        </div>
      )}
      {isEditing && (
        <div>
          {googleDocsUrl ? (
            <iframe
              src={googleDocsUrl}
              width="800px"
              height="600px"
              frameBorder="0"
              title="Acta de Sesión en Google Docs"
            />
          ) : (
            <p>No hay Acta de Sesión en Google Docs disponible para esta sesión.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SesionProgreso;
