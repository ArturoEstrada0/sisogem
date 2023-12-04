import React from "react";
import { List, Button, Card, Popconfirm } from "antd";
import moment from "moment"; // Asegúrate de tener 'moment' instalado

const SesionesProgramadas = ({
  data,
  currentUser,
  onIniciarSesion,
  onEditarSesion,
  onBorrarSesion,
  onDescargarDocumentos,
  paseListaDeUsuario
}) => {
  const esSesionActivable = (sesion) => {
    const ahora = moment();
    const fechaHoraSesion = moment(`${sesion.fecha}T${sesion.horaInicio}`);
    return sesion.estatus === "Activo" && ahora.isSameOrAfter(fechaHoraSesion);
  };

  const renderItem = (sesion) => (
    <List.Item>
      <Card>
        <p>Tipo de Sesión: {sesion.tipoSesion}</p>
        <p>Número de Sesión: {sesion.numeroSesion}</p>
        <p>Fecha: {sesion.fecha}</p>
        <p>Hora de Inicio: {sesion.horaInicio}</p>
        <p>Estatus: {sesion.estatus} </p>

        <Button
          type="primary"
          onClick={() => onIniciarSesion(sesion)}
          style={{ backgroundColor: "#6A0F49", borderBlockColor: "#6A0F49" }}
          disabled={!esSesionActivable(sesion)}
        >
          Celebrar Sesión
        </Button>

        {/* <Button
          style={{ marginLeft: 8 }}
          onClick={() => onEditarSesion(sesion)}
        >
          Editar
        </Button> */}

        <Button style={{ marginLeft: 8 }} onClick={() => paseListaDeUsuario(sesion)} disabled={sesion.contador.includes(currentUser.email)}>
          CONFIRMAR ASISTENCIA
        </Button>

        {/* <Popconfirm
          title="¿Estás seguro de borrar esta sesión?"
          onConfirm={() => onBorrarSesion(sesion)}
          okText="Sí"
          cancelText="No"
        >
          <Button style={{ marginLeft: 8 }} type="danger">
            Borrar
          </Button>
        </Popconfirm> */}

        {/* Nuevo botón para descargar documentos */}
        <Button
          onClick={() => {
            console.log("Descargando documentos de la sesión:", sesion);
            onDescargarDocumentos(sesion);
          }}
          style={{ marginBottom: 8 }}
        >
          Descargar Documentos
        </Button>
      </Card>
    </List.Item>
  );

  return (
    <div>
      <h2>Sesiones Programadas</h2>
      <List
        dataSource={data}
        renderItem={renderItem}
        locale={{ emptyText: "No hay sesiones programadas" }}
      />
    </div>
  );
};

export default SesionesProgramadas;
