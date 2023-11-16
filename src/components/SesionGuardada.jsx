// SavedSessions.js
import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from 'antd/lib/modal/Modal';

function SavedSessions({ savedSessions, onDelete, onEnter }) {
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = (index) => {
    setDeleteIndex(index);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    onDelete(deleteIndex);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Sesiones Programadas
      </Typography>
      {savedSessions.map((session, index) => (
        <Card key={index} sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="h6" component="div">
              Sesión: {session.sesionValue}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fecha y Hora: {session.dateValue ? session.dateValue.format('YYYY-MM-DD HH:mm') : 'No seleccionada'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tipo de Sesión: {session.radioOption === 'option1' ? 'Ordinaria' : 'Extraordinaria'}
            </Typography>
            <Button variant="outlined" onClick={() => showModal(index)} sx={{ marginRight: 1 }}>
              Borrar
            </Button>
            <Button variant="contained" color="primary" onClick={() => onEnter(index)}>
              Entrar
            </Button>
          </CardContent>
        </Card>
      ))}
      <Modal
        title="Confirmar Borrado"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Borrar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que quieres borrar esta sesión?</p>
      </Modal>
    </div>
  );
}

export default SavedSessions;
