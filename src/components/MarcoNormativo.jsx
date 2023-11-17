import React, { useState } from 'react'
import {
  Card,
  Menu,
  Upload,
  message,
  Table,
  Space,
  Row,
  Col,
  Pagination,
  Spin,
  Modal,
} from 'antd'
import {
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import './MarcoNormativo.css'
import { Tooltip } from 'antd'
import { uploadFileToS3, listObjectsInS3Bucket } from '../services/S3Service'

const { SubMenu } = Menu
const { Dragger } = Upload
const { Column } = Table

const UploadCard = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('option1')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [menuText, setMenuText] = useState(
    'Denominacion del Instrumento Normativo',
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [menuOptionSelected, setMenuOptionSelected] = useState(false)
  const [deleteFileUid, setDeleteFileUid] = useState(null)
  const itemsPerPage = 5

  const handleMenuClick = (e) => {
    setSelectedMenuItem(e.key)
    setMenuText(e.item.props.children)
    setMenuOptionSelected(true)
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) {
      return
    }
    try {
      await uploadFileToS3(file)
    } catch (error) {
      console.error('Error al subir el archivo:', error)
    }
  }

  const customRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess()
    }, 0)
  }

  const handlePreview = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      // Agrega lo que necesites para previsualizar el archivo
    }
    reader.readAsDataURL(file)
  }

  const showDeleteConfirm = (uid) => {
    setDeleteFileUid(uid)
    Modal.confirm({
      title: 'Confirmar eliminación',
      content: '¿Seguro que deseas eliminar este archivo?',
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => handleDeleteFile(uid),
      onCancel: () => setDeleteFileUid(null),
    })
  }

  const handleDeleteFile = (uid) => {
    const updatedFiles = uploadedFiles.filter((file) => file.uid !== uid)
    setUploadedFiles(updatedFiles)
    setDeleteFileUid(null)
  }

  const fileTypes = ['.pdf']
  const acceptTypes = fileTypes.join(',')

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, uploadedFiles.length)
  const paginatedFiles = uploadedFiles.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  return (
    <Card
      title={
        <span style={{ color: '#FFF', padding: '0.5rem' }}>
          Marco Normativo Vigente
        </span>
      }
      headStyle={{ backgroundColor: '#6A0F49' }}>
      <Row gutter={16}>
        <Col
          span={12}
          className='menu-col'
          style={{ background: 'cccccc40', padding: '1rem' }}>
          <Menu
            onClick={handleMenuClick}
            selectedKeys={[selectedMenuItem]}
            mode='vertical'
            style={{ color: '#6A0F49' }}>
            <Tooltip title='Selecciona la Denominación del Instrumento Normativo'>
              <SubMenu
                key='sub1'
                title={<span style={{ color: '#6A0F49' }}>{menuText}</span>}>
                <Menu.Item key='Ley'>Ley</Menu.Item>
                <Menu.Item key='Decreto de Creación'>
                  Decreto de Creación
                </Menu.Item>
                <Menu.Item key='Reglamento Interior'>
                  Reglamento Interior
                </Menu.Item>
                <Menu.Item key='Manual Organizacional'>
                  Manual Organizacional
                </Menu.Item>
                <Menu.Item key='Manual de Procedimientos'>
                  Manual de Procedimientos
                </Menu.Item>
                <Menu.Item key='Otros'>Otros</Menu.Item>
              </SubMenu>
            </Tooltip>
          </Menu>

          <Spin spinning={isLoading}>
            <Dragger
              onChange={handleFileUpload}
              showUploadList={false}
              customRequest={customRequest}
              beforeUpload={(file) => {
                if (
                  !fileTypes.includes(
                    file.name.slice(file.name.lastIndexOf('.')),
                  )
                ) {
                  message.error('Solo se permiten archivos PDF')
                  return false
                }
                handlePreview(file)
                return true
              }}
              accept={acceptTypes}
              disabled={!menuOptionSelected}>
              <>
                <p className='ant-upload-drag-icon'>
                  <UploadOutlined />
                </p>
                <p className='ant-upload-text'>
                  Click para seleccionar el archivo o arrástralo a este panel
                </p>
              </>
            </Dragger>
          </Spin>
        </Col>

        <Col span={12} className='list-col'>
          <div className='list-container'>
            <Table dataSource={paginatedFiles} pagination={false}>
              <Column
                title={<span style={{ color: '#701e45' }}>Nombre</span>}
                dataIndex='name'
                key='name'
                width={150}
                ellipsis
              />
              <Column
                title={<span style={{ color: '#701e45' }}>Tipo</span>}
                dataIndex='option'
                key='option'
                width={150}
                ellipsis
              />
              <Column
                title={<span style={{ color: '#701e45' }}>Acción</span>}
                key='action'
                width={150}
                ellipsis
                render={(text, record) => (
                  <Space size='middle'>
                    <a
                      href={record.url}
                      target='_blank'
                      rel='noopener noreferrer'>
                      <EyeOutlined />
                    </a>
                    <a href={record.url} download>
                      <DownloadOutlined />
                    </a>
                    <a onClick={() => showDeleteConfirm(record.uid)}>
                      Eliminar
                    </a>
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
  )
}

export default UploadCard
