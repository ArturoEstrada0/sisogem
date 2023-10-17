import React, { useState } from 'react';
import { Card, Menu, Upload, message, Table, Space, Row, Col, Pagination, Spin } from 'antd';
import { UploadOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import './MarcoNormativo.css';
import { Tooltip } from 'antd';


const { SubMenu } = Menu;
const { Dragger } = Upload;
const { Column } = Table;

const UploadCard = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('option1');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [menuText, setMenuText] = useState('Denominacion del Instrumento Normativo');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOptionSelected, setMenuOptionSelected] = useState(false);
  const itemsPerPage = 5;

  const handleMenuClick = (e) => {
    setSelectedMenuItem(e.key);
    setMenuText(e.item.props.children);
    setMenuOptionSelected(true);
  };

  const handleFileUpload = (info) => {
    setIsLoading(true);

    if (!menuOptionSelected) {
      message.error('Por favor selecciona una opción del menú antes de subir un archivo.');
      setIsLoading(false);
      return;
    }

    if (info.file.status === 'done') {
      const uploadedFile = {
        ...info.file,
        url: 'URL_DEL_ARCHIVO',
        option: selectedMenuItem
      };

      message.success(`${info.file.name} El archivo se subió con éxito.`);
      setUploadedFiles([...uploadedFiles, uploadedFile]);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} Error al Subir el Archivo.`);
    }

    setIsLoading(false);
  };

  const customRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess();
    }, 0);
  };

  const handlePreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Agrega lo que necesites para previsualizar el archivo
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteFile = (uid) => {
    const updatedFiles = uploadedFiles.filter(file => file.uid !== uid);
    setUploadedFiles(updatedFiles);
  };

  const fileTypes = ['.doc', '.docx', '.pdf', '.xls', '.xlsx'];
  const acceptTypes = fileTypes.join(',');

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, uploadedFiles.length);
  const paginatedFiles = uploadedFiles.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Card
      title={<span style={{ color: '#FFF', padding: '0.5rem' }}>Marco Normativo Vigente</span>}
      headStyle={{ backgroundColor: '#6A0F49' }}

    >


      <Row gutter={16}>
        <Col span={12} className="menu-col" style={{ background: 'cccccc40', padding: '1rem' }}>

          <Menu
            onClick={handleMenuClick}
            selectedKeys={[selectedMenuItem]}
            mode="vertical"
            style={{ color: '#6A0F49' }}
          >
            <Tooltip title="Selecciona la Denominación del Instrumento Normativo">

              <SubMenu key="sub1" title={<span style={{ color: '#6A0F49' }}>{menuText}</span>}>
                <Menu.Item key="Decreto">Decreto</Menu.Item>
                <Menu.Item key="Ley de Creacion">Ley de Creación</Menu.Item>
                <Menu.Item key="Reglamento Interior">Reglamento Interior</Menu.Item>
                <Menu.Item key="Manual Organizacional">Manual Organizacional</Menu.Item>
                <Menu.Item key="Manual de Procedimientos">Manual de Procedimientos</Menu.Item>
                <Menu.Item key="Ordenamiento">Ordenamientos</Menu.Item>
              </SubMenu>
            </Tooltip>

          </Menu>

          <Spin spinning={isLoading}>
            <Dragger
              onChange={handleFileUpload}
              showUploadList={false}
              customRequest={customRequest}
              beforeUpload={file => {
                if (!fileTypes.includes(file.name.slice(file.name.lastIndexOf('.')))) {
                  message.error('Solo se permiten archivos Word, PDF y Excel.');
                  return false;
                }
                handlePreview(file);
                return true;
              }}
              accept={acceptTypes}
              disabled={!menuOptionSelected}
            >
              <>
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">Click para seleccionar el archivo o arrástralo a este panel</p>
              </>
            </Dragger>
          </Spin>
        </Col>

        <Col span={12} className="list-col">
          <div className="list-container">
            <Table
              dataSource={paginatedFiles}
              pagination={false}
            >
              <Column title={<span style={{ color: '#6A0F49 ' }}>Nombre</span>} dataIndex="name" key="name" width={150} ellipsis />
              <Column title={<span style={{ color: '#6A0F49 ' }}>Tipo</span>} dataIndex="option" key="option" width={150} ellipsis />
              <Column
                title={<span style={{ color: '#6A0F49 ' }}>Accion</span>}
                key="action"
                width={150}
                ellipsis
                render={(text, record) => (
                  <Space size="middle">
                    <a href={record.url} target="_blank" rel="noopener noreferrer">
                      <EyeOutlined />
                    </a>
                    <a href={record.url} download>
                      <DownloadOutlined />
                    </a>
                    <a onClick={() => handleDeleteFile(record.uid)}>Eliminar</a>
                  </Space>
                )}
              />
            </Table>
          </div>
          <Pagination
            current={currentPage}
            pageSize={itemsPerPage}
            total={uploadedFiles.length}
            onChange={handlePageChange}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default UploadCard;
