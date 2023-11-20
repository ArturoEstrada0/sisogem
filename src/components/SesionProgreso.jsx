import React, { useState } from 'react';
import { List, Button, Card } from 'antd';
import DocumentoCompartido from './DocumentoCompartido';

const SesionProgreso = ({ sesionesEnProgreso, onFinalizarSesion }) => {
  const [selectedDocumentoId, setSelectedDocumentoId] = useState(null);
  const [isSigning, setIsSigning] = useState(false);

  // Función para iniciar el proceso de firma
  const iniciarFirmaActa = () => {
    if (!selectedDocumentoId) {
      alert('Por favor, seleccione un documento para firmar.');
      return;
    }
    setIsSigning(true);
  };

  // Función para finalizar el proceso de firma
  const finalizarFirmaActa = () => {
    setIsSigning(false);
    // Aquí puedes agregar la lógica para enviar la firma al documento.
    // Puedes utilizar Google Docs API u otra biblioteca para insertar la firma en el documento.
    // Por simplicidad, aquí mostramos una alerta como simulación.
    alert('Acta firmada exitosamente.');
  };

  const renderItem = sesion => (
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
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ width: '40%' }}>
        <h2>Sesiones en Progreso</h2>
        <List
          dataSource={sesionesEnProgreso}
          renderItem={renderItem}
          locale={{ emptyText: "No hay sesiones en progreso" }}
        />
        {/* Botones para iniciar y finalizar la firma del acta */}
        <Button onClick={iniciarFirmaActa} style={{ margin: '10px 0' }}>Iniciar Firma</Button>
        {isSigning && (
          <Button onClick={finalizarFirmaActa} style={{ margin: '10px 0' }}>Finalizar Firma</Button>
        )}
      </div>
      <div style={{ width: '60%' }}>
        {selectedDocumentoId ? (
          <DocumentoCompartido documentoId={selectedDocumentoId} />
        ) : (
          <p>Seleccione una sesión para ver el documento.</p>
        )}
      </div>
    </div>
  );
};

export default SesionProgreso;
