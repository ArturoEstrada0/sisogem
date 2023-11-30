import React, { useState } from "react";
import {
  DatePicker,
  TimePicker,
  Select,
  Button,
  Card,
  Tabs,
  Modal,
  Form,
  notification,
  Badge,
  Spin,
} from "antd";

import SesionesProgramadas from "./SesionesProgramadas";
import SesionProgreso from "./SesionProgreso";
import moment from "moment";
import { uploadFileToS3 } from "../services/S3Service";
import JSZip from "jszip";
import FileSaver from "file-saver";
import { v4 as uuidv4 } from "uuid";

import { Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TabPane } = Tabs;

const ProgramarSesion = () => {
  const [tipoSesion, setTipoSesion] = useState("ordinario");
  const [fecha, setFecha] = useState(null);
  const [horaInicio, setHoraInicio] = useState(null);
  const [numeroSesion, setNumeroSesion] = useState(1);
  const [sesionesProgramadas, setSesionesProgramadas] = useState([]);
  const [sesionesEnProgreso, setSesionesEnProgreso] = useState([]);
  const [sesionEditando, setSesionEditando] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [nuevasSesionesProgramadas, setNuevasSesionesProgramadas] = useState(0);
  const [nuevasSesionesEnProgreso, setNuevasSesionesEnProgreso] = useState(0);
  const [documentosDescargados, setDocumentosDescargados] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async () => {
    try {
      if (fileList.length === 0) {
        return;
      }

      const folderName = `sesion_${moment().format("YYYYMMDD_HHmmss")}`;

      const uploadedFiles = await Promise.all(
        fileList.map(async (file) => {
          const response = await uploadFileToS3(
            file.originFileObj,
            `${folderName}/${file.name}`
          );

          const fileUrl = response.Location;

          // Añade la URL al detalle del archivo
          const fileDetail = {
            nombre: file.name,
            url: fileUrl,
          };

          // Genera un nuevo idSesion para cada archivo
          const idSesion = uuidv4();

          // Guarda la información del archivo en DynamoDB
          await saveFileDetailsToDynamoDB(fileDetail, idSesion);

          return fileDetail;
        })
      );

      setFileList([]);

      // Llamada a la función para guardar los detalles de la sesión en DynamoDB
    } catch (error) {
      console.error("Error al cargar archivos:", error);
      message.error("Error al cargar archivos");
    }
  };

  // Nueva función para guardar detalles del archivo en DynamoDB
  const saveFileDetailsToDynamoDB = async (fileDetails, idSesion) => {
    try {
      // Usa la SDK de AWS para interactuar con DynamoDB y guardar los detalles del archivo
      // Puedes configurar esto según tu entorno y necesidades específicas
      // Aquí un ejemplo de cómo podría verse:
      const AWS = require("aws-sdk");
      const docClient = new AWS.DynamoDB.DocumentClient();

      const params = {
        TableName: "Sesiones",
        Item: {
          // Asegúrate de que estas claves coincidan con las claves de tu tabla en DynamoDB
          idSesion: idSesion, // Agregamos la clave idSesion
          nombre: fileDetails.nombre,
          url: fileDetails.url,
          // Otros atributos que quieras almacenar en DynamoDB
        },
      };

      console.log("Antes de llamar a DynamoDB:", params);
      await docClient.put(params).promise();
      console.log("Después de llamar a DynamoDB.");
    } catch (error) {
      console.error(
        "Error al guardar detalles del archivo en DynamoDB:",
        error
      );
      // Manejo de errores, según sea necesario
    }
  };

  // Nueva función para manejar el cambio en la lista de archivos
  const handleChange = (info) => {
    setFileList(info.fileList);
  };

  const handleDescargarDocumentos = async (sesion) => {
    try {
      const zip = new JSZip();

      if (Array.isArray(sesion?.documentos)) {
        const documentosDescargados = await Promise.all(
          sesion.documentos.map(async (documento) => {
            const { url, nombre } = documento;
            const nombreArchivo = nombre || "documento";

            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(
                `Error al descargar el archivo: ${response.statusText}`
              );
            }
            const blob = await response.blob();
            const pdfBlob = new Blob([blob], { type: "application/pdf" }); // Especificar el tipo MIME para PDF
            zip.file(nombreArchivo, pdfBlob, { binary: true });

            return {
              nombre: nombreArchivo,
              blob: pdfBlob,
            };
          })
        );

        const contenidoZIP = await zip.generateAsync({
          type: "blob",
          compression: "STORE",
        }); // Se desactiva la compresión

        // Guarda la información de los documentos en el estado local
        setDocumentosDescargados(documentosDescargados);

        FileSaver.saveAs(
          contenidoZIP,
          `documentos_${sesion.fecha}_${sesion.horaInicio}.zip`
        );
      } else {
        console.error("La lista de documentos no es un array.");
      }
    } catch (error) {
      console.error("Error al descargar documentos:", error.message);
      // Aquí podrías mostrar un mensaje de error al usuario si es necesario
    }
  };

  const handleTipoSesionChange = (value) => {
    setTipoSesion(value);
  };

  const handleFechaChange = (date) => {
    setFecha(date);
  };

  const handleHoraInicioChange = (time) => {
    setHoraInicio(time);
  };

  const handleNumeroSesionChange = (value) => {
    setNumeroSesion(value);
  };

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  const handleProgramarSesion = async () => {
    setLoading(true); // Inicia el estado de carga
    console.log("Loading antes de la operación:", loading);

    try {
      if (!fecha || !horaInicio) {
        openNotification(
          "error",
          "Error al programar la sesión",
          "Por favor, selecciona fecha y hora de inicio."
        );
        setLoading(false); // Detiene la carga en caso de error temprano
        return;
      }

      const idSesion = uuidv4();

      const nuevaSesion = {
        tipoSesion,
        numeroSesion,
        fecha: fecha.format("YYYY-MM-DD"),
        horaInicio: horaInicio.format("HH:mm"),
        documentos: fileList.map((file) => ({
          nombre: file.name,
          url: file.url, // Asegúrate de que file.url contenga la URL correcta
        })),
        idSesion,
      };

      // Almacena los detalles de la sesión en DynamoDB
      await saveSessionDetailsToDynamoDB(nuevaSesion);

      // Llama a handleFileUpload después de guardar los detalles de la sesión
      await handleFileUpload();

      if (sesionEditando) {
        const sesionesActualizadas = sesionesProgramadas.map((sesion) =>
          sesion === sesionEditando ? nuevaSesion : sesion
        );
        setSesionesProgramadas(sesionesActualizadas);
        setSesionEditando(null);
        openNotification(
          "success",
          "Sesión editada",
          "La sesión se ha editado correctamente."
        );
      } else {
        setSesionesProgramadas([...sesionesProgramadas, nuevaSesion]);
        openNotification(
          "success",
          "Sesión programada",
          "La sesión se ha programado correctamente."
        );
        setNuevasSesionesProgramadas(nuevasSesionesProgramadas + 1);
      }

      setTipoSesion("ordinario");
      setNumeroSesion(1);
      setFecha(null);
      setHoraInicio(null);
      setLoading(false); // Detiene la carga una vez completado
      console.log("Loading después de la operación:", loading);
    } catch (error) {
      console.error("Error al programar la sesión:", error);
      setLoading(false); // Detiene la carga en caso de error
    }
  };

  // Nueva función para guardar detalles de la sesión en DynamoDB
  const saveSessionDetailsToDynamoDB = async (sessionDetails) => {
    try {
      const AWS = require("aws-sdk");
      const docClient = new AWS.DynamoDB.DocumentClient();

      const params = {
        TableName: "Sesiones",
        Item: {
          idSesion: sessionDetails.idSesion,
          tipoSesion: sessionDetails.tipoSesion,
          numeroSesion: sessionDetails.numeroSesion,
          fecha: sessionDetails.fecha,
          horaInicio: sessionDetails.horaInicio,
          documentos: sessionDetails.documentos.map((file) => ({
            nombre: file.nombre,
            url: file.url,
          })),
        },
      };

      console.log("Antes de llamar a DynamoDB:", params);
      await docClient.put(params).promise();
      console.log("Después de llamar a DynamoDB.");
    } catch (error) {
      console.error(
        "Error al guardar detalles de la sesión en DynamoDB:",
        error
      );
      setLoading(false); // Detiene la carga en caso de error
      throw error; // Es importante lanzar el error para que pueda ser capturado por el bloque try-catch en handleProgramarSesion
    }
  };

  const handleIniciarSesion = (sesion) => {
    setSesionesProgramadas(sesionesProgramadas.filter((s) => s !== sesion));
    setSesionesEnProgreso([...sesionesEnProgreso, sesion]);
    openNotification(
      "success",
      "Sesión iniciada",
      "La sesión se ha iniciado correctamente."
    );
    setNuevasSesionesEnProgreso(nuevasSesionesEnProgreso + 1);
  };

  const handleEditarSesion = (sesion) => {
    setSesionEditando(sesion);
    setModalVisible(true);
    form.setFieldsValue({
      tipoSesion: sesion.tipoSesion,
      numeroSesion: sesion.numeroSesion,
      fecha: moment(sesion.fecha),
      horaInicio: moment(sesion.horaInicio, "HH:mm"),
    });
  };

  const handleBorrarSesion = (sesion) => {
    Modal.confirm({
      title: "Confirmar eliminación",
      content: "¿Estás seguro de que deseas borrar esta sesión?",
      onOk: () => {
        setSesionesProgramadas(sesionesProgramadas.filter((s) => s !== sesion));
        openNotification(
          "success",
          "Sesión eliminada",
          "La sesión se ha eliminado correctamente."
        );
      },
    });
  };

  const handleFinalizarSesion = (sesion) => {
    setSesionesEnProgreso(sesionesEnProgreso.filter((s) => s !== sesion));
    // Puedes agregar lógica adicional al finalizar una sesión
    openNotification(
      "success",
      "Sesión finalizada",
      "La sesión se ha finalizado correctamente."
    );
    setNuevasSesionesEnProgreso(nuevasSesionesEnProgreso - 1);
  };

  const renderNumeroSesionOptions = () => {
    const maxSesiones = tipoSesion === "ordinario" ? 4 : 24;
    const opciones = [];

    for (let i = 1; i <= maxSesiones; i++) {
      opciones.push(<Option key={i} value={i}>{`Sesión ${i}`}</Option>);
    }

    return opciones;
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const editedData = {
        ...sesionEditando,
        tipoSesion: values.tipoSesion,
        numeroSesion: values.numeroSesion,
        fecha: values.fecha.format("YYYY-MM-DD"),
        horaInicio: values.horaInicio.format("HH:mm"),
      };
      setSesionesProgramadas(
        sesionesProgramadas.map((s) => (s === sesionEditando ? editedData : s))
      );
      setSesionEditando(null);
      setModalVisible(false);
      openNotification(
        "success",
        "Sesión editada",
        "La sesión se ha editado correctamente."
      );
    });
  };

  const handleModalCancel = () => {
    setSesionEditando(null);
    setModalVisible(false);
  };

  const handleTabsChange = (key) => {
    if (key === "programadas") {
      setNuevasSesionesProgramadas(0);
    } else if (key === "progreso") {
      setNuevasSesionesEnProgreso(0);
    }
  };

  return (
    <div>
      <Spin spinning={loading} size="large" className="custom-spin">
        <h2>Programar Sesión</h2>
        <Card>
          <Tabs
            defaultActiveKey="programar"
            type="card"
            onChange={handleTabsChange}
          >
            <TabPane
              tab={
                <span>
                  Programar Sesión{" "}
                  {nuevasSesionesProgramadas > 0 && (
                    <Badge
                      count={nuevasSesionesProgramadas}
                      style={{ backgroundColor: "#52c41a" }}
                    />
                  )}
                </span>
              }
              key="programar"
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Tipo de Sesión"
                  name="tipoSesion"
                  initialValue="ordinario"
                >
                  <Select onChange={handleTipoSesionChange}>
                    <Option value="ordinario">Ordinario</Option>
                    <Option value="extraordinario">Extraordinario</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Número de Sesión"
                  name="numeroSesion"
                  initialValue={1}
                >
                  <Select onChange={handleNumeroSesionChange}>
                    {renderNumeroSesionOptions()}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Fecha"
                  name="fecha"
                  rules={[
                    { required: true, message: "Por favor ingrese la fecha" },
                  ]}
                >
                  <DatePicker onChange={handleFechaChange} />
                </Form.Item>
                <Form.Item
                  label="Hora de Inicio"
                  name="horaInicio"
                  rules={[
                    {
                      required: true,
                      message: "Por favor ingrese la hora de inicio",
                    },
                  ]}
                >
                  <TimePicker
                    format="HH:mm"
                    onChange={handleHoraInicioChange}
                  />
                </Form.Item>

                {/* Nuevo campo para cargar documentos */}
                <Form.Item label="Cargar Documentos" name="documentos">
                  <Upload
                    beforeUpload={() => false}
                    accept=".pdf"
                    multiple
                    onChange={handleChange}
                  >
                    <Button icon={<UploadOutlined />}>
                      Click para cargar documentos
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" onClick={handleProgramarSesion}>
                    {sesionEditando ? "Editar Sesión" : "Programar Sesión"}
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane
              tab={
                <span>
                  Sesiones Programadas{" "}
                  {nuevasSesionesProgramadas > 0 && (
                    <Badge
                      count={nuevasSesionesProgramadas}
                      style={{ backgroundColor: "#52c41a" }}
                    />
                  )}
                </span>
              }
              key="programadas"
            >
              <SesionesProgramadas
                data={sesionesProgramadas}
                onIniciarSesion={handleIniciarSesion}
                onEditarSesion={handleEditarSesion}
                onBorrarSesion={handleBorrarSesion}
                onDescargarDocumentos={handleDescargarDocumentos}
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  Sesiones en Progreso{" "}
                  {nuevasSesionesEnProgreso > 0 && (
                    <Badge
                      count={nuevasSesionesEnProgreso}
                      style={{ backgroundColor: "#52c41a" }}
                    />
                  )}
                </span>
              }
              key="progreso"
            >
              <SesionProgreso
                sesionesEnProgreso={sesionesEnProgreso}
                onFinalizarSesion={handleFinalizarSesion}
              />
            </TabPane>
          </Tabs>
        </Card>

        <Modal
          title="Editar Sesión"
          visible={modalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
        >
          <Form form={form}>
            <Form.Item
              label="Tipo de Sesión"
              name="tipoSesion"
              rules={[
                {
                  required: true,
                  message: "Por favor seleccione el tipo de sesión",
                },
              ]}
            >
              <Select>
                <Option value="ordinario">Ordinario</Option>
                <Option value="extraordinario">Extraordinario</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Número de Sesión"
              name="numeroSesion"
              rules={[
                {
                  required: true,
                  message: "Por favor seleccione el número de sesión",
                },
              ]}
            >
              <Select>{renderNumeroSesionOptions()}</Select>
            </Form.Item>
            <Form.Item
              label="Fecha"
              name="fecha"
              rules={[
                { required: true, message: "Por favor ingrese la fecha" },
              ]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              label="Hora de Inicio"
              name="horaInicio"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese la hora de inicio",
                },
              ]}
            >
              <TimePicker format="HH:mm" />
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default ProgramarSesion;
