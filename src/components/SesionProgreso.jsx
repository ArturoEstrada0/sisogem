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

  // Obtén la información del documento seleccionado
  const selectedSesion = sesionesEnProgreso.find(
    (sesion) => sesion.documentoId === selectedDocumentoId
  );
  const documentos = selectedSesion?.documentos || [];

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
        {/* Renderiza PDFTron con la información del documento seleccionado */}
        <PDFTron documentos={documentos} />
      </div>
    </div>
  );
};

export default SesionProgreso;
