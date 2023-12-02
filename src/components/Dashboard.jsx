import React, { useState, useEffect } from 'react'
import { Auth } from 'aws-amplify'
import { Layout, Menu } from 'antd'
import { UserService } from '../services/UserService'
import './Dashboard.css'
import {
  HomeOutlined,
  BookOutlined,
  BankOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  ReadOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import 'antd/dist/reset.css' // Importa el CSS de Ant Design
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Entidad from './Entidad'
import MarcoNormativo from './MarcoNormativo'
import OrganoGobierno from './OrganoGobierno'
import SesionesProgramadas from './SesionesProgramadas'
import SesionProgreso from './SesionProgreso'
import Archivo from './Archivo'
import Formatos from './Formatos'
import Indicadores from './Indicadores'
import Repositorio from './Repositorio'
import BuzonReportes from './BuzonReportes'
import EscudoImg from '../assets/img/Escudo.png'
import { useContext } from 'react'
import { UserRoleContext } from '../context/UserRoleContext'
import ProgramarSesion from './ProgramarSesion'

const { Sider, Content } = Layout

const menuItems = [
  { path: '/entidad', text: 'Entidad', icon: <HomeOutlined /> },
  { path: '/marco-normativo', text: 'Marco Normativo', icon: <BookOutlined /> },
  {
    path: '/organos-de-gobierno',
    text: 'Miembros de la junta',
    icon: <BankOutlined />,
  },
  {
    path: '/programar-sesion',
    text: 'Sesiones programadas',
    icon: <CalendarOutlined />,
  },

  { path: '/archivo', text: 'Archivo', icon: <FileOutlined /> },
  { path: '/formatos', text: 'Formatos', icon: <UnorderedListOutlined /> },
  { path: '/indicadores', text: 'Indicadores', icon: <BarChartOutlined /> },
  { path: '/repositorio', text: 'Repositorio', icon: <ReadOutlined /> },
  {
    path: '/buzon-de-reportes',
    text: 'Buzón de Reportes',
    icon: <MailOutlined />,
  },
]

function Dashboard({ userRole }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { setCurrentUser } = useContext(UserRoleContext)

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  /*useEffect(() => {
    toast.info("¡Bienvenido al sistema!", {
      position: "top-center",
      autoClose: 2000,
    });
  }, []);
  */

  const updateCurrentUserContext = async () => {
    const { attributes } = await Auth.currentAuthenticatedUser()
    const response = await UserService.getUserInfoByEmail(attributes.email)
    setCurrentUser(response)
  }

  useEffect(() => {
    updateCurrentUserContext()
  }, [])

  return (
    <Layout
      style={{
        minHeight: 'calc(90.5vh - 1px)',
        background: '#fff',
        width: '100%',
      }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        style={{ background: '#cccccc40' }}
        theme='dark'>
        <Menu
          theme='dark'
          mode='vertical'
          selectedKeys={[location.pathname]}
          style={{ background: '#fff' }}>
          {menuItems.map((item) => (
            <Menu.Item
              key={item.path}
              icon={item.icon}
              style={{
                backgroundColor:
                  item.path === location.pathname ? '#6A0F49' : '#fff',
                color: item.path === location.pathname ? '#fff' : 'black',
              }}>
              {/* Apply the style to remove underline */}
              <Link to={item.path} style={{ textDecoration: 'none' }}>
                {item.text}
              </Link>
            </Menu.Item>
          ))}
        </Menu>
        <div style={{ textAlign: 'center', marginTop: '43px' }}>
          <img src={EscudoImg} alt='Logo' style={{ width: '85px' }} />
        </div>
      </Sider>
      <Layout className='site-layout'>
        <Content style={{ margin: '16px' }}>
          <Routes>
            <Route path='/entidad' element={<Entidad />} />
            <Route path='/marco-normativo' element={<MarcoNormativo />} />
            <Route path='/organos-de-gobierno' element={<OrganoGobierno />} />
            <Route path='/programar-sesion' element={<ProgramarSesion />} />
            <Route path='/archivo' element={<Archivo />} />
            <Route path='/formatos' element={<Formatos />} />
            <Route path='/indicadores' element={<Indicadores />} />
            <Route path='/repositorio' element={<Repositorio />} />
            <Route path='/buzon-de-reportes' element={<BuzonReportes />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default Dashboard
