import React, { useState, useContext } from "react";
import { List, Button, Card, notification, Switch, Spin } from "antd";
import PDFViewer from "./PDFViewer";
import { UserRoleContext } from "../context/UserRoleContext";

const SesionProgreso = ({
  organismo,
  sesionesEnProgreso,
  onFinalizarSesion,
  exportarYSubirPDF,
}) => {
  const [selectedSesionId, setSelectedSesionId] = useState(null);
  const [isEditing, setisEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(UserRoleContext);
  const [switchChecked, setSwitchChecked] = useState(false);

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

  let lastTwoSegments = "";
  if (documentKey) {
    try {
      const urlObject = new URL(documentKey);
      const path = urlObject.pathname;
      const segments = path.split("/");
      if (segments.length >= 2) {
        const lastTwoDecodedSegments = segments
          .slice(-2)
          .map(decodeURIComponent);
        lastTwoSegments = lastTwoDecodedSegments.join("/");
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
    setSwitchChecked(isChecked);

    setLoading(true); // Activa el Spin antes de la operación

    if (!isChecked && selectedSesionId) {
      await handleExportarPDF();
    }
    setisEditing(isChecked);

    setLoading(false); // Desactiva el Spin después de la operación
  };

  const documentViewerStyle = {
    width: "800px",
    height: "600px",
    border: "none",
    overflow: "hidden"
  };

  const switchStyle = switchChecked
    ? { backgroundColor: "#701e45" } // Color cuando está activo
    : { backgroundColor: "#f1cdd3" }; // Color cuando está desactivado

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
        {currentUser?.rol.rol === "Comisario" && (
        <Switch onChange={handleSwitchChange} style={switchStyle} />
      )}
      <Spin spinning={loading} size="large" className="custom-spin">
        {!isEditing && documentKey && (
          <div style={documentViewerStyle}>
            <PDFViewer
              url={documentKey}
              organismo={organismo}
              documentKey={lastTwoSegments}
            />
          </div>
        )}
        {isEditing && googleDocsUrl && (
          <iframe
            src={googleDocsUrl}
            style={documentViewerStyle}
            title="Acta de Sesión en Google Docs"
          />
        )}
      </Spin>
    </div>
  );
};

export default SesionProgreso;