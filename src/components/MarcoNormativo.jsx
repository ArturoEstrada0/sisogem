import { useState, useEffect, useContext } from 'react'
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
import { Tooltip } from 'antd'
import { UserRoleContext } from '../context/UserRoleContext'
import { OrganismoContext } from '../context/OrganismoContext'
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: 'AKIASAHHYXZDGGYMQIEG',
  secretAccessKey: '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',
  region: 'us-east-1',
})

const { SubMenu } = Menu
const { Dragger } = Upload
const { Column } = Table

const UploadCard = () => {
  const { organismo } = useContext(OrganismoContext)

  const [selectedMenuItem, setSelectedMenuItem] = useState('option1')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [menuText, setMenuText] = useState(
    'Denominacion del Instrumento Normativo',
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [menuOptionSelected, setMenuOptionSelected] = useState(false)
  const [deleteFileUid, setDeleteFileUid] = useState(null)
  const { currentUser } = useContext(UserRoleContext)
  const itemsPerPage = 5

  useEffect(() => {
    // Cargar archivos existentes al cargar el componente
    loadExistingFiles()
  }, [selectedMenuItem]) // Actualiza la lista cuando cambia la opción del menú

  const loadExistingFiles = async () => {
    try {
      const params = {
        Bucket: organismo,
        Prefix: selectedMenuItem, // Filtrar por la opción del menú actual
      }

      const data = await s3.listObjectsV2(params).promise()

      const files = data.Contents.map((content) => ({
        name: content.Key.split('/').pop(), // Obtener el nombre del archivo del Key
        url: s3.getSignedUrl('getObject', {
          Bucket: organismo,
          Key: content.Key,
        }),
        option: selectedMenuItem,
      }))

      setUploadedFiles(files)
    } catch (error) {
      console.error('Error loading existing files from S3:', error)
      message.error('Error al cargar los archivos existentes de S3.')
    }
  }

  const handleMenuClick = (e) => {
    setSelectedMenuItem(e.key)
    setMenuText(e.item.props.children)
    setMenuOptionSelected(true)
  }

  const handleFileUpload = async (info) => {
    setIsLoading(true)

    if (!menuOptionSelected) {
      message.error(
        'Por favor selecciona una opción del menú antes de subir un archivo.',
      )
      setIsLoading(false)
      return
    }

    try {
      if (info.file.status === 'done') {
        const file = info.file.originFileObj

        const params = {
          Bucket: organismo,
          Key: `${selectedMenuItem}/${file.name}`, // Puedes personalizar la clave según tus necesidades
          Body: file,
          ACL: 'public-read', // Establece el acl como público
        }

        const uploadedFile = await s3.upload(params).promise()

        message.success(`${info.file.name} El archivo se subió con éxito.`)
        setUploadedFiles([
          ...uploadedFiles,
          {
            ...info.file,
            url: uploadedFile.Location,
            option: selectedMenuItem,
          },
        ])
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} Error al Subir el Archivo.`)
      }
    } catch (error) {
      console.error('Error uploading file to S3:', error)
      message.error('Error al subir el archivo a S3.')
    }

    setIsLoading(false)
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
                    {currentUser?.roles === 'Secretario Técnico' && (
                      <a onClick={() => showDeleteConfirm(record.uid)}>
                        Eliminar
                      </a>
                    )}
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
