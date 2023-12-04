import React, { useState } from "react";
import { List, Button, Card, notification } from "antd";
import PDFViewer from "./PDFViewer";

const showAlert = (type, message) => {
  notification[type]({
    message,
  });
};

const SesionProgreso = ({ sesionesEnProgreso, onFinalizarSesion }) => {
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
  const documentos = selectedSesion?.documentos || [];
  const firstDocumentoUrl = documentos.length > 0 ? documentos[0] : null;

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
        <PDFViewer url="https://sisogem.s3.amazonaws.com/sesion_20231203_161843/APPBEJAS.pdf" />
      </div>
    </div>
  );
};

export default SesionProgreso;
