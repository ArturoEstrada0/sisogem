import React, { useState } from 'react';
import { DatePicker, TimePicker, Select, Button, Card, Tabs, Modal, Form, notification, Badge } from 'antd';
import SesionesProgramadas from './SesionesProgramadas';
import SesionProgreso from './SesionProgreso';
import moment from 'moment';

const { Option } = Select;
const { TabPane } = Tabs;

const ProgramarSesion = () => {
  const [tipoSesion, setTipoSesion] = useState('ordinario');
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

  const handleTipoSesionChange = value => {
    setTipoSesion(value);
  };

  const handleFechaChange = date => {
    setFecha(date);
  };

  const handleHoraInicioChange = time => {
    setHoraInicio(time);
  };

  const handleNumeroSesionChange = value => {
    setNumeroSesion(value);
  };

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  const handleProgramarSesion = () => {
    if (!fecha || !horaInicio) {
      openNotification('error', 'Error al programar la sesión', 'Por favor, selecciona fecha y hora de inicio.');
      return;
    }

    const nuevaSesion = {
      tipoSesion,
      numeroSesion,
      fecha: fecha.format('YYYY-MM-DD'),
      horaInicio: horaInicio.format('HH:mm'),
    };

    if (sesionEditando) {
      const sesionesActualizadas = sesionesProgramadas.map(sesion =>
        sesion === sesionEditando ? nuevaSesion : sesion
      );
      setSesionesProgramadas(sesionesActualizadas);
      setSesionEditando(null);
      openNotification('success', 'Sesión editada', 'La sesión se ha editado correctamente.');
    } else {
      setSesionesProgramadas([...sesionesProgramadas, nuevaSesion]);
      openNotification('success', 'Sesión programada', 'La sesión se ha programado correctamente.');
      setNuevasSesionesProgramadas(nuevasSesionesProgramadas + 1);
    }

    setTipoSesion('ordinario');
    setNumeroSesion(1);
    setFecha(null);
    setHoraInicio(null);
  };

  const handleIniciarSesion = sesion => {
    setSesionesProgramadas(sesionesProgramadas.filter(s => s !== sesion));
    setSesionesEnProgreso([...sesionesEnProgreso, sesion]);
    openNotification('success', 'Sesión iniciada', 'La sesión se ha iniciado correctamente.');
    setNuevasSesionesEnProgreso(nuevasSesionesEnProgreso + 1);
  };

  const handleEditarSesion = sesion => {
    setSesionEditando(sesion);
    setModalVisible(true);
    form.setFieldsValue({
      tipoSesion: sesion.tipoSesion,
      numeroSesion: sesion.numeroSesion,
      fecha: moment(sesion.fecha),
      horaInicio: moment(sesion.horaInicio, 'HH:mm'),
    });
  };

  const handleBorrarSesion = sesion => {
    Modal.confirm({
      title: 'Confirmar eliminación',
      content: '¿Estás seguro de que deseas borrar esta sesión?',
      onOk: () => {
        setSesionesProgramadas(sesionesProgramadas.filter(s => s !== sesion));
        openNotification('success', 'Sesión eliminada', 'La sesión se ha eliminado correctamente.');
      },
    });
  };

  const handleFinalizarSesion = sesion => {
    setSesionesEnProgreso(sesionesEnProgreso.filter(s => s !== sesion));
    // Puedes agregar lógica adicional al finalizar una sesión
    openNotification('success', 'Sesión finalizada', 'La sesión se ha finalizado correctamente.');
    setNuevasSesionesEnProgreso(nuevasSesionesEnProgreso - 1);
  };

  const renderNumeroSesionOptions = () => {
    const maxSesiones = tipoSesion === 'ordinario' ? 4 : 24;
    const opciones = [];

    for (let i = 1; i <= maxSesiones; i++) {
      opciones.push(<Option key={i} value={i}>{`Sesión ${i}`}</Option>);
    }

    return opciones;
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const editedData = {
        ...sesionEditando,
        tipoSesion: values.tipoSesion,
        numeroSesion: values.numeroSesion,
        fecha: values.fecha.format('YYYY-MM-DD'),
        horaInicio: values.horaInicio.format('HH:mm'),
      };
      setSesionesProgramadas(sesionesProgramadas.map(s => (s === sesionEditando ? editedData : s)));
      setSesionEditando(null);
      setModalVisible(false);
      openNotification('success', 'Sesión editada', 'La sesión se ha editado correctamente.');
    });
  };

  const handleModalCancel = () => {
    setSesionEditando(null);
    setModalVisible(false);
  };

  const handleTabsChange = key => {
    if (key === 'programadas') {
      setNuevasSesionesProgramadas(0);
    } else if (key === 'progreso') {
      setNuevasSesionesEnProgreso(0);
    }
  };

  return (
    <div>
      <h2>Programar Sesión</h2>
      <Card>
        <Tabs defaultActiveKey="programar" type="card" onChange={handleTabsChange}>
          <TabPane
            tab={
              <span>
                Programar Sesión{' '}
                {nuevasSesionesProgramadas > 0 && (
                  <Badge count={nuevasSesionesProgramadas} style={{ backgroundColor: '#52c41a' }} />
                )}
              </span>
            }
            key="programar"
          >
            <Form form={form} layout="vertical">
              <Form.Item label="Tipo de Sesión" name="tipoSesion" initialValue="ordinario">
                <Select onChange={handleTipoSesionChange}>
                  <Option value="ordinario">Ordinario</Option>
                  <Option value="extraordinario">Extraordinario</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Número de Sesión" name="numeroSesion" initialValue={1}>
                <Select onChange={handleNumeroSesionChange}>
                  {renderNumeroSesionOptions()}
                </Select>
              </Form.Item>
              <Form.Item label="Fecha" name="fecha" rules={[{ required: true, message: 'Por favor ingrese la fecha' }]}>
                <DatePicker onChange={handleFechaChange} />
              </Form.Item>
              <Form.Item
                label="Hora de Inicio"
                name="horaInicio"
                rules={[{ required: true, message: 'Por favor ingrese la hora de inicio' }]}
              >
                <TimePicker format="HH:mm" onChange={handleHoraInicioChange} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleProgramarSesion}>
                  {sesionEditando ? 'Editar Sesión' : 'Programar Sesión'}
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane
            tab={
              <span>
                Sesiones Programadas{' '}
                {nuevasSesionesProgramadas > 0 && (
                  <Badge count={nuevasSesionesProgramadas} style={{ backgroundColor: '#52c41a' }} />
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
              <span>
                Sesiones en Progreso{' '}
                {nuevasSesionesEnProgreso > 0 && (
                  <Badge count={nuevasSesionesEnProgreso} style={{ backgroundColor: '#52c41a' }} />
                )}
              </span>
            }
            key="progreso"
          >
            <SesionProgreso sesionesEnProgreso={sesionesEnProgreso} onFinalizarSesion={handleFinalizarSesion} />
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
            rules={[{ required: true, message: 'Por favor seleccione el tipo de sesión' }]}
          >
            <Select>
              <Option value="ordinario">Ordinario</Option>
              <Option value="extraordinario">Extraordinario</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Número de Sesión"
            name="numeroSesion"
            rules={[{ required: true, message: 'Por favor seleccione el número de sesión' }]}
          >
            <Select>
              {renderNumeroSesionOptions()}
            </Select>
          </Form.Item>
          <Form.Item
            label="Fecha"
            name="fecha"
            rules={[{ required: true, message: 'Por favor ingrese la fecha' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            label="Hora de Inicio"
            name="horaInicio"
            rules={[{ required: true, message: 'Por favor ingrese la hora de inicio' }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProgramarSesion;
