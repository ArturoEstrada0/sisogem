import React, { useState, useEffect, useContext } from "react";
import { Table, Card, Row, Col, Button, Select, Spin } from "antd";
import AWS from "aws-sdk";
import { FolderOutlined } from "@ant-design/icons";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { OrganismoContext } from "../context/OrganismoContext";
import { UserRoleContext } from "../context/UserRoleContext";
import GetAppIcon from '@mui/icons-material/GetApp';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SpeakerNotesIcon from '@mui/icons-material/Announcement';
import DescriptionIcon from '@mui/icons-material/Description';

const { Option } = Select;

const Repositorio = () => {
  const [loading, setLoading] = useState(false);
  const { organismo, setOrganismo } = useContext(OrganismoContext);

  const [sesionesFinalizadas, setSesionesFinalizadas] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [filteredSesiones, setFilteredSesiones] = useState([]);
  const [tipoSesionFilter, setTipoSesionFilter] = useState(null);

  const { currentUser } = useContext(UserRoleContext);

  useEffect(() => {
    if (organismo === "") {
      if (currentUser) setOrganismo(currentUser.organismo[0].code);
      else return;
    }
  }, [organismo, currentUser]);

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
    setLoading(true);
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
    setLoading(false);
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
              position: "relative", /* Agregamos position relative para posicionar el Spin */
            }}
          >
            <div style={{ position: 'relative' }}>
              {loading && ( /* Mostramos el Spin si 'loading' está en true */
                <Spin
                  className="custom-spin"
                  style={{
                    position: "absolute", /* Posicionamos el Spin sobre el botón */
                    left: "50%", /* Ajustamos la posición horizontalmente */
                    top: "50%", /* Ajustamos la posición verticalmente */
                    transform: "translate(-50%, -50%)" /* Centramos el Spin */
                  }}
                />
              )}
              <DescriptionIcon style={{ marginRight: "8px" }} /> Descargar Acta de Sesión
            </div>
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
              position: "relative", /* Agregamos position relative para posicionar el Spin */
            }}
          >
            <div style={{ position: 'relative' }}>
              {loading && ( /* Mostramos el Spin si 'loading' está en true */
                <Spin
                  className="custom-spin"
                  style={{
                    position: "absolute", /* Posicionamos el Spin sobre el botón */
                    left: "50%", /* Ajustamos la posición horizontalmente */
                    top: "50%", /* Ajustamos la posición verticalmente */
                    transform: "translate(-50%, -50%)" /* Centramos el Spin */
                  }}
                />
              )}
              <TrendingUpIcon style={{ marginRight: "8px" }} /> Descargar Estados Financieros
            </div>
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
              position: "relative", /* Agregamos position relative para posicionar el Spin */
            }}
          >
            <div style={{ position: 'relative' }}>
              {loading && ( /* Mostramos el Spin si 'loading' está en true */
                <Spin
                  className="custom-spin"
                  style={{
                    position: "absolute", /* Posicionamos el Spin sobre el botón */
                    left: "50%", /* Ajustamos la posición horizontalmente */
                    top: "50%", /* Ajustamos la posición verticalmente */
                    transform: "translate(-50%, -50%)" /* Centramos el Spin */
                  }}
                />
              )}
              <EventNoteIcon style={{ marginRight: "8px" }} /> Descargar Orden del Día
            </div>
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
      position: "relative", /* Agregamos position relative para posicionar el Spin */
    }}
  >
    <div style={{ position: 'relative' }}>
      {loading && ( /* Mostramos el Spin si 'loading' está en true */
        <Spin
          className="custom-spin"
          style={{
            position: "absolute", /* Posicionamos el Spin sobre el botón */
            left: "50%", /* Ajustamos la posición horizontalmente */
            top: "50%", /* Ajustamos la posición verticalmente */
            transform: "translate(-50%, -50%)" /* Centramos el Spin */
          }}
        />
      )}
      <SpeakerNotesIcon style={{ marginRight: "8px" }} /> Descargar Convocatoria
    </div>
  </Button>
)}
          <Button
  onClick={() => descargarArchivosSesion(record)}
  style={{
    margin: "5px",
    backgroundColor: "#f1cdd3",
    color: "#701e45",
    position: "relative", /* Agregamos position relative para posicionar el Spin */
  }}
>
  <div style={{ position: 'relative' }}>
    {loading && ( /* Mostramos el Spin si 'loading' está en true */
      <Spin
        className="custom-spin"
        style={{
          position: "absolute", /* Posicionamos el Spin sobre el botón */
          left: "50%", /* Ajustamos la posición horizontalmente */
          top: "50%", /* Ajustamos la posición verticalmente */
          transform: "translate(-50%, -50%)" /* Centramos el Spin */
        }}
      />
    )}
    <GetAppIcon style={{ marginRight: "8px" }} />Descargar Todos
  </div>
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

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button
  onClick={descargarTodoElAno}
  style={{
    margin: "5px",
    backgroundColor: "#f1cdd3",
    color: "#701e45",
    position: "relative",
  }}
>
  <div style={{ position: 'relative' }}>
    {loading && (
      <Spin
        className="custom-spin"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)"
        }}
      />
    )}
    <GetAppIcon style={{ marginRight: "8px" }} />Descargar Todo el Año
  </div>
</Button>
        </div>
        <Table dataSource={filteredSesiones} columns={columns} />
      </div>
    )}
  </div>
);
};

export default Repositorio;
