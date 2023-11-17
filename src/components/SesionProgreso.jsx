import React from 'react';
import { List, Button, Card, Popconfirm } from 'antd';

const SesionProgreso = ({ sesionesEnProgreso, onFinalizarSesion }) => {
  const renderItem = sesion => (
    <List.Item>
      <Card>
        <p>Tipo de Sesión: {sesion.tipoSesion}</p>
        <p>Número de Sesión: {sesion.numeroSesion}</p>
        <p>Fecha: {sesion.fecha}</p>
        <p>Hora de Inicio: {sesion.horaInicio}</p>
        <Button type="primary" onClick={() => onFinalizarSesion(sesion)}>
          Finalizar Sesión
        </Button>
      </Card>
    </List.Item>
  );

  return (
    <div>
      <h2>Sesiones en Progreso</h2>
      <List
        dataSource={sesionesEnProgreso}
        renderItem={renderItem}
        locale={{ emptyText: 'No hay sesiones en progreso' }}
      />
    </div>
  );
};

export default SesionProgreso;
