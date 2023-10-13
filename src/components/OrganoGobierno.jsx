import React, { useState } from 'react';
import { Form, Select, Input, DatePicker, Button, Upload, Modal, Drawer, Table, Space } from 'antd';
import { ExclamationCircleOutlined, UploadOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import './OrganoGobierno.css';
import moment from 'moment'; // Asegúrate de importar moment

const { Option } = Select;
const { confirm } = Modal;

const OrganoGobierno = () => {
  const [cargoCompletoFilter, setCargoCompletoFilter] = useState(null);
  const [fechaInicioFilter, setFechaInicioFilter] = useState(null);

  const [integrantes, setIntegrantes] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [circleAnimation, setCircleAnimation] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [form] = Form.useForm();
  const [formVisible, setFormVisible] = useState(false);

  const onFinish = (values) => {
    if (editingIndex === -1) {
      setIntegrantes([...integrantes, values]);
    } else {
      integrantes[editingIndex] = values;
      setIntegrantes([...integrantes]);
      setEditingIndex(-1);
    }
    setShowAnimation(true);

    if (circleAnimation) {
      clearTimeout(circleAnimation);
    }

    setCircleAnimation(
      setTimeout(() => {
        setShowAnimation(false);
      }, 1000)
    );

    form.resetFields();
  };

  const showDeleteConfirm = (index) => {
    confirm({
      title: '¿Estás seguro de eliminar este integrante?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        const updatedIntegrantes = [...integrantes];
        updatedIntegrantes.splice(index, 1);
        setIntegrantes(updatedIntegrantes);
      },
    });
  };

  const columns = [
    {
      title: 'Nombre Completo',
      dataIndex: 'nombreCompleto',
      key: 'nombreCompleto',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Buscar nombre`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90, backgroundColor: '#6A0F49' }}

            >
              Buscar
            </Button>
            <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
              Restablecer
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) =>
        record.nombreCompleto ? record.nombreCompleto.toString().toLowerCase().includes(value.toLowerCase()) : '',
    },
    {
      title: 'Cargo Completo',
      dataIndex: 'cargoCompleto',
      key: 'cargoCompleto',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Buscar cargo completo`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90, backgroundColor: '#6A0F49' }}
            >
              Buscar
            </Button>
            <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
              Restablecer
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) =>
        record.cargoCompleto ? record.cargoCompleto.toString().toLowerCase().includes(value.toLowerCase()) : '',
    },
    {
      title: 'Representación',
      dataIndex: 'representacionDe',
      key: 'representacionDe',
      filters: [
        {
          text: 'Secretaría de Turismo',
          value: 'opcion1',
        },
        {
          text: 'Centro de Convenciones de Morelia',
          value: 'opcion2',
        },
        {
          text: 'Secretaría de Desarrollo Económico',
          value: 'opcion3',
        },
        {
          text: 'Secretaría de Educación',
          value: 'opcion4',
        },
      ],
      onFilter: (value, record) => record.representacionDe === value,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Buscar email`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90, backgroundColor: '#6A0F49' }}
            >
              Buscar
            </Button>
            <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
              Restablecer
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) =>
        record.email ? record.email.toString().toLowerCase().includes(value.toLowerCase()) : '',
    },
    {
      title: 'Fecha de Inicio de Designación',
      dataIndex: 'fechaInicioDesignacion',
      key: 'fechaInicioDesignacion',
      render: (date) => (date ? date.format('YYYY-MM-DD') : 'N/A'),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <DatePicker
            value={selectedKeys[0]}
            onChange={(date) => setSelectedKeys(date)}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90, backgroundColor: '#6A0F49' }}
            >
              Buscar
            </Button>
            <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
              Restablecer
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => {
        setFechaInicioFilter(value);
        return record.fechaInicioDesignacion
          ? record.fechaInicioDesignacion.isSame(value, 'day')
          : '';
      },
    },
    {
      title: 'Oficio de Designación',
      dataIndex: 'oficioDesignacion',
      key: 'oficioDesignacion',
      render: (file) => (file ? file[0].name : 'N/A'),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (text, record, index) => (
        <Space size="middle">
          <Button type="link" onClick={() => setEditingIndex(index)}>
            <EditOutlined />
          </Button>
          <Button type="link" danger onClick={() => showDeleteConfirm(index)}>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container">
      <Button type="primary" onClick={() => setFormVisible(true)} style={{ backgroundColor: '#6A0F49' }} // Set button background color
      >
        Agregar Integrante
      </Button>

      <Drawer
        title="Formulario del Organo de Gobierno"
        placement="right"
        width={400}
        onClose={() => setFormVisible(false)}
        visible={formVisible}
      >
        <Form form={form} name="organoGobiernoForm" onFinish={onFinish} initialValues={integrantes[editingIndex]}>
          <Form.Item
            name="tipoIntegrante"
            label="Selecciona tipo de integrante"
            rules={[{ required: true, message: 'Por favor, selecciona el tipo de integrante' }]}
          >
            <Select>
              <Option value="tipo1">Tipo 1</Option>
              <Option value="tipo2">Tipo 2</Option>
              <Option value="tipo3">Tipo 3</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="nombreCompleto"
            label="Nombre completo"
            rules={[{ required: true, message: 'Por favor, ingresa el nombre completo' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="representacionDe"
            label="Representación de"
            rules={[{ required: true, message: 'Por favor, selecciona la representación' }]}
            
          >
            <Select>
              <Option value="opcion1">Secretaría de Turismo</Option>
              <Option value="opcion2">Centro de Convenciones de Morelia</Option>
              <Option value="opcion3">Secretaría de Desarrollo Económico</Option>
              <Option value="opcion4">Secretaría de Educación</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="cargoCompleto"
            label="Cargo completo"
            rules={[{ required: true, message: 'Por favor, ingresa el cargo completo' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor, ingresa el email' },
              { type: 'email', message: 'Ingresa un email válido' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="fechaInicioDesignacion"
            label="Fecha de inicio de designación"
            rules={[{ required: true, message: 'Por favor, selecciona la fecha de inicio de designación' }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            name="oficioDesignacion"
            label="Oficio de Designación / Nombramiento / Acreditación"
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
            rules={[{ required: true, message: 'Por favor, sube el oficio de designación' }]}
          >
            <Upload beforeUpload={beforeUpload} accept=".pdf,.doc,.docx,.xls,.xlsx">
              <Button icon={<UploadOutlined />}>Subir archivo</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: '#6A0F49' }} // Set button background color
            >
              {editingIndex === -1 ? 'Agregar' : 'Actualizar'}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      <div className="list-container">
        <Table columns={columns} dataSource={integrantes} />
      </div>
    </div>
  );
};

const beforeUpload = (file) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
  const fileExtension = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2);
  return allowedExtensions.includes('.' + fileExtension);
};

export default OrganoGobierno;
