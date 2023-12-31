import React from "react";
import { List, Button, Card, Popconfirm } from "antd";
import PDFTron from "./PDFTron";

const SesionesProgramadas = ({
  data,
  onIniciarSesion,
  onEditarSesion,
  onBorrarSesion,
}) => {
  const renderItem = (sesion) => (
    <List.Item>
      <Card>
        <p>Tipo de Sesión: {sesion.tipoSesion}</p>
        <p>Número de Sesión: {sesion.numeroSesion}</p>
        <p>Fecha: {sesion.fecha}</p>
        <p>Hora de Inicio: {sesion.horaInicio}</p>
        {/* Asegúrate de que cada sesión tenga un documentoId */}
        <Button
          type="primary"
          onClick={() => {
            console.log("Iniciando sesión con Documento ID:", sesion.documentoId);

            onIniciarSesion(sesion);
          }}
        >
          Celebrar Sesión
        </Button>

        <Button
          style={{ marginLeft: 8 }}
          onClick={() => onEditarSesion(sesion)}
        >
          Editar
        </Button>
        <Popconfirm
          title="¿Estás seguro de borrar esta sesión?"
          onConfirm={() => onBorrarSesion(sesion)}
          okText="Sí"
          cancelText="No"
        >
          <Button style={{ marginLeft: 8 }} type="danger">
            Borrar
          </Button>
        </Popconfirm>
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

      <PDFTron />
    </div>
  );
};

export default SesionesProgramadas;
