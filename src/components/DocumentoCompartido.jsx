import React from 'react';

function DocumentoCompartido({ documentoId }) {
  if (!documentoId) {
    return <p>No hay documento para mostrar.</p>;
  }

  const documentUrl = `https://docs.google.com/document/d/${documentoId}/edit`;

  return (
    <div>
      <iframe src={documentUrl} width="100%" height="600px" title="Documento de Google Docs" />
    </div>
  );
}

export default DocumentoCompartido;
