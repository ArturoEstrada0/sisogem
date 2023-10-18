import React, { useState } from 'react';
import { Form, Select, Input, DatePicker, Button, Upload, Modal, Drawer, Table, Space } from 'antd';
import { ExclamationCircleOutlined, UploadOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ExportOutlined } from '@ant-design/icons';
import './OrganoGobierno.css';
import { Tooltip } from 'antd';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
          value: 'Secretaría de Turismo',
        },
        {
          text: 'Centro de Convenciones de Morelia',
          value: 'Centro de Convenciones de Morelia',
        },
        {
          text: 'Secretaría de Desarrollo Económico',
          value: 'Secretaría de Desarrollo Económico',
        },
        {
          text: 'Secretaría de Educación',
          value: 'Secretaría de Educación',
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

  const exportToCSV = () => {
    const dataToExport = integrantes.map((integrante) => ({
      NombreCompleto: integrante.nombreCompleto,
      CargoCompleto: integrante.cargoCompleto,
      Representacion: integrante.representacionDe,
      Email: integrante.email,
      FechaInicioDesignacion: integrante.fechaInicioDesignacion
        ? integrante.fechaInicioDesignacion.format('YYYY-MM-DD')
        : 'N/A',
      OficioDesignacion: integrante.oficioDesignacion ? integrante.oficioDesignacion[0].name : 'N/A',
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = 'datos_integrantes.csv';
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const exportToPDF = () => {
    // Crea un nuevo objeto jsPDF
    const pdf = new jsPDF();

    // Define el título y las columnas de la tabla en el PDF
    const headers = [['Nombre Completo', 'Cargo Completo', 'Representación', 'Email', 'Fecha de Inicio de Designación', 'Oficio de Designación']];

    // Convierte los datos de la tabla a un arreglo 2D
    const data = integrantes.map((integrante) => [
      integrante.nombreCompleto,
      integrante.cargoCompleto,
      integrante.representacionDe,
      integrante.email,
      integrante.fechaInicioDesignacion
        ? integrante.fechaInicioDesignacion.format('YYYY-MM-DD')
        : 'N/A',
      integrante.oficioDesignacion ? integrante.oficioDesignacion[0].name : 'N/A',
    ]);

    // Configura la posición inicial de la tabla en el PDF
    const tableX = 10;
    const tableY = 10;

    // Establece la fuente y el tamaño de texto
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');

    // Agrega el título de la tabla
    pdf.text('Datos de Integrantes', tableX, tableY);

    // Genera la tabla en el PDF
    pdf.autoTable({
      startY: tableY + 10,
      head: headers,
      body: data,
    });

    // Guarda el PDF con un nombre
    pdf.save('datos_integrantes.pdf');
  };

  const exportToExcel = () => {
    // Convierte los datos de la tabla a un arreglo 2D
    const data = integrantes.map((integrante) => [
      integrante.nombreCompleto,
      integrante.cargoCompleto,
      integrante.representacionDe,
      integrante.email,
      integrante.fechaInicioDesignacion
        ? integrante.fechaInicioDesignacion.format('YYYY-MM-DD')
        : 'N/A',
      integrante.oficioDesignacion ? integrante.oficioDesignacion[0].name : 'N/A',
    ]);

    // Crea un objeto Worksheet
    const ws = XLSX.utils.aoa_to_sheet([['Nombre Completo', 'Cargo Completo', 'Representación', 'Email', 'Fecha de Inicio de Designación', 'Oficio de Designación'], ...data]);

    // Crea un objeto Workbook y agrega la hoja
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Integrantes');

    // Guarda el archivo Excel
    XLSX.writeFile(wb, 'datos_integrantes.xlsx');
  };

  return (
    <div className="container">
      <Tooltip title="Agregar Integrante">
        <Button type="primary" onClick={() => setFormVisible(true)} style={{ backgroundColor: '#6A0F49' }}>
          Agregar Integrante
        </Button>
      </Tooltip>

      <Button
        icon={<ExportOutlined />}
        onClick={exportToCSV}
        style={{ marginLeft: '10px' }}
      >
        Exportar a CSV
      </Button>

      <Button
        icon={<ExportOutlined />}
        onClick={exportToPDF}
        style={{ marginLeft: '10px' }}
      >
        Exportar a PDF
      </Button>

      <Button
        icon={<ExportOutlined />}
        onClick={exportToExcel}
        style={{ marginLeft: '10px' }}
        className="export-button"
      >
        Exportar a Excel
      </Button>



      <Drawer
        title="Formulario del Organo de Gobierno"
        placement="right"
        width={525}
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
              <Option value="Comisario">Comisario</Option>
              <Option value="Comisario Suplente">Comisario Suplente</Option>
              <Option value="Integrante Propietario">Integrante Propietario</Option>
              <Option value="Integrante Suplente">Integrante Suplente</Option>
              <Option value="Presidente">Presidente</Option>
              <Option value="PresidenteSuplente">Presidente Suplente</Option>
              <Option value="Secretario Técnico Homólogo">Secretario Técnico / Homólogo</Option>
              <Option value="Secretario Técnico Suplente">Secreatario Técnico Suplente</Option>
              <Option value="Titular OPD">Titular De La OPD</Option>
              <Option value="Vicepresidente">Vicepresidente</Option>
              <Option value="Vicepresidente Suplente">Vicepresidente Suplente</Option>
              <Option value="Otro">Otro</Option>
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
              <Option value="Secretaría de Turismo">Secretaría de Turismo</Option>
              <Option value="Centro de Convenciones de Morelia">Centro de Convenciones de Morelia</Option>
              <Option value="Secretaría de Desarrollo Económico">Secretaría de Desarrollo Económico</Option>
              <Option value="Secretaría de Educación">Secretaría de Educación</Option>
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
    </div >
  );
};

const beforeUpload = (file) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
  const fileExtension = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2);
  return allowedExtensions.includes('.' + fileExtension);
};

export default OrganoGobierno;
