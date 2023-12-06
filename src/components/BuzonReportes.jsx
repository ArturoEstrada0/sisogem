import { useState, useEffect, useContext } from 'react'
import {
  Typography,
  Input,
  Button,
  message,
  Select,
  Table,
  Tabs,
  Popconfirm,
} from 'antd'
import {
  SendOutlined,
  MailOutlined,
  QuestionCircleOutlined,
  FilePdfOutlined,
  FileImageOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import './BuzonReportes.css'
import { OrganismoContext } from '../context/OrganismoContext'
import { UserRoleContext } from '../context/UserRoleContext'

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const categories = [
  'Malfuncionamiento de la página',
  'Marco normativo',
  'Organos del gobierno',
  'Sesiones programadas',
  'Sesion en progreso',
  'Archivo',
  'Formatos',
  'Indicadores',
  'Repositorio',
  'Login',
]

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '77%',
    margin: '0 auto',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    background: '#cccccc40',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  mailIcon: {
    marginRight: '8px',
    marginTop: '-10px',
    fontSize: '40px',
    color: '#6A0F49',
  },
  input: {
    width: '100%',
    marginBottom: '16px',
    border: '1px solid #cccccc40',
  },
  select: {
    width: '100%',
    marginBottom: '16px',
    border: '1px solid #cccccc40',
  },
  submitButton: {
    width: '30%',
    background: '#6A0F49',
    border: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'white',
    marginTop: '16px',
  },
  infoText: {
    textAlign: 'center',
    marginTop: '30px',
    fontSize: '16px',
    color: '#524b4f',
  },
}

function BuzonReportes() {
  const { currentUser } = useContext(UserRoleContext);
  const { organismo, setOrganismo } = useContext(OrganismoContext);

  const [email, setEmail] = useState({
    subject: '',
    text: '',
    html: '',
    organismo: organismo,
  })


  useEffect(() => {
    if (organismo === "") {
      if (currentUser) setOrganismo(currentUser.organismo[0].code);
      else return;
    }
  }, [organismo, currentUser]);


  const [data, setData] = useState([])

  useEffect(() => {
    axios
      .get('http://localhost:3001/reportes')
      .then((response) => {
        const dataKeys = response.data.map((item) => ({
          ...item,
          key: item._id,
        }))
        setData(dataKeys)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  const [title, setTitle] = useState('')
  const [report, setReport] = useState('')
  const [category, setCategory] = useState('')
  const [isTitleFocused, setIsTitleFocused] = useState(false)
  const [isReportFocused, setIsReportFocused] = useState(false)
  const [isCategoryFocused, setIsCategoryFocused] = useState(false)

  const columns = [
    {
      title: 'Título',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Categoría',
      dataIndex: 'text',
      key: 'text',
    },
    {
      title: 'Fecha',
      dataIndex: 'sentAt',
      key: 'sentAt',
      render: (text) =>
        new Date(text).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
    },
  ]

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
    setEmail({ ...email, [e.target.name]: e.target.value })
  }
  const handleReportChange = (e) => {
    setReport(e.target.value)
    setEmail({ ...email, [e.target.name]: e.target.value })
  }
  const handleCategoryChange = (value) => {
    setCategory(value)
    setEmail({ ...email, text: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title || !report || !category) {
      message.error(
        'Por favor, completa todos los campos antes de enviar el reporte.',
      )
    } else {
      axios
        .post('http://localhost:3001/email', email)
        .then(() => {
          message.success('Reporte enviado con éxito.')
          setTitle('')
          setReport('')
          setCategory('')
        })
        .catch(() => {
          message.error(
            'Ha ocurrido un error al enviar el reporte. Por favor, intenta de nuevo.',
          )
        })
    }
  }

  return (
    <>
      <Tabs tabPosition={'left'}>
      <TabPane
      tab={<span style={{ color: '#000000' }}>Nuevo Reporte</span>}
       key='1'
            >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '30px',
            }}>
            <div style={styles.container}>
              <div style={styles.titleContainer}>
                <MailOutlined style={styles.mailIcon} />
                <Typography.Title level={2} style={{ color: '#6A0F49' }}>
                  Crear un reporte
                </Typography.Title>
              </div>
              <Input
                placeholder='Título del Reporte'
                value={title}
                onChange={handleTitleChange}
                name='subject'
                type='text'
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setIsTitleFocused(false)}
                style={{
                  ...styles.input,
                  border: isTitleFocused
                    ? '2px solid #F1CDD3'
                    : '2px solid #d9d9d9',
                }}
              />
              <Select
                placeholder='Selecciona la categoría de tu reporte'
                value={category || undefined}
                onChange={handleCategoryChange}
                name='text'
                onFocus={() => setIsCategoryFocused(true)}
                onBlur={() => setIsCategoryFocused(false)}
                style={{
                  ...styles.select,
                  border: isCategoryFocused
                    ? '2px solid #F1CDD3'
                    : '2px solid #d9d9d9',
                }}>
                {categories.map((item) => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
              <TextArea
                rows={6}
                placeholder='Ingresa tu reporte'
                value={report}
                onChange={handleReportChange}
                name='html'
                onFocus={() => setIsReportFocused(true)}
                onBlur={() => setIsReportFocused(false)}
                style={{
                  ...styles.input,
                  border: isReportFocused
                    ? '2px solid #F1CDD3'
                    : '2px solid #d9d9d9',
                }}
              />
              <Button
                icon={<SendOutlined />}
                onClick={handleSubmit}
                style={styles.submitButton}>
                Enviar Reporte
              </Button>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '70%',
                margin: '0 auto',
                padding: '10px',
              }}>
              <h1 style={styles.infoText}>
                <p style={{ textAlign: 'justify' }}>
                  Queremos que sepas que tus reportes son completamente
                  anónimos. Tu privacidad es nuestra prioridad y hemos
                  implementado medidas para garantizar que tu identidad esté
                  protegida. Puedes compartir tus inquietudes con confianza, ya
                  que solo utilizaremos la información para abordar y resolver
                  los problemas.
                </p>
                Agradecemos tu colaboración y confianza.
                <br /> <br />
                Saludos Coordiales: SISOGEM
              </h1>
            </div>
          </div>
        </TabPane>
        <TabPane
          tab={<span style={{ color: '#000000' }}>Historial de Reportes</span>}
           key='2'
            >
          <Table
            columns={columns}
            expandable={{
              expandedRowRender: (record) => (
                <p
                  style={{
                    margin: 0,
                  }}>
                  {record.html}
                </p>
              ),
              rowExpandable: (record) => record.html !== undefined,
            }}
            dataSource={data}
          />
        </TabPane>
      </Tabs>
    </>
  )
}

export default BuzonReportes
