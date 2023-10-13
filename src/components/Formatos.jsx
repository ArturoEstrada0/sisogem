import React, { useState } from 'react';
import { Button, Card, List, Upload } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';

const documentList = [
  {
    id: 1,
    title: 'Documento 1',
    url: 'https://www.gob.mx/cms/uploads/attachment/file/692259/Historia_del_pueblo_mexicano__13ene22.pdf',
  },
  {
    id: 2,  
    title: 'Documento 2',
    url: 'https://ant.design/components/form',
  },
  // Agrega más documentos según sea necesario
];

const Formatos = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
  };

  const handleClosePreview = () => {
    setSelectedDocument(null);
  };

  // Función para manejar la carga de archivos
  const handleFileUpload = (file) => {
    // Aquí puedes manejar el archivo cargado, por ejemplo, almacenarlo en tu servidor.
    // Luego, puedes actualizar la lista de documentos para incluir el nuevo documento.
    // No se muestra la implementación completa de cómo almacenar el archivo en este ejemplo.

    console.log('Archivo cargado:', file);
  };

  return (
    <div className="container">
      <p style={{fontSize: "30px"}}>Documentos Oficiales</p>
      <List
        dataSource={documentList}
        renderItem={(item) => (
          <Card title={item.title}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDocumentClick(item)}
              style={{backgroundColor: "#6A0F49"}}
            >
              Descargar
            </Button>
          </Card>
        )}
      />

      {selectedDocument && (
        <div className="document-preview">
          <Button onClick={handleClosePreview}>Cerrar Vista Previa</Button>
          <iframe title="Documento" src={selectedDocument.url} width="100%" height="500px" />
        </div>
      )}

      {/* Agregar la función de carga de archivos */}
      <Upload
        beforeUpload={handleFileUpload}
        accept=".pdf"
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Subir PDF</Button>
      </Upload>
    </div>
  );
};

export default Formatos;
