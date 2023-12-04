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
} from "antd";
import SesionesProgramadas from "./SesionesProgramadas";
import SesionProgreso from "./SesionProgreso";
import moment from "moment";
import { gapi } from "gapi-script";

const CLIENT_ID =
  "916932934820-cf1uga91gnn9vodkocvhirsvr8n7bnv2.apps.googleusercontent.com";
const API_KEY = "AIzaSyDZWTZfbWXYXP9yZ4RcDssIzGmHiZuQ46s";
const SCOPES =
  "https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file";
const DISCOVERY_DOCS = [
  "https://docs.googleapis.com/$discovery/rest?version=v1",
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

const { Option } = Select;
const { TabPane } = Tabs;

const ProgramarSesion = () => {
  const [tipoSesion, setTipoSesion] = useState("ordinario");
  const [fecha, setFecha] = useState(null);
  const [horaInicio, setHoraInicio] = useState(null);
  const [numeroSesion, setNumeroSesion] = useState(1);
  const [sesionesProgramadas, setSesionesProgramadas] = useState([]);
  const [sesionesEnProgreso, setSesionesEnProgreso] = useState([]);
  const [documentoId, setDocumentoId] = useState(null); // Almacenar el ID del documento de Google Drive
  const [sesionEditando, setSesionEditando] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [nuevasSesionesProgramadas, setNuevasSesionesProgramadas] = useState(0);
  const [nuevasSesionesEnProgreso, setNuevasSesionesEnProgreso] = useState(0);
  const [documentContent, setDocumentContent] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadFileToDrive(file);
    }
  };

  const uploadFileToDrive = async (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (e) => {
      try {
        const arrayBuffer = reader.result;
        const base64Data = arrayBufferToBase64(arrayBuffer);

        const boundary = "-------314159265358979323846";
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelim = "\r\n--" + boundary + "--";

        const metadata = {
          name: file.name,
          mimeType: "application/vnd.google-apps.document",
        };

        const multipartRequestBody =
          delimiter +
          "Content-Type: application/json\r\n\r\n" +
          JSON.stringify(metadata) +
          delimiter +
          "Content-Type: " +
          file.type +
          "\r\n" +
          "Content-Transfer-Encoding: base64\r\n\r\n" +
          base64Data +
          closeDelim;

        const response = await gapi.client.request({
          path: "/upload/drive/v3/files?uploadType=multipart",
          method: "POST",
          headers: {
            "Content-Type": 'multipart/related; boundary="' + boundary + '"',
          },
          body: multipartRequestBody,
        });

        const documentId = response.result.id;
        const documentUrl =
          "https://docs.google.com/document/d/" + documentId + "/edit";
        setDocumentContent(documentUrl);
        setDocumentoId(response.result.id);


      } catch (error) {
        console.error("Error uploading file to Drive", error);
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file", error);
    };
  };

  // Función auxiliar para convertir ArrayBuffer a Base64
  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  useEffect(() => {
    gapi.load("client:auth2", initializeGoogleApi);
  }, []);

  const initializeGoogleApi = () => {
    gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      })
      .then(() => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
        updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      });
  };

  const updateSignInStatus = (isSignedIn) => {
    setIsSignedIn(isSignedIn);
  };

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  const handleProgramarSesion = () => {
    if (!fecha || !horaInicio) {
      openNotification(
        "error",
        "Error al programar la sesión",
        "Por favor, selecciona fecha y hora de inicio."
      );
      console.log("Programando sesión con Documento ID:", documentoId);

      return;
    }

    const nuevaSesion = {
      tipoSesion,
      numeroSesion,
      fecha: fecha.format("YYYY-MM-DD"),  
      horaInicio: horaInicio.format("HH:mm"),
      documentoId, // Incluir el ID del documento en la sesión programada
      
    };

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
      console.log("Programando sesión con Documento ID:", documentoId);

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
                <TimePicker format="HH:mm" onChange={handleHoraInicioChange} />
              </Form.Item>
              <Form.Item label="Subir Documento para la Sesión">
                {isSignedIn && (
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".doc,.docx"
                  />
                )}
              </Form.Item>
            </Form>
            <Form.Item>
              <Button type="primary" onClick={handleProgramarSesion}>
                {sesionEditando ? "Editar Sesión" : "Programar Sesión"}
              </Button>
            </Form.Item>
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
            />
          </TabPane>
          <TabPane
            tab={
              <span style={{ color: '#6A0F49' }}>
      Sesiones en Progreso{" "}
      {nuevasSesionesEnProgreso > 0 && (
        <Badge
          count={nuevasSesionesEnProgreso}
          style={{ backgroundColor: "#ab1675" }}
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
            rules={[{ required: true, message: "Por favor ingrese la fecha" }]}
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
    </div>
  );
};

export default ProgramarSesion;
