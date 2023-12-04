import React, { useState, useEffect } from "react";
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
import AWS from "aws-sdk";

import SesionesProgramadas from "./SesionesProgramadas";
import SesionProgreso from "./SesionProgreso";
import moment from "moment";
import { uploadFileToS3 } from "../services/S3Service";
import { OrganismoContext } from "../context/OrganismoContext";
import { UserRoleContext } from "../context/UserRoleContext";
import JSZip from "jszip";
import FileSaver from "file-saver";
import { v4 as uuidv4 } from "uuid";

import { Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { async } from "q";
import { UserService } from "../services/UserService";

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
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  //importamos el contexto de organimos
  const { organismo, setOrganismo } = useContext(OrganismoContext);
  const { currentUser } = useContext(UserRoleContext);

  AWS.config.update({
    accessKeyId: "AKIASAHHYXZDGGYMQIEG",
    secretAccessKey: "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",
    region: "us-east-1",
  });
  // const AWS = require("aws-sdk");
  const docClient = new AWS.DynamoDB.DocumentClient();

  // Dentro de tu componente ProgramarSesion
  useEffect(() => {
    fetchSesionesProgramadas();
  }, []);

  /*
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nuevasSesionesEnProgreso = sesionesProgramadas.filter((sesion) => {
        const sesionDateTime = new Date(`${sesion.fecha}T${sesion.horaInicio}`);
        return sesionDateTime <= now;
      });

      if (nuevasSesionesEnProgreso.length > 0) {
        const actualizadasSesionesProgramadas = sesionesProgramadas.filter(
          (sesion) => {
            const sesionDateTime = new Date(
              `${sesion.fecha}T${sesion.horaInicio}`
            );
            return sesionDateTime > now;
          }
        );

        setSesionesProgramadas(actualizadasSesionesProgramadas);
        setSesionesEnProgreso((prevSesiones) => [
          ...prevSesiones,
          ...nuevasSesionesEnProgreso,
        ]);
      }
    }, 30000); // Revisa cada minuto

    return () => clearInterval(interval);
  }, [sesionesProgramadas]);*/

  useEffect(() => {

    if (organismo === "") {

      if (currentUser) setOrganismo(currentUser.organismo[0].code);
      else return;
    } 
  }, [currentUser]);


  const handleFileUpload = async () => {
    try {
      // Generar un ID único para la sesión
      const idSesion = uuidv4();
      const folderName = `sesion_${moment().format("YYYYMMDD_HHmmss")}`;

      // Subir archivos a S3 y recolectar detalles
      const fileDetailsArray = [];
      for (let file of fileList) {
        const response = await uploadFileToS3(
          file.originFileObj,
          `${folderName}/${file.name}`
        );
        fileDetailsArray.push({ nombre: file.name, url: response.Location });
      }

      // Construir objeto con todos los detalles de la sesión
      const sessionData = {
        idSesion,
        tipoSesion,
        numeroSesion,
        fecha: fecha ? fecha.format("YYYY-MM-DD") : null,
        horaInicio: horaInicio ? horaInicio.format("HH:mm") : null,
        folderUrl: `https://sisogem.s3.amazonaws.com/${folderName}`,
        archivos: fileDetailsArray,
        estatus: "Programado", // Puede ser "Programado", "Activo" o "Finalizado"
        organismo: organismo,
        contador: [currentUser.email],
        // otros datos relevantes...
      };

      // Guardar en DynamoDB
      await saveSessionToDynamoDB(sessionData);
      setFileList([]);
    } catch (error) {
      console.error("Error al cargar archivos:", error);
      message.error("Error al cargar archivos");
    }
  };

  const saveSessionToDynamoDB = async (sessionData) => {
    try {
      const params = {
        TableName: "Sesiones",
        Item: sessionData,
      };

      await docClient.put(params).promise();
    } catch (error) {
      console.error("Error al guardar sesión en DynamoDB:", error);
      throw error;
    }
  };

  const validarCantidadUsuarios = async (sesion) => {
    const usersList = await UserService.getUserByOrganismo(organismo);
    const usersByOrganismoCount = Math.floor(usersList.length / 2) + 1;
    if (sesion.contador.length >= usersByOrganismoCount) {
      const params = {
        TableName: 'Sesiones',
        Key: {
          idSesion: sesion.idSesion
        },
        UpdateExpression: 'set estatus=:newStatus',
        ExpressionAttributeValues: {
          ':newStatus': 'Activo'
        },
        ReturnValues: 'ALL_NEW'
      }
      docClient.update(params, (err, data) => {
        console.log({err, data})
      })
    }
    await fetchSesionesProgramadas();
  }
  
  const paseListaDeUsuario = async (sesion) => {
    const params = {
      TableName: 'Sesiones',
      Key: {
        idSesion: sesion.idSesion
      },
      UpdateExpression: 'set contador=list_append(contador, :newUser)',
      ExpressionAttributeValues: {
        ':newUser': [ currentUser.email ]
      },
      ReturnValues: 'ALL_NEW'
    }
    docClient.update(params, async (err, data) => {
      if (err) {
        console.log('Error al actualizar'); 
        return;
      }
      await fetchSesionesProgramadas()
      await validarCantidadUsuarios(data.Attributes)
    })
  
  }

  

  // Nueva función para manejar el cambio en la lista de archivos
  const handleChange = (info) => {
    setFileList(info.fileList);
  };

  const handleDescargarDocumentos = async (sesion) => {
    try {
      const zip = new JSZip();
      const folderUrl = sesion.folderUrl;
      const folderName = folderUrl.split("/").pop(); // Extrae el nombre de la carpeta

      // Configura el cliente S3
      const s3 = new AWS.S3();

      const params = {
        Bucket: "sisogem", // Nombre de tu bucket en S3
        Prefix: folderName + "/", // Prefijo para listar archivos en la carpeta específica
      };

      const data = await s3.listObjectsV2(params).promise();
      const files = data.Contents;

      for (let file of files) {
        const objectParams = {
          Bucket: "sisogem",
          Key: file.Key,
        };

        const fileData = await s3.getObject(objectParams).promise();
        zip.file(file.Key.split("/").pop(), fileData.Body, { binary: true });
      }

      const contenidoZIP = await zip.generateAsync({ type: "blob" });
      FileSaver.saveAs(contenidoZIP, `documentos_${folderName}.zip`);
    } catch (error) {
      console.error("Error al descargar documentos:", error);
      // Manejo de errores
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

  const fetchSesionesProgramadas = async () => {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
      TableName: "Sesiones",
      // Aquí puedes agregar filtros si son necesarios
    };

    try {
      const data = await docClient.scan(params).promise();
      setSesionesProgramadas(data.Items);
    } catch (error) {
      console.error("Error al recuperar sesiones:", error);
      // Manejo de errores
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
                      style={{ backgroundColor: "#ab1675" }}
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
                paseListaDeUsuario={paseListaDeUsuario}
                currentUser={currentUser}
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
