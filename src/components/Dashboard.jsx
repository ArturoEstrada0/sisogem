import React, { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import "./Dashboard.css";
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
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "antd/dist/reset.css"; // Importa el CSS de Ant Design
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Entidad from "./Entidad";
import MarcoNormativo from "./MarcoNormativo";
import OrganoGobierno from "./OrganoGobierno";
import SesionesProgramadas from "./SesionesProgramadas";
import SesionProgreso from "./SesionProgreso";
import Archivo from "./Archivo";
import Formatos from "./Formatos";
import Indicadores from "./Indicadores";
import Repositorio from "./Repositorio";
import BuzonReportes from "./BuzonReportes";
import EscudoImg from "../assets/img/Escudo.png";

const { Sider, Content } = Layout;

const menuItems = [
  { path: "/entidad", text: "Entidad", icon: <HomeOutlined /> },
  { path: "/marco-normativo", text: "Marco Normativo", icon: <BookOutlined /> },
  {
    path: "/organos-de-gobierno",
    text: "Órganos de Gobierno",
    icon: <BankOutlined />,
  },
  {
    path: "/sesiones-programadas",
    text: "Sesiones programadas",
    icon: <CalendarOutlined />,
  },
  {
    path: "/sesion-en-progreso",
    text: "Sesión en progreso",
    icon: <ClockCircleOutlined />,
  },
  { path: "/archivo", text: "Archivo", icon: <FileOutlined /> },
  { path: "/formatos", text: "Formatos", icon: <UnorderedListOutlined /> },
  { path: "/indicadores", text: "Indicadores", icon: <BarChartOutlined /> },
  { path: "/repositorio", text: "Repositorio", icon: <ReadOutlined /> },
  {
    path: "/buzon-de-reportes",
    text: "Buzón de Reportes",
    icon: <MailOutlined />,
  },
];

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    toast.info("¡Bienvenido al sistema!", {
      position: "top-center",
      autoClose: 2000,
    });
  }, []);

  return (
    <Layout style={{ minHeight: "calc(100vh-70px)", background: "#fff" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        style={{ background: "#cccccc40" }}
        theme="dark"
      >
        <Menu
          theme="dark"
          mode="vertical"
          selectedKeys={[location.pathname]}
          style={{ background: "#fff" }}
        >
          {menuItems.map((item) => (
            <Menu.Item
              key={item.path}
              icon={item.icon}
              style={{
                backgroundColor:
                  item.path === location.pathname ? "#6A0F49" : "#fff", // Fondo morado cuando seleccionado, blanco cuando no
                color: item.path === location.pathname ? "#fff" : "black", // Texto blanco cuando seleccionado, negro cuando no
              }}
            >
              <Link to={item.path}>{item.text}</Link>
            </Menu.Item>
          ))}
        </Menu>
        <div style={{ textAlign: "center", marginTop: "35px" }}>
          <img src={EscudoImg} alt="Logo" style={{ width: "85px" }} />
        </div>
      </Sider>
      <Layout className="site-layout">
        <Content style={{ margin: "16px" }}>
          <Routes>
            <Route path="/entidad" element={<Entidad />} />
            <Route path="/marco-normativo" element={<MarcoNormativo />} />
            <Route path="/organos-de-gobierno" element={<OrganoGobierno />} />
            <Route
              path="/sesiones-programadas"
              element={<SesionesProgramadas />}
            />
            <Route path="/sesion-en-progreso" element={<SesionProgreso />} />
            <Route path="/archivo" element={<Archivo />} />
            <Route path="/formatos" element={<Formatos />} />
            <Route path="/indicadores" element={<Indicadores />} />
            <Route path="/repositorio" element={<Repositorio />} />
            <Route path="/buzon-de-reportes" element={<BuzonReportes />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Dashboard;
