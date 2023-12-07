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
  Input,
  Row,
  Col,
} from "antd";
import AWS from "aws-sdk";
import { gapi } from "gapi-script";

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
import { UserService } from "../services/UserService";

const { Option } = Select;
const { TabPane } = Tabs;

// Tus credenciales y configuraciones de Google API
const CLIENT_ID =
  "697900774476-p35j99gvs9em0ue3fpebtuhvg7dhhcdn.apps.googleusercontent.com";
const API_KEY = "AIzaSyCBSPn5iqtPNrEllJB7MknRrbVngMOcyAo";
const SCOPES =
  "https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive";
const DISCOVERY_DOCS = [
  "https://docs.googleapis.com/$discovery/rest?version=v1",
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

const ProgramarSesion = () => {
  const [tipoSesion, setTipoSesion] = useState("Ordinario");
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
  const [gapiReady, setGapiReady] = useState(false);
  const [actaDeSesionGoogleDriveUrl, setActaDeSesionGoogleDriveUrl] =
    useState(null);

  const [isSignedIn, setIsSignedIn] = useState(false); // Nuevo estado para el inicio de sesión
  const [isHovered, setIsHovered] = useState({
    actaDeSesion: false,
    documentos: false, // Agrega un identificador único para el otro botón
  });
  //importamos el contexto de organimos
  const { organismo, setOrganismo } = useContext(OrganismoContext);
  const { currentUser } = useContext(UserRoleContext);

  const [actaDeSesion, setActaDeSesion] = useState(null);

  useEffect(() => {
    if (organismo === "") {
      if (currentUser) setOrganismo(currentUser.organismo[0].code);
      else return;
    }
  }, [currentUser]);

  const showAlert = (type, message) => {
    notification[type]({
      message,
    });
  };

  const handleMouseEnter = (buttonName) => {
    setIsHovered((prev) => ({
      ...prev,
      [buttonName]: true,
    }));
  };

  const handleMouseLeave = (buttonName) => {
    setIsHovered((prev) => ({
      ...prev,
      [buttonName]: false,
    }));
  };

  const [estadosFinancieros, setEstadosFinancieros] = useState(null);
  const [ordenDelDia, setOrdenDelDia] = useState(null);
  const [convocatoria, setConvocatoria] = useState(null);

  AWS.config.update({
    accessKeyId: "AKIASAHHYXZDGGYMQIEG",
    secretAccessKey: "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",
    region: "us-east-1",
  });
  // const AWS = require("aws-sdk");
  const docClient = new AWS.DynamoDB.DocumentClient();

  useEffect(() => {
    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(() => {
          // Escucha cambios en el estado de inicio de sesión
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
          // Intentar inicio de sesión automático solo para usuarios "Comisario"
          if (currentUser?.rol?.rol === "Comisario") {
            handleAuthClick();
          }
          setGapiReady(true);
          // Establece el estado inicial
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        });
    });
  }, []);

  const updateSigninStatus = (isSignedIn) => {
    setIsSignedIn(isSignedIn);
  };

  const handleAuthClick = () => {
    if (isSignedIn) {
      gapi.auth2.getAuthInstance().signOut();
    } else {
      gapi.auth2.getAuthInstance().signIn();
    }
  };

  // Dentro de tu componente ProgramarSesion
  useEffect(() => {
    fetchSesionesProgramadas();
  }, []);

  useEffect(() => {
    const actualizarNumeroSesion = async () => {
      const maxSesionesOrdinarias = 4;
      const maxSesionesExtraordinarias = 24;

      const docClient = new AWS.DynamoDB.DocumentClient();
      const params = {
        TableName: "Sesiones",
        FilterExpression: "tipoSesion = :ts and organismo = :org",
        ExpressionAttributeValues: {
          ":ts": tipoSesion,
          ":org": organismo,
        },
      };

      try {
        const data = await docClient.scan(params).promise();
        const numeroMaximoSesion = data.Items.reduce(
          (max, sesion) => Math.max(max, sesion.numeroSesion || 0),
          0
        );

        const limiteSesiones =
          tipoSesion === "Ordinario"
            ? maxSesionesOrdinarias
            : maxSesionesExtraordinarias;

        if (numeroMaximoSesion >= limiteSesiones) {
          if (tipoSesion === "Ordinario") {
            openNotification(
              "warning",
              "Límite Alcanzado",
              "Has alcanzado el límite de sesiones ordinarias. Considera programar una sesión extraordinaria."
            );
          } else {
            openNotification(
              "error",
              "Límite Alcanzado",
              "Se ha alcanzado el límite de sesiones extraordinarias. Por favor, contacta al administrador."
            );
          }
          setLoading(false);
          return;
        }

        setNumeroSesion(numeroMaximoSesion + 1);
      } catch (error) {
        console.error("Error al obtener el número máximo de sesión:", error);
      }
    };

    actualizarNumeroSesion();
  }, [tipoSesion, organismo]);

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
    }, 3000); // Revisa cada minuto

    return () => clearInterval(interval);
  }, [sesionesProgramadas]);

  // Asegúrate de cargar las bibliotecas de Google API antes de utilizar esta función.

  const subirArchivoAGoogleDriveSecond = async (archivo) => {
    if (!gapiReady) {
      showAlert("error", "Google API aún no está lista");
      return null;
    }

    return new Promise(async (resolve, reject) => {
      const token = gapi.auth.getToken().access_token; // Obtener el token de acceso

      const form = new FormData();
      form.append(
        "metadata",
        new Blob(
          [
            JSON.stringify({
              name: archivo.name,
              mimeType: "application/vnd.google-apps.document", // Opcional, dependiendo del archivo
            }),
          ],
          { type: "application/json" }
        )
      );

      form.append("file", archivo);

      try {
        const response = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
          {
            method: "POST",
            headers: new Headers({ Authorization: "Bearer " + token }),
            body: form,
          }
        );

        const result = await response.json();

        if (response.ok) {
          console.log(result);
          resolve(result.id); // Devuelve el ID del archivo
        } else {
          console.error("Error en la respuesta de Google Drive:", result);
          showAlert("error", "Error al subir el archivo a Google Drive");
          reject(null);
        }
      } catch (error) {
        console.error("Error al subir el archivo a Google Drive:", error);
        showAlert("error", "Error al subir el archivo a Google Drive");
        reject(null);
      }
    });
  };

  const convertirAPdf = async (fileId) => {
    if (!gapiReady) {
      showAlert("error", "Google API aún no está lista");
      return null;
    }

    const token = gapi.auth.getToken().access_token; // Obtener el token de acceso

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`,
        {
          method: "GET",
          headers: new Headers({ Authorization: "Bearer " + token }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        console.log(blob);
        return blob; // Retorna el Blob PDF
      } else {
        const errorResult = await response.json();
        console.error("Error al exportar a PDF:", errorResult);
        showAlert("error", "Error al exportar el archivo a PDF");
        return null;
      }
    } catch (error) {
      console.error("Error al exportar el archivo a PDF:", error);
      showAlert("error", "Error al exportar el archivo a PDF");
      return null;
    }
  };

  const subirArchivoAGoogleDrive = async (archivo) => {
    // Uso de las funciones
    return new Promise(async (resolve, reject) => {
      const driveFileId = await subirArchivoAGoogleDriveSecond(archivo);
      if (driveFileId) {
        const pdfBlob = await convertirAPdf(driveFileId);
        setActaDeSesionGoogleDriveUrl(
          `https://docs.google.com/document/d/${driveFileId}/edit`
        );

        resolve([
          `https://docs.google.com/document/d/${driveFileId}/edit`,
          pdfBlob,
        ]);
      } else {
        showAlert("error", "Error al subir el archivo a Google Drive");
        reject(null);
      }
    });
  };

  const handleFileUpload = async () => {
    try {
      // Generar un ID único para la sesión
      const idSesion = uuidv4();
      const folderName = `sesion_${moment().format("YYYYMMDD_HHmmss")}`;

      let actaDeSesionUrl,
        actaDeSesionGoogleDriveUrl,
        estadosFinancierosUrl,
        ordenDelDiaUrl,
        convocatoriaUrl;

      // Subir el Acta de Sesión a S3 y obtener su URL
      const [fileIdGoogleDrive, blob] = await subirArchivoAGoogleDrive(
        actaDeSesion
      );
      if (fileIdGoogleDrive) {
        setActaDeSesionGoogleDriveUrl(fileIdGoogleDrive);
      }
      console.log([fileIdGoogleDrive, blob]);
      if (blob) {
        const responseS3 = await uploadFileToS3(
          blob,
          organismo,
          `${folderName}/${actaDeSesion.name.replace(".docx", ".pdf")}`
        );
        actaDeSesionUrl = responseS3.Location;

        // Subir el Acta de Sesión a Google Drive y obtener su URL

        if (fileIdGoogleDrive) {
          actaDeSesionGoogleDriveUrl = fileIdGoogleDrive; // Asignar directamente
        }
      }

      // Subir Estados Financieros a S3 si está presente y obtener su URL
      if (estadosFinancieros) {
        const response = await uploadFileToS3(
          estadosFinancieros,
          organismo,
          `${folderName}/${estadosFinancieros.name}`
        );
        estadosFinancierosUrl = response.Location;
      }

      // Subir Orden del Día a S3 si está presente y obtener su URL
      if (ordenDelDia) {
        const response = await uploadFileToS3(
          ordenDelDia,
          organismo,
          `${folderName}/${ordenDelDia.name}`
        );
        ordenDelDiaUrl = response.Location;
      }

      // Subir Convocatoria a S3 si está presente y obtener su URL
      if (convocatoria) {
        const response = await uploadFileToS3(
          convocatoria,
          organismo,
          `${folderName}/${convocatoria.name}`
        );
        convocatoriaUrl = response.Location;
      }

      // Subir los demás archivos a S3 y recolectar detalles
      const fileDetailsArray = await Promise.all(
        fileList.map(async (file) => {
          const response = await uploadFileToS3(
            file.originFileObj,
            organismo,
            `${folderName}/${file.name}`
          );
          return { nombre: file.name, url: response.Location };
        })
      );

      // Construir objeto con todos los detalles de la sesión
      const sessionData = {
        idSesion,
        tipoSesion,
        numeroSesion,
        fecha: fecha ? fecha.format("YYYY-MM-DD") : null,
        horaInicio: horaInicio ? horaInicio.format("HH:mm") : null,
        folderUrl: `https://${organismo}.s3.amazonaws.com/${folderName}`,
        archivos: fileDetailsArray,
        actaDeSesionUrl,
        actaDeSesionGoogleDriveUrl, // Guardar URL de Google Drive
        estadosFinancierosUrl,
        ordenDelDiaUrl,
        convocatoriaUrl,
        estatus: "Programado",
        organismo: organismo,
        contador: [currentUser.email],
        // otros datos relevantes...
      };

      // Guardar en DynamoDB
      const response = await saveSessionToDynamoDB(sessionData);
      console.log("Respuesta de DynamoDB:", response);

      setFileList([]);
      setActaDeSesion(null);
      setEstadosFinancieros(null);
      setOrdenDelDia(null);
      setConvocatoria(null); // Limpiar los estados de los archivos
    } catch (error) {
      console.error("Error al cargar archivos:", error);
      message.error("Error al cargar archivos");
    }
  };

  const extraerGoogleDocId = (url) => {
    const regex = /\/d\/(.+?)\//;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const exportarYSubirPDF = async (googleDocsUrl, s3) => {
    try {
      console.log(
        "Iniciando exportación y subida de PDF para la URL:",
        googleDocsUrl
      );

      if (!googleDocsUrl) {
        showAlert(
          "error",
          "La URL del documento de Google Docs no está definida"
        );
        return;
      }

      const fileId = extraerGoogleDocId(googleDocsUrl);
      if (!fileId) {
        showAlert(
          "error",
          "No se pudo obtener el ID del archivo de Google Docs"
        );
        console.error(
          "No se pudo extraer el ID del archivo desde la URL:",
          googleDocsUrl
        );
        return;
      }

      console.log("Exportando documento con ID:", fileId);
      const pdfBlob = await convertirAPdf(fileId);

      if (!pdfBlob) {
        showAlert("error", "Fallo al exportar el archivo a PDF");
        console.error(
          "Fallo al obtener el blob PDF para el archivo con ID:",
          fileId
        );
        return;
      }

      console.log("Subiendo PDF a S3...");
      const responseS3 = await uploadFileToS3(pdfBlob, organismo, s3);
      const pdfUrl = responseS3.Location;
      console.log("PDF exportado y subido a S3 con éxito. URL:", pdfUrl);

      showAlert("success", "PDF exportado y subido a S3 con éxito");
    } catch (error) {
      console.error("Error al exportar y subir el PDF:", error);
      showAlert("error", "Error al exportar y subir el PDF");
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

  const validarNumeroDeSesion = async (numeroSesion, tipoSesion, organismo) => {
    const params = {
      TableName: "Sesiones",
    };

    try {
      const data = await docClient.scan(params).promise();
      console.log("Items recuperados:", data.Items); // Agrega este log

      const sesionesFiltradas = data.Items.filter(
        (item) =>
          item.tipoSesion === tipoSesion &&
          item.organismo === organismo &&
          parseInt(item.numeroSesion) === numeroSesion // Asegúrate de que los tipos coincidan
      );

      console.log("Sesiones filtradas:", sesionesFiltradas); // Agrega este log
      return sesionesFiltradas.length > 0;
    } catch (error) {
      console.error("Error al validar el número de sesión:", error);
      throw error;
    }
  };

  const validarCantidadUsuarios = async (sesion) => {
    const usersList = await UserService.getUserByOrganismo(organismo);
    const usersByOrganismoCount = Math.floor(usersList.length / 2) + 1;
    if (sesion.contador.length >= usersByOrganismoCount) {
      const params = {
        TableName: "Sesiones",
        Key: {
          idSesion: sesion.idSesion,
        },
        UpdateExpression: "set estatus=:newStatus",
        ExpressionAttributeValues: {
          ":newStatus": "Activo",
        },
        ReturnValues: "ALL_NEW",
      };
      docClient.update(params, (err, data) => {
        console.log({ err, data });
      });
    }
    await fetchSesionesProgramadas();
  };

  const paseListaDeUsuario = async (sesion) => {
    const params = {
      TableName: "Sesiones",
      Key: {
        idSesion: sesion.idSesion,
      },
      UpdateExpression: "set contador=list_append(contador, :newUser)",
      ExpressionAttributeValues: {
        ":newUser": [currentUser.email],
      },
      ReturnValues: "ALL_NEW",
    };
    docClient.update(params, async (err, data) => {
      if (err) {
        console.log("Error al actualizar");
        return;
      }
      await fetchSesionesProgramadas();
      await validarCantidadUsuarios(data.Attributes);
    });
  };

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
        Bucket: organismo, // Nombre de tu bucket en S3
        Prefix: folderName + "/", // Prefijo para listar archivos en la carpeta específica
      };

      const data = await s3.listObjectsV2(params).promise();
      const files = data.Contents;

      for (let file of files) {
        const objectParams = {
          Bucket: organismo,
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
    setLoading(true);

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

      // Validar si ya existe el número de sesión
      const esNumeroValido = await validarNumeroDeSesion(
        numeroSesion,
        tipoSesion,
        organismo
      );
      if (esNumeroValido) {
        // Si es verdadero, significa que ya existe una sesión con este número
        openNotification(
          "error",
          "Número de Sesión Repetido",
          "Ya existe una sesión con este número. Por favor, elige otro número."
        );
        setLoading(false);
        return;
      }

      // Validación de documentos para sesiones ordinarias
      if (
        tipoSesion === "Ordinario" &&
        (!actaDeSesion || !estadosFinancieros || !ordenDelDia || !convocatoria)
      ) {
        openNotification(
          "error",
          "Documentos Faltantes",
          "Todos los documentos son obligatorios para las sesiones ordinarias."
        );
        setLoading(false);
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

      setTipoSesion("Ordinario");
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

  const handleIniciarSesion = async (sesion) => {
    try {
      setLoading(true);

      // Actualizar el estado de la sesión en DynamoDB
      const updateParams = {
        TableName: "Sesiones",
        Key: {
          idSesion: sesion.idSesion,
        },
        UpdateExpression: "set estatus = :newStatus",
        ExpressionAttributeValues: {
          ":newStatus": "En Progreso",
        },
        ReturnValues: "ALL_NEW",
      };

      await docClient.update(updateParams).promise();

      // Actualizar el estado local
      const sesionActualizada = { ...sesion, estatus: "En Progreso" };
      setSesionesProgramadas((prev) =>
        prev.filter((s) => s.idSesion !== sesion.idSesion)
      );
      setSesionesEnProgreso((prev) => [...prev, sesionActualizada]);

      openNotification(
        "success",
        "Sesión iniciada",
        "La sesión se ha iniciado correctamente y está en progreso."
      );
      setNuevasSesionesEnProgreso(nuevasSesionesEnProgreso + 1);
    } catch (error) {
      console.error("Error al iniciar la sesión:", error);
      openNotification(
        "error",
        "Error al iniciar la sesión",
        "Hubo un problema al iniciar la sesión."
      );
    } finally {
      setLoading(false);
    }
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

  const handleFinalizarSesion = async (sesion) => {
    const updateParams = {
      TableName: "Sesiones",
      Key: {
        idSesion: sesion.idSesion,
      },
      UpdateExpression: "set estatus = :newStatus",
      ExpressionAttributeValues: {
        ":newStatus": "Finalizada",
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      await docClient.update(updateParams).promise();
      openNotification(
        "success",
        "Sesión finalizada",
        "La sesión se ha finalizado correctamente."
      );
      // Actualizar el estado local después de cambiar el estatus
      fetchSesionesProgramadas();
    } catch (error) {
      console.error("Error al finalizar la sesión:", error);
      openNotification(
        "error",
        "Error al finalizar la sesión",
        "No se pudo finalizar la sesión."
      );
    }
  };

  const renderNumeroSesionOptions = () => {
    const maxSesiones = tipoSesion === "Ordinario" ? 4 : 24;
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
      const sesiones = data.Items;

      // Calcula el próximo número de sesión
      const maxNumeroSesion = sesiones
        .filter(
          (sesion) =>
            sesion.tipoSesion === tipoSesion && sesion.organismo === organismo
        )
        .reduce(
          (max, sesion) =>
            sesion.numeroSesion > max ? sesion.numeroSesion : max,
          0
        );
      setNumeroSesion(maxNumeroSesion + 1);

      // Filtrar sesiones según su estatus y organismo
      const sesionesFiltradas = sesiones.filter(
        (sesion) =>
          sesion.estatus !== "Finalizada" && sesion.organismo === organismo
      );

      // Aquí se pueden separar las sesiones programadas y en progreso
      const sesionesProgramadasFiltradas = sesionesFiltradas.filter(
        (sesion) => sesion.estatus === "Programado"
      );
      const sesionesEnProgresoFiltradas = sesionesFiltradas.filter(
        (sesion) => sesion.estatus === "En Progreso"
      );

      setSesionesProgramadas(sesionesProgramadasFiltradas);
      setSesionesEnProgreso(sesionesEnProgresoFiltradas);
    } catch (error) {
      console.error("Error al recuperar sesiones:", error);
    }
  };

  return (
    <div>
      <Spin spinning={loading} size="large" className="custom-spin">
        <Card>
          <Tabs
            defaultActiveKey="programar"
            type="card"
            onChange={handleTabsChange}
          >
            {currentUser?.rol.rol === "Comisario" && (
              <TabPane
                tab={
                  <span style={{ color: "#6A0F49" }}>
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
                <h2>Programar Sesión</h2>
                <Form form={form} layout="vertical">
                  <Form.Item
                    label="Tipo de Sesión"
                    name="tipoSesion"
                    initialValue="Ordinario"
                  >
                    <Select onChange={handleTipoSesionChange}>
                      <Option value="Ordinario">Ordinario</Option>
                      <Option value="Extraordinario">Extraordinario</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Número de Sesión"
                    name="numeroSesion"
                    key={numeroSesion}
                  >
                    {/* <Select disabled>
                    <Option value={numeroSesion} >
                      {`Sesión ${ numeroSesion }`}
                    </Option>
                    </Select> */}
                    <Input
                      disabled
                      defaultValue={numeroSesion}
                      key={numeroSesion}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Fecha y Hora"
                    name="fechaYHora"
                    rules={[
                      {
                        required: true,
                        message: "Por favor ingrese la fecha y hora",
                      },
                    ]}
                  >
                    <Row gutter={[8, 0]}>
                      <Col span={4}>
                        <DatePicker
                          onChange={handleFechaChange}
                          style={{
                            border: "2px solid #F1CDD3",
                            width: "100%",
                            maxWidth: "160px",
                          }}
                        />
                      </Col>
                      <Col span={10}>
                        <TimePicker
                          style={{
                            border: "2px solid #F1CDD3",
                            width: "100%",
                            maxWidth: "160px",
                          }}
                          format="HH:mm"
                          onChange={handleHoraInicioChange}
                        />
                      </Col>
                    </Row>
                  </Form.Item>

                  <Form.Item label="Cargar Acta de Sesión" name="actaDeSesion">
                    <Upload
                      beforeUpload={(file) => {
                        setActaDeSesion(file);
                        return false; // Evita que Ant Design suba automáticamente el archivo
                      }}
                      accept=".doc, .docx"
                      maxCount={1} // Asegura que solo se pueda subir un archivo
                      onRemove={() => setActaDeSesion(null)}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        style={{
                          backgroundColor: isHovered.actaDeSesion
                            ? "#701e45"
                            : "#fff",
                          color: isHovered.actaDeSesion ? "#fff" : "#701e45",
                          border: "2px solid #F1CDD3",
                        }}
                        onMouseEnter={() => handleMouseEnter("actaDeSesion")}
                        onMouseLeave={() => handleMouseLeave("actaDeSesion")}
                      >
                        Click para cargar el Acta de Sesión
                      </Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item
                    label="Cargar Estados Financieros"
                    name="estadosFinancieros"
                  >
                    <Upload
                      beforeUpload={(file) => {
                        setEstadosFinancieros(file);
                        return false;
                      }}
                      accept=".pdf"
                      maxCount={1}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        style={{
                          backgroundColor: isHovered.estadosFinancieros
                            ? "#701e45"
                            : "#fff",
                          color: isHovered.estadosFinancieros
                            ? "#fff"
                            : "#701e45",
                          border: "2px solid #F1CDD3",
                        }}
                        onMouseEnter={() =>
                          handleMouseEnter("estadosFinancieros")
                        }
                        onMouseLeave={() =>
                          handleMouseLeave("estadosFinancieros")
                        }
                      >
                        Cargar Estados Financieros
                      </Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item label="Cargar Orden del Día" name="ordenDelDia">
                    <Upload
                      beforeUpload={(file) => {
                        setOrdenDelDia(file);
                        return false;
                      }}
                      accept=".pdf"
                      maxCount={1}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        style={{
                          backgroundColor: isHovered.ordenDelDia
                            ? "#701e45"
                            : "#fff",
                          color: isHovered.ordenDelDia ? "#fff" : "#701e45",
                          border: "2px solid #F1CDD3",
                        }}
                        onMouseEnter={() => handleMouseEnter("ordenDelDia")}
                        onMouseLeave={() => handleMouseLeave("ordenDelDia")}
                      >
                        Cargar Orden del Día
                      </Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item label="Cargar Convocatoria" name="convocatoria">
                    <Upload
                      beforeUpload={(file) => {
                        setConvocatoria(file);
                        return false;
                      }}
                      accept=".pdf"
                      maxCount={1}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        style={{
                          backgroundColor: isHovered.convocatoria
                            ? "#701e45"
                            : "#fff",
                          color: isHovered.convocatoria ? "#fff" : "#701e45",
                          border: "2px solid #F1CDD3",
                        }}
                        onMouseEnter={() => handleMouseEnter("convocatoria")}
                        onMouseLeave={() => handleMouseLeave("convocatoria")}
                      >
                        Cargar Convocatoria
                      </Button>
                    </Upload>
                  </Form.Item>

                  {/* Nuevo campo para cargar documentos */}
                  <Form.Item label="Cargar Documentos" name="documentos">
                    <Upload
                      beforeUpload={() => false}
                      accept=".pdf"
                      multiple
                      onChange={handleChange}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        style={{
                          backgroundColor: isHovered.documentos
                            ? "#701e45"
                            : "#fff",
                          color: isHovered.documentos ? "#fff" : "#701e45",
                          border: "2px solid #F1CDD3",
                        }}
                        onMouseEnter={() => handleMouseEnter("documentos")}
                        onMouseLeave={() => handleMouseLeave("documentos")}
                      >
                        Click para cargar Documentos
                      </Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      onClick={handleProgramarSesion}
                      style={{ backgroundColor: "#6A0F49", color: "white" }}
                    >
                      {sesionEditando ? "Editar Sesión" : "Programar Sesión"}
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
            )}{" "}
            <TabPane
              tab={
                <span style={{ color: "#6A0F49" }}>
                  Sesiones Programadas{" "}
                  {nuevasSesionesProgramadas > 0 && (
                    <Badge
                      count={nuevasSesionesProgramadas}
                      style={{ backgroundColor: "#ab1675" }}
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
                <span style={{ color: "#6A0F49" }}>
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
                organismo={organismo}
                sesionesEnProgreso={sesionesEnProgreso}
                onFinalizarSesion={handleFinalizarSesion}
                exportarYSubirPDF={exportarYSubirPDF}
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
                <Option value="Ordinario">Ordinario</Option>
                <Option value="Extraordinario">Extraordinario</Option>
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
        {/* <Button
          onClick={() => {
            console.log("Botón para exportar y subir PDF clickeado");
            if (actaDeSesionGoogleDriveUrl) {
              exportarYSubirPDF(actaDeSesionGoogleDriveUrl);
            } else {
              console.error("actaDeSesionGoogleDriveUrl no está definida");
            }
          }}
        >
          Exportar a PDF y Subir a S3
        </Button> */}

        <Button onClick={handleAuthClick}>
          {isSignedIn ? "Cerrar Sesión" : "Iniciar Sesión con Google"}
        </Button>
      </Spin>
    </div>
  );
};

export default ProgramarSesion;
