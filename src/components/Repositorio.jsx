import React, { useState, useEffect, useContext } from "react";
import { Table, Card, Row, Col, Button, Select } from "antd";
import AWS from "aws-sdk";
import { FolderOutlined } from "@ant-design/icons";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { OrganismoContext } from "../context/OrganismoContext";

const { Option } = Select;

const Repositorio = () => {
  const { organismo } = useContext(OrganismoContext);

  const [sesionesFinalizadas, setSesionesFinalizadas] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [filteredSesiones, setFilteredSesiones] = useState([]);
  const [tipoSesionFilter, setTipoSesionFilter] = useState(null);

  useEffect(() => {
    const cargarSesionesFinalizadas = async () => {
      const docClient = new AWS.DynamoDB.DocumentClient();
      const params = {
        TableName: "Sesiones",
        FilterExpression: "estatus = :estatus",
        ExpressionAttributeValues: { ":estatus": "Finalizada" },
      };

      try {
        const data = await docClient.scan(params).promise();
        setSesionesFinalizadas(data.Items);
      } catch (error) {
        console.error("Error al cargar sesiones finalizadas:", error);
      }
    };

    cargarSesionesFinalizadas();
  }, []);

  useEffect(() => {
    const filtered = sesionesFinalizadas.filter(
      (sesion) =>
        (selectedYear ? sesion.fecha.startsWith(selectedYear) : true) &&
        (tipoSesionFilter ? sesion.tipoSesion === tipoSesionFilter : true) &&
        (organismo ? sesion.organismo === organismo : true)
    );
    setFilteredSesiones(filtered);
  }, [selectedYear, tipoSesionFilter, organismo, sesionesFinalizadas]);

  // Código para descargar un archivo individual
  const descargarArchivo = async (url, nombreArchivo) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, nombreArchivo);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
    }
  };

  // Código para descargar archivos de una sesión
  const descargarArchivosSesion = async (sesion) => {
    const zip = new JSZip();
  
    // Agregar documentos obligatorios si están disponibles
    const documentosObligatorios = [
      { url: sesion.actaDeSesionUrl, nombre: "Acta_de_Sesion.pdf" },
      { url: sesion.estadosFinancierosUrl, nombre: "Estados_Financieros.pdf" },
      { url: sesion.ordenDelDiaUrl, nombre: "Orden_del_Dia.pdf" },
      { url: sesion.convocatoriaUrl, nombre: "Convocatoria.pdf" },
      // Agrega aquí otros documentos obligatorios si los hay...
    ];
  
    for (const doc of documentosObligatorios) {
      if (doc.url) {
        try {
          const response = await fetch(doc.url);
          const blob = await response.blob();
          zip.file(doc.nombre, blob);
        } catch (error) {
          console.error(`Error al descargar ${doc.nombre}:`, error);
        }
      }
    }
  
    // Agregar documentos adicionales si están disponibles
    for (const archivo of sesion.archivos || []) {
      try {
        const response = await fetch(archivo.url);
        const blob = await response.blob();
        zip.file(archivo.nombre, blob);
      } catch (error) {
        console.error(`Error al descargar archivo adicional ${archivo.nombre}:`, error);
      }
    }
  
    // Generar y descargar el ZIP
    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `documentos_sesion_${sesion.numeroSesion}.zip`);
    } catch (error) {
      console.error("Error al generar el archivo ZIP:", error);
    }
  };
  

  const descargarTodoElAno = async () => {
    if (!selectedYear) {
      console.error("Error: selectedYear no está definido");
      return;
    }

    const zip = new JSZip();

    // Utiliza Promise.all para manejar la asincronía
    await Promise.all(
      filteredSesiones.map(async (sesion) => {
        // Usar tanto el tipo como el número de sesión para crear un identificador único
        const sesionFolderName = `Sesion_${sesion.tipoSesion}_${sesion.numeroSesion}`;
        const sesionFolder = zip.folder(sesionFolderName);

        // Agregar documentos obligatorios
        const documentosObligatorios = [
          { url: sesion.actaDeSesionUrl, nombre: "Acta_de_Sesion.pdf" },
          {
            url: sesion.estadosFinancierosUrl,
            nombre: "Estados_Financieros.pdf",
          },
          { url: sesion.ordenDelDiaUrl, nombre: "Orden_del_Dia.pdf" },
          { url: sesion.convocatoriaUrl, nombre: "Convocatoria.pdf" },
          // Agrega aquí otros documentos obligatorios si los hay...
        ];

        for (const doc of documentosObligatorios) {
          if (doc.url) {
            try {
              const response = await fetch(doc.url);
              const blob = await response.blob();
              sesionFolder.file(doc.nombre, blob);
            } catch (error) {
              console.error(
                `Error al cargar ${doc.nombre} para la sesión ${sesionFolderName}:`,
                error
              );
            }
          }
        }

        // Agregar documentos adicionales
        for (const archivo of sesion.archivos || []) {
          try {
            const response = await fetch(archivo.url);
            const blob = await response.blob();
            sesionFolder.file(archivo.nombre, blob);
          } catch (error) {
            console.error(
              `Error al cargar archivo adicional ${archivo.nombre} para la sesión ${sesionFolderName}:`,
              error
            );
          }
        }
      })
    );

    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `archivos_${selectedYear}.zip`);
    } catch (error) {
      console.error("Error al generar o descargar el archivo ZIP:", error);
    }
  };

  const handleYearClick = (year) => {
    setSelectedYear(year, () => {
      // Después de que setSelectedYear haya actualizado el estado
      descargarTodoElAno();
    });
  };

  const columns = [
    {
      title: "Tipo de Sesión",
      dataIndex: "tipoSesion",
      key: "tipoSesion",
    },

    {
      title: "Número de Sesión",
      dataIndex: "numeroSesion",
      key: "numeroSesion",
    },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
    },

    {
      title: "Acciones",
      key: "acciones",
      render: (text, record) => (
        <>
          {record.actaDeSesionUrl && (
            <Button
              onClick={() =>
                descargarArchivo(record.actaDeSesionUrl, "Acta_de_Sesion.pdf")
              }
              style={{
                margin: "5px",
                backgroundColor: "#6a0f49",
                color: "white",
              }}
            >
              Descargar Acta de Sesión
            </Button>
          )}
          {record.estadosFinancierosUrl && (
            <Button
              onClick={() =>
                descargarArchivo(
                  record.estadosFinancierosUrl,
                  "Estados_Financieros.pdf"
                )
              }
              style={{
                margin: "5px",
                backgroundColor: "#6a0f49",
                color: "white",
              }}
            >
              Descargar Estados Financieros
            </Button>
          )}
          {record.ordenDelDiaUrl && (
            <Button
              onClick={() =>
                descargarArchivo(record.ordenDelDiaUrl, "Orden_del_Dia.pdf")
              }
              style={{
                margin: "5px",
                backgroundColor: "#6a0f49",
                color: "white",
              }}
            >
              Descargar Orden del Día
            </Button>
          )}
          {record.convocatoriaUrl && (
            <Button
              onClick={() =>
                descargarArchivo(record.convocatoriaUrl, "Convocatoria.pdf")
              }
              style={{
                margin: "5px",
                backgroundColor: "#6a0f49",
                color: "white",
              }}
            >
              Descargar Convocatoria
            </Button>
          )}
          <Button
            onClick={() => descargarArchivosSesion(record)}
            style={{
              margin: "5px",
              backgroundColor: "#f1cdd3",
              color: "#701e45",
            }}
          >
            Descargar Todos
          </Button>
        </>
      ),
    },
  ];

  const years = [
    ...new Set(sesionesFinalizadas.map((sesion) => sesion.fecha.split("-")[0])),
  ];
  const tiposDeSesion = [
    ...new Set(sesionesFinalizadas.map((sesion) => sesion.tipoSesion)),
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Repositorio de Archivos</h2>
      <Row gutter={[16, 16]}>
        {years.map((year) => (
          <Col span={8} key={year}>
            <Card
              onClick={() => handleYearClick(year)}
              hoverable
              style={{
                cursor: "pointer",
                margin: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                border:
                  selectedYear === year
                    ? "2px solid #F1CDD3"
                    : "2px solid transparent",
              }}
            >
              <FolderOutlined style={{ fontSize: 48 }} />
              <h3 style={{ marginTop: "10px" }}>{year}</h3>
            </Card>
          </Col>
        ))}
      </Row>
      {selectedYear && (
        <div>
          <h3>Sesiones de {selectedYear}</h3>
          <Select
            placeholder="Filtrar por tipo de sesión"
            style={{ width: 200, marginRight: 10 }}
            onChange={(value) => setTipoSesionFilter(value)}
            allowClear
          >
            {tiposDeSesion.map((tipo) => (
              <Option key={tipo} value={tipo}>
                {tipo}
              </Option>
            ))}
          </Select>

          <Button
            onClick={descargarTodoElAno}
            style={{
              margin: "5px",
              backgroundColor: "#f1cdd3",
              color: "#701e45",
            }}
          >
            Descargar Todo el Año
          </Button>
          <Table dataSource={filteredSesiones} columns={columns} />
        </div>
      )}
    </div>
  );
};

export default Repositorio;
