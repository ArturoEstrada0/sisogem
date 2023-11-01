import React, { useState, useEffect } from "react";
import { Button, Space } from "antd";
import { FileAddOutlined } from "@ant-design/icons";
import { uploadFileToS3, downloadFileFromS3, listObjectsInS3Bucket } from "../services/S3Service"; // Asegúrate de que la ruta sea correcta

const FormatosMenu = () => {
  const [objectList, setObjectList] = useState([]);

  useEffect(() => {
    // Llama a una función que obtiene la lista de objetos en el bucket de S3 y actualiza el estado.
    listS3Objects();
  }, []);

  const listS3Objects = async () => {
    try {
      const objects = await listObjectsInS3Bucket("sisogem"); // Reemplaza "sisogem" con el nombre de tu bucket.
      setObjectList(objects);
    } catch (error) {
      console.error("Error al listar objetos de S3:", error);
      // Puedes mostrar una alerta u otro mensaje de error aquí.
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    try {
      await uploadFileToS3(file);
      alert("Archivo subido con éxito!");
      // Vuelve a listar los objetos después de cargar uno nuevo.
      listS3Objects();
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      alert("Error al subir el archivo");
    }
  };

  const handleFileDownload = async (fileName) => {
    try {
      const blob = await downloadFileFromS3(fileName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      // Append to html page
      document.body.appendChild(link);
      // Force download
      link.click();
      // Clean up and remove the link
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      alert("Error al descargar el archivo");
    }
  };

  return (
    <div>
      <h2>Formatos editables</h2>
      <Space size={20}>
        {objectList.map((object, index) => (
          <Button
            key={index}
            icon={<FileAddOutlined style={{ fontSize: "50px" }} />}
            size="large"
            style={{
              width: "220px",
              height: "120px",
              display: "flex",
              flexDirection: "column",
              borderColor: "#6A0F49",
              color: "#6A0F49",
            }}
            onClick={() => handleFileDownload(object.Key)}
          >
            {object.Key}
          </Button>
        ))}
      </Space>
      <div style={{ marginTop: "20px" }}>
        <input type="file" onChange={handleFileUpload} />
      </div>
    </div>
  );
};

export default FormatosMenu;
