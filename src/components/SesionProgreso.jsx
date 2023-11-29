import React, { useState } from "react";
import { List, Button, Card, notification } from "antd";
import PDFTron from "./PDFTron";

const showAlert = (type, message) => {
  notification[type]({
    message,
  });
};

const SesionProgreso = ({ sesionesEnProgreso, onFinalizarSesion }) => {
  const [selectedDocumentoId, setSelectedDocumentoId] = useState(null);
  const [isSigning, setIsSigning] = useState(false);

  const iniciarFirmaActa = () => {
    if (!selectedDocumentoId) {
      showAlert("error", "Por favor, seleccione un documento para firmar.");
      return;
    }
    setIsSigning(true);
  };

  const finalizarFirmaActa = () => {
    setIsSigning(false);
    // Add logic here to send the signature to the document using appropriate APIs or libraries.
    showAlert("success", "Acta firmada exitosamente.");
  };

  const renderItem = (sesion) => (
    <List.Item onClick={() => setSelectedDocumentoId(sesion.documentoId)}>
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

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ width: "40%" }}>
        <h2>Sesiones en Progreso</h2>
        <List
          dataSource={sesionesEnProgreso}
          renderItem={renderItem}
          locale={{ emptyText: "No hay sesiones en progreso" }}
        />
        <Button onClick={iniciarFirmaActa} style={{ margin: "10px 0" }}>
          Iniciar Firma
        </Button>
        {isSigning && (
          <Button onClick={finalizarFirmaActa} style={{ margin: "10px 0" }}>
            Finalizar Firma
          </Button>
        )}
      </div>
      <div style={{ width: "60%" }}>
        <PDFTron />
      </div>
    </div>
  );
};

export default SesionProgreso;
